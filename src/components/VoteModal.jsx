"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Loader, Check, ChevronRight, ShieldCheck, Clock, Calendar, Lock, Mail,
} from "lucide-react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { useNetworkError, isNetworkError } from "@/contexts/NetworkErrorContext";
import { normalizePaymentMethod } from "@/lib/paymentMethods";
import { getUserCurrency } from "@/lib/currency";
import PaymentMethodSelector from "@/components/vote/PaymentMethodSelector";
import PoweredByFooter from "@/components/vote/PoweredByFooter";

const PRICE_PER_VOTE_USD = 1;
const FLW_PUBLIC_KEY = process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY;
const quickVotes = [1, 5, 10, 15, 25, 50, 100, 250, 500];

function computeVotingWindow(voteStart, voteEnd) {
  const now = Date.now();
  const start = voteStart ? new Date(voteStart).getTime() : null;
  const end = voteEnd ? new Date(voteEnd).getTime() : null;
  if (!start && !end) return { state: "no-window" };
  if (start && now < start) return { state: "not-started", start: new Date(start) };
  if (end && now >= end) return { state: "closed", end: new Date(end) };
  return { state: "open" };
}

function formatDate(date) {
  if (!date) return "";
  return date.toLocaleString(undefined, {
    year: "numeric", month: "long", day: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

export default function VoteModal({ isOpen, onClose, candidate, onVoteSuccess, onVoteError }) {
  const supabase = createClient();
  const { reportNetworkError } = useNetworkError();

  const [voteCount, setVoteCount] = useState(1);
  const [customVotes, setCustomVotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [guestInfo, setGuestInfo] = useState({ email: "", name: "" });
  const [currentUser, setCurrentUser] = useState(null);
  const [paymentStep, setPaymentStep] = useState("selection");
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [error, setError] = useState("");
  const [flutterwaveLoaded, setFlutterwaveLoaded] = useState(false);
  const [shouldScroll, setShouldScroll] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletLoading, setWalletLoading] = useState(true);
  const [paymentError, setPaymentError] = useState({ show: false, message: "", suggestion: "" });
  const [emailPrompt, setEmailPrompt] = useState(false);
  const [guestWalletPrompt, setGuestWalletPrompt] = useState(false);
  const [windowStatus, setWindowStatus] = useState(null);
  const [windowLoading, setWindowLoading] = useState(true);

  // ---- Currency detection state ----
  const [userCurrency, setUserCurrency] = useState("USD");
  const [chargeAmount, setChargeAmount] = useState(null);
  const [fetchingRate, setFetchingRate] = useState(false);

  const payButtonRef = useRef(null);
  const customTimerRef = useRef(null);

  // Fetch voting window
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    (async () => {
      setWindowLoading(true);
      try {
        const { data, error } = await supabase.from("classicqueen").select("vote_start, vote_end").limit(1).maybeSingle();
        if (cancelled) return;
        if (error) {
          if (isNetworkError(error)) { reportNetworkError(); setWindowStatus(null); }
          else { console.error(error); setWindowStatus({ state: "open" }); }
        } else {
          setWindowStatus(computeVotingWindow(data?.vote_start, data?.vote_end));
        }
      } catch (err) {
        if (!cancelled) {
          if (isNetworkError(err)) { reportNetworkError(); setWindowStatus(null); }
          else setWindowStatus({ state: "open" });
        }
      } finally {
        if (!cancelled) setWindowLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isOpen, supabase, reportNetworkError]);

  // Auth + wallet
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    (async () => {
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (cancelled) return;
        if (authError && isNetworkError(authError)) { reportNetworkError(); setCurrentUser(null); return; }
        const user = authData?.user ?? null;
        setCurrentUser(user);
        if (user?.id) {
          setWalletLoading(true);
          const { data: wallet } = await supabase.from("wallets").select("balance").eq("user_id", user.id).maybeSingle();
          if (!cancelled) { setWalletBalance(Number(wallet?.balance ?? 0)); setWalletLoading(false); }
        } else setWalletLoading(false);
      } catch (err) {
        if (!cancelled) { if (isNetworkError(err)) reportNetworkError(); setWalletLoading(false); }
      }
    })();
    return () => { cancelled = true; };
  }, [isOpen, supabase, reportNetworkError]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setVoteCount(1); setCustomVotes(""); setProcessing(false); setGuestInfo({ email: "", name: "" });
      setPaymentStep("selection"); setPaymentMethod(null); setError(""); setShouldScroll(false);
      setPaymentError({ show: false, message: "", suggestion: "" }); setEmailPrompt(false);
      setGuestWalletPrompt(false); setWindowStatus(null); setWindowLoading(true);
      setWalletBalance(0); setWalletLoading(true);
      setUserCurrency("USD"); setChargeAmount(null); setFetchingRate(false);
      if (customTimerRef.current) clearTimeout(customTimerRef.current);
    }
  }, [isOpen]);

  // Load Flutterwave script
  useEffect(() => {
    if (!isOpen || flutterwaveLoaded) return;
    if (windowStatus?.state !== "open") return;
    if (window.FlutterwaveCheckout) { setFlutterwaveLoaded(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.flutterwave.com/v3.js";
    script.async = true;
    script.onload = () => { if (window.FlutterwaveCheckout) setFlutterwaveLoaded(true); };
    document.head.appendChild(script);
  }, [isOpen, flutterwaveLoaded, windowStatus?.state]);

  // ---- Fetch rate whenever voteCount + paymentMethod change (card only) ----
  useEffect(() => {
    if (paymentMethod !== "card") {
      setChargeAmount(null);
      return;
    }
    if (voteCount < 1) {
      setChargeAmount(null);
      return;
    }

    const totalUSD = voteCount * PRICE_PER_VOTE_USD;
    let cancelled = false;

    (async () => {
      const currency = getUserCurrency();
      setUserCurrency(currency);

      if (currency === "USD") {
        setChargeAmount(totalUSD);
        return;
      }

      setFetchingRate(true);
      try {
        const res = await fetch(`/api/get-rate?amount=${totalUSD}&from=${currency}`);
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok || !data.amount) {
          throw new Error(data.error || "Could not fetch exchange rate.");
        }
        setChargeAmount(data.amount);
      } catch (err) {
        if (cancelled) return;
        console.error("[vote-modal] rate fetch failed:", err);
        setChargeAmount(null);
        setError(err?.message || "Could not fetch exchange rate.");
      } finally {
        if (!cancelled) setFetchingRate(false);
      }
    })();

    return () => { cancelled = true; };
  }, [voteCount, paymentMethod]);

  // Auto-scroll
  useEffect(() => {
    if (shouldScroll && payButtonRef.current) {
      const t = setTimeout(() => {
        payButtonRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        setShouldScroll(false);
      }, 250);
      return () => clearTimeout(t);
    }
  }, [shouldScroll]);

  const handleQuickVoteSelect = (votes) => {
    setVoteCount(votes); setCustomVotes(""); setShouldScroll(true);
  };

  const handleCustomVoteChange = (e) => {
    const v = e.target.value.replace(/\D/g, "");
    setCustomVotes(v);
    if (v) setVoteCount(parseInt(v, 10));
    if (customTimerRef.current) clearTimeout(customTimerRef.current);
    if (v) {
      customTimerRef.current = setTimeout(() => setShouldScroll(true), 2000);
    }
  };

  // Wallet flow (via vote-verify with skip flag so it goes through one code path)
  const processWalletPayment = async () => {
    const totalUSD = voteCount * PRICE_PER_VOTE_USD;
    if (walletBalance < totalUSD) {
      setError(`Insufficient wallet balance. You have $${walletBalance.toFixed(2)}, need $${totalUSD.toFixed(2)}.`);
      setProcessing(false); setPaymentStep("selection"); return;
    }
    const reference = `VOTE_WALLET_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    try {
      const { data: spendResult, error: spendError } = await supabase.rpc("spend_wallet", {
        p_user_id: currentUser.id, p_amount: totalUSD, p_reference: reference,
        p_metadata: { candidate_id: candidate.id, candidate_username: candidate.username, votes: voteCount },
      });
      if (spendError) throw spendError;
      if (!spendResult?.success) throw new Error(spendResult?.error || "Failed to debit wallet");

      await handleExternalPaymentSuccess({
        reference,
        paymentId: reference,
        provider: "wallet",
        method: "wallet",
        rawMethod: null,
        rawResponse: null,
        totalUSD,
        currency: "USD",
        email: currentUser.email,
        name: currentUser.user_metadata?.full_name || "Member",
        skipFlutterwaveVerification: true,
      });
    } catch (err) {
      console.error("Wallet payment failed:", err);
      if (isNetworkError(err)) {
        reportNetworkError(); setPaymentStep("selection"); setProcessing(false);
        if (onVoteError) onVoteError(err?.message || "Network error"); return;
      }
      setError(err?.message || "Wallet payment failed."); setPaymentStep("selection"); setProcessing(false);
    }
  };

  // Card flow — opens Flutterwave with local currency
  const processCardPayment = () => {
    if (!window.FlutterwaveCheckout) {
      setError("Payment system not loaded."); setProcessing(false); setPaymentStep("selection"); return;
    }
    const email = currentUser?.email || guestInfo.email;
    const name = currentUser?.user_metadata?.full_name || guestInfo.name || "Voter";
    if (!email) {
      setError("Please enter your email address."); setProcessing(false); setPaymentStep("selection"); return;
    }
    if (chargeAmount == null) {
      setError("Exchange rate not ready. Please wait a moment.");
      setProcessing(false); setPaymentStep("selection"); return;
    }

    const totalUSD = voteCount * PRICE_PER_VOTE_USD;
    const reference = `VOTE_FLW_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

    try {
      window.FlutterwaveCheckout({
        public_key: FLW_PUBLIC_KEY,
        tx_ref: reference,
        amount: chargeAmount,
        currency: userCurrency,
        payment_options: "card",
        customer: { email, name },
        customizations: {
          title: "Vote — Classic Queen International",
          description: `${voteCount} vote${voteCount > 1 ? "s" : ""} for ${candidate?.full_name || candidate?.username}`,
          logo: "/cqi.png",
        },
        callback: (response) => {
          const normalized = normalizePaymentMethod(response.payment_type, "card");
          handleExternalPaymentSuccess({
            reference: response.tx_ref || reference,
            paymentId: response.transaction_id,
            provider: "flutterwave",
            method: normalized,
            rawMethod: response.payment_type || null,
            rawResponse: response,
            totalUSD,
            currency: userCurrency,
            email,
            name,
          });
        },
        onclose: () => {
          setProcessing(false); setPaymentStep("selection"); setError("Payment cancelled.");
        },
      });
    } catch (err) {
      console.error("Flutterwave init failed:", err);
      setError("Failed to initialize card payment.");
      setProcessing(false); setPaymentStep("selection");
    }
  };

  // Calls vote-verify Edge Function
  const handleExternalPaymentSuccess = async ({
    reference, paymentId, provider, method, rawMethod, rawResponse,
    totalUSD, currency, email, name, skipFlutterwaveVerification = false,
  }) => {
    try {
      const { data, error } = await supabase.functions.invoke("vote-verify", {
        body: {
          user_id: currentUser?.id ?? null,
          guest_email: currentUser ? null : email,
          guest_name: currentUser ? null : name,
          candidate_id: candidate.id,
          votes: voteCount,
          amount: totalUSD,
          currency: currency || "USD",
          tx_ref: reference,
          transaction_id: paymentId,
          payment_method: method,
          raw_payment_method: rawMethod,
          raw_gateway_response: rawResponse,
          skip_verification: skipFlutterwaveVerification,
        },
      });

      if (error) throw new Error(error.message || "Verification failed");
      if (!data?.success) throw new Error(data?.error || "Vote verification failed");

      setPaymentStep("success");
      setProcessing(false);
      if (onVoteSuccess) onVoteSuccess(voteCount, `$${totalUSD.toFixed(2)}`);
      setTimeout(() => onClose(), 2500);
    } catch (err) {
      console.error("Vote verification failed:", err);
      if (isNetworkError(err)) {
        reportNetworkError(); setPaymentStep("selection"); setProcessing(false);
        if (onVoteError) onVoteError(err?.message || "Network error"); return;
      }
      setError("Payment succeeded but vote could not be saved: " + err.message);
      setPaymentStep("selection"); setProcessing(false);
      if (onVoteError) onVoteError(err.message);
    }
  };

  const handleProceed = () => {
    if (windowStatus?.state !== "open") { setError("Voting is not currently open."); return; }
    if (voteCount < 1) { setError("Please select or enter a valid number of votes."); return; }
    if (!paymentMethod) { setError("Please choose a payment method."); return; }
    if (paymentMethod !== "wallet" && !currentUser && !guestInfo.email) { setEmailPrompt(true); return; }

    setError(""); setProcessing(true);

    if (paymentMethod === "wallet") {
      if (!currentUser) { setError("Please sign in to use your wallet."); setProcessing(false); return; }
      setPaymentStep("processing"); processWalletPayment();
    } else if (paymentMethod === "card") {
      if (!flutterwaveLoaded) { setError("Card payment system is loading. Please wait…"); setProcessing(false); return; }
      if (fetchingRate || chargeAmount == null) { setError("Fetching exchange rate. Please wait…"); setProcessing(false); return; }
      setPaymentStep("processing"); processCardPayment();
    }
  };

  const totalUSD = voteCount * PRICE_PER_VOTE_USD;
  const walletEnough = walletBalance >= totalUSD;

  let view;
  if (windowLoading) view = "loading";
  else if (windowStatus?.state !== "open") view = "blocked";
  else if (paymentStep === "success") view = "success";
  else if (paymentStep === "processing") view = "processing";
  else view = "form";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-start justify-center p-3 pt-12 pb-16 overflow-y-auto bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -20 }} onClick={(e) => e.stopPropagation()}
            className="w-full bg-gradient-to-b from-[#1a0d02] to-black rounded-xl border border-[#9A7B4F]/30 overflow-hidden my-auto"
            style={{ maxWidth: "420px", height: "min(85vh, 700px)", display: "flex", flexDirection: "column" }}
          >
            {/* Header */}
            <div className="p-3 border-b border-[#9A7B4F]/30 flex items-center justify-between sticky top-0 z-10 flex-shrink-0"
              style={{ background: "linear-gradient(90deg, #6b4423, #9A7B4F)" }}>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 min-w-0">
                <span className="relative flex-shrink-0" style={{ width: "32px", height: "32px" }}>
                  <Image src="/cqi.png" alt="CQI" fill sizes="32px" style={{ objectFit: "contain" }} priority />
                </span>
                <span className="truncate">Vote for {candidate?.full_name || candidate?.username}</span>
              </h2>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="rounded-full overflow-hidden border-2 border-white/40 bg-black/30 flex-shrink-0" style={{ width: "52px", height: "52px" }}>
                  {candidate?.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={candidate.photo} alt={candidate?.full_name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  ) : (
                    <span className="relative block" style={{ width: "100%", height: "100%" }}>
                      <Image src="/cqi.png" alt="CQ" fill sizes="52px" style={{ objectFit: "contain", padding: "8px" }} />
                    </span>
                  )}
                </div>
                <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-full transition-colors" aria-label="Close">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {view === "loading" && (
                <div className="p-10 text-center">
                  <Loader className="w-8 h-8 text-[#c9a227] animate-spin mx-auto mb-3" />
                  <p className="text-white/60 text-xs">Checking voting schedule…</p>
                </div>
              )}
              {view === "blocked" && <BlockedView status={windowStatus} />}
              {view === "success" && (
                <div className="p-6 text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Check className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-lg font-bold text-white mb-1">Vote Cast Successfully!</h3>
                  <p className="text-white/60 text-xs mb-3">
                    You&apos;ve cast {voteCount} vote{voteCount > 1 ? "s" : ""} for {candidate?.full_name || `@${candidate?.username}`}
                  </p>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-yellow-400 font-semibold text-base">Total: ${totalUSD.toFixed(2)}</p>
                  </div>
                </div>
              )}
              {view === "processing" && (
                <div className="p-10 text-center">
                  <Loader className="w-8 h-8 text-[#c9a227] animate-spin mx-auto mb-3" />
                  <p className="text-white text-sm font-medium">Verifying payment…</p>
                  <p className="text-white/40 text-xs mt-1">Please do not close this window.</p>
                  <button type="button" onClick={() => { setProcessing(false); setPaymentStep("selection"); setError(""); }}
                    className="mt-6 text-[11px] text-white/40 hover:text-white/70 underline transition">Cancel</button>
                </div>
              )}
              {view === "form" && (
                <>
                  <div className="p-3 border-b border-[#9A7B4F]/20">
                    <label className="block text-xs font-medium text-white/80 mb-2">
                      Select votes for {candidate?.full_name || `@${candidate?.username}`}
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {quickVotes.map((votes) => (
                        <button key={votes} onClick={() => handleQuickVoteSelect(votes)}
                          className={`p-2 rounded-lg border transition-all ${voteCount === votes && !customVotes ? "border-[#c9a227] bg-[#c9a227]/15" : "border-[#9A7B4F]/25 hover:border-[#9A7B4F]/60 bg-white/5"}`}>
                          <span className="block text-base font-bold text-white">{votes}</span>
                          <span className="text-[10px] text-[#c9a227]">${votes}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 border-b border-[#9A7B4F]/20">
                    <label className="block text-xs font-medium text-white/80 mb-1">Or enter a custom amount</label>
                    <input type="text" inputMode="numeric" value={customVotes} onChange={handleCustomVoteChange}
                      placeholder="Enter number of votes"
                      className="w-full px-3 py-2 bg-white/5 border border-[#9A7B4F]/30 rounded-lg text-base text-white placeholder-white/40 focus:border-[#c9a227] focus:outline-none text-center" />
                    <p className="text-[10px] text-[#c9a227]/80 text-center mt-1">$1 = 1 vote</p>
                  </div>
                  <div className="p-3 border-b border-[#9A7B4F]/20">
                    <div className="bg-white/5 rounded-lg p-3 border border-[#9A7B4F]/20">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-white/60">Votes:</span>
                        <span className="text-xl font-bold text-white">{voteCount}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-white/60">Total:</span>
                        <span className="text-lg font-bold text-[#c9a227]">${totalUSD.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  {!currentUser && (
                    <div className="p-3 border-b border-[#9A7B4F]/20 space-y-2">
                      <label className="block text-xs font-medium text-white/80">Your Information</label>
                      <input type="email" placeholder="Email address *" value={guestInfo.email}
                        onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                        className="w-full px-3 py-2 bg-white/5 border border-[#9A7B4F]/30 rounded-lg text-xs text-white placeholder-white/40 focus:border-[#c9a227] focus:outline-none" />
                      <input type="text" placeholder="Your name (optional)" value={guestInfo.name}
                        onChange={(e) => setGuestInfo({ ...guestInfo, name: e.target.value })}
                        className="w-full px-3 py-2 bg-white/5 border border-[#9A7B4F]/30 rounded-lg text-xs text-white placeholder-white/40 focus:border-[#c9a227] focus:outline-none" />
                    </div>
                  )}
                  <div className="p-3 border-b border-[#9A7B4F]/20">
                    <label className="block text-xs font-medium text-white/80 mb-2">Choose payment method</label>
                    <PaymentMethodSelector
                      method={paymentMethod}
                      onChange={(m) => {
                        if (m === "wallet" && !currentUser) { setGuestWalletPrompt(true); return; }
                        setPaymentMethod(m); setError("");
                      }}
                      isLoggedIn={!!currentUser}
                      walletBalance={walletBalance}
                      walletLoading={walletLoading}
                      walletEnough={walletEnough}
                      totalUSD={totalUSD}
                    />

                    {/* Show local charge preview for card */}
                    {paymentMethod === "card" && (
                      <div className="mt-2 rounded-lg border border-[#f97316]/30 bg-[#f97316]/8 px-2.5 py-2">
                        {fetchingRate ? (
                          <p className="text-[10px] text-white/75 leading-snug flex items-center gap-1.5">
                            <Loader size={10} className="animate-spin text-[#fb923c]" />
                            Fetching exchange rate…
                          </p>
                        ) : chargeAmount != null && userCurrency !== "USD" ? (
                          <p className="text-[10px] text-white/75 leading-snug">
                            You&apos;ll be charged{" "}
                            <span className="font-semibold text-[#fb923c]">
                              {chargeAmount.toLocaleString()} {userCurrency}
                            </span>{" "}
                            ≈ ${totalUSD.toFixed(2)}
                          </p>
                        ) : (
                          <p className="text-[10px] text-white/75 leading-snug">
                            Secured card payment, powered by{" "}
                            <span className="font-semibold text-white/90">Flutterwave</span>.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="px-3 py-2">
                    <div className="flex items-center gap-2 bg-[#9A7B4F]/10 border border-[#9A7B4F]/30 rounded-lg p-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#c9a227] flex-shrink-0" />
                      <span className="text-[#c9a227] text-[11px]">Secure payment · Cards accepted worldwide</span>
                    </div>
                  </div>
                  {error && (
                    <div className="px-3 py-1">
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                        <p className="text-xs text-red-400">{error}</p>
                      </div>
                    </div>
                  )}
                  <div ref={payButtonRef} className="p-3">
                    <button onClick={handleProceed}
                      disabled={
                        processing ||
                        !paymentMethod ||
                        (paymentMethod === "wallet" && !walletEnough) ||
                        (paymentMethod === "card" && (fetchingRate || chargeAmount == null))
                      }
                      className="w-full py-3 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110"
                      style={{ background: "linear-gradient(135deg, #9A7B4F 0%, #6b4423 100%)", boxShadow: "0 10px 20px rgba(0,0,0,0.3)" }}
                      onMouseEnter={(e) => {
                        if (!processing && paymentMethod && !(paymentMethod === "wallet" && !walletEnough)) {
                          e.currentTarget.style.background = "linear-gradient(135deg, #16a34a 0%, #15803d 100%)";
                        }
                      }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "linear-gradient(135deg, #9A7B4F 0%, #6b4423 100%)"; }}
                    >
                      {processing ? (<><Loader className="w-4 h-4 animate-spin" />Processing…</>) :
                        paymentMethod === "card" && fetchingRate ? (<><Loader className="w-4 h-4 animate-spin" />Fetching rate…</>) :
                        (<>Click to Pay ${totalUSD.toFixed(2)}<ChevronRight className="w-4 h-4" /></>)
                      }
                    </button>
                    <PoweredByFooter isLoggedIn={!!currentUser} />
                  </div>
                </>
              )}
            </div>
          </motion.div>

          {/* Email-required popup */}
          <AnimatePresence>
            {emailPrompt && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                onClick={() => setEmailPrompt(false)}>
                <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                  transition={{ type: "spring", stiffness: 260, damping: 22 }} onClick={(e) => e.stopPropagation()}
                  className="rounded-2xl p-[3px] max-w-[320px] w-full"
                  style={{ background: "conic-gradient(from 45deg, #7a5c14, #f9e79f, #c9a227, #fff4c2, #8a6a1a, #f5d76e, #7a5c14)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.6)" }}>
                  <div className="rounded-[13px] bg-[#1a0d02] p-6 text-center relative">
                    <button onClick={() => setEmailPrompt(false)} aria-label="Close"
                      className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition">
                      <X size={14} />
                    </button>
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full p-[2px]"
                      style={{ background: "conic-gradient(from 45deg, #7a5c14, #f9e79f, #c9a227, #fff4c2, #8a6a1a, #f5d76e, #7a5c14)" }}>
                      <div className="w-full h-full rounded-full bg-[#1a0d02] flex items-center justify-center">
                        <Mail size={26} className="text-[#f5d76e]" />
                      </div>
                    </div>
                    <h3 className="text-base font-bold mb-2"
                      style={{ background: "linear-gradient(135deg, #7a5c14, #c9a227, #f5d76e, #8a6a1a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                      Email Required
                    </h3>
                    <p className="text-xs text-white/70 leading-relaxed">
                      Please enter your email address in the <span className="text-[#c9a227] font-semibold">Your Information</span> section before proceeding to payment.
                    </p>
                    <button type="button" onClick={() => setEmailPrompt(false)}
                      className="mt-5 w-full py-2.5 rounded-lg text-white text-sm font-semibold transition hover:brightness-110"
                      style={{ background: "linear-gradient(135deg, #9A7B4F 0%, #6b4423 100%)", boxShadow: "0 6px 14px rgba(107,68,35,0.35)" }}>
                      Got it
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Guest wallet signup prompt */}
          <AnimatePresence>
            {guestWalletPrompt && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                onClick={() => setGuestWalletPrompt(false)}>
                <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                  transition={{ type: "spring", stiffness: 260, damping: 22 }} onClick={(e) => e.stopPropagation()}
                  className="rounded-2xl p-[3px] max-w-[340px] w-full"
                  style={{ background: "conic-gradient(from 45deg, #7a5c14, #f9e79f, #c9a227, #fff4c2, #8a6a1a, #f5d76e, #7a5c14)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.6)" }}>
                  <div className="rounded-[13px] bg-[#1a0d02] p-6 text-center relative">
                    <button onClick={() => setGuestWalletPrompt(false)} aria-label="Close"
                      className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition">
                      <X size={14} />
                    </button>
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full p-[2px]"
                      style={{ background: "conic-gradient(from 45deg, #7a5c14, #f9e79f, #c9a227, #fff4c2, #8a6a1a, #f5d76e, #7a5c14)" }}>
                      <div className="w-full h-full rounded-full bg-[#1a0d02] flex items-center justify-center">
                        <ShieldCheck size={26} className="text-[#f5d76e]" />
                      </div>
                    </div>
                    <h3 className="text-base font-bold mb-2"
                      style={{ background: "linear-gradient(135deg, #7a5c14, #c9a227, #f5d76e, #8a6a1a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                      Sign Up to Use Your Wallet
                    </h3>
                    <p className="text-xs text-white/75 leading-relaxed mb-1">
                      Sign up free, fund once, and vote in one tap — no cards or transfers needed.
                    </p>
                    <p className="text-[11px] text-[#c9a227] font-semibold mb-5">Fast. Easy. Secure.</p>
                    <div className="space-y-2">
                      <button type="button"
                        onClick={() => { setGuestWalletPrompt(false); onClose(); window.location.href = "/auth/signup"; }}
                        className="w-full py-2.5 rounded-lg text-white text-sm font-semibold transition hover:brightness-110"
                        style={{ background: "linear-gradient(135deg, #9A7B4F 0%, #6b4423 100%)", boxShadow: "0 6px 14px rgba(107,68,35,0.35)" }}>
                        Sign Up Now
                      </button>
                      <button type="button" onClick={() => setGuestWalletPrompt(false)}
                        className="w-full py-2.5 rounded-lg text-white/70 text-xs font-medium border border-white/15 hover:bg-white/5 hover:text-white transition">
                        Change Payment Method
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Payment error popup */}
          <AnimatePresence>
            {paymentError.show && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                onClick={() => setPaymentError({ ...paymentError, show: false })}>
                <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-gradient-to-b from-[#1a0d02] to-black rounded-xl border border-[#9A7B4F]/30 p-6 max-w-md w-full">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                      <X className="w-8 h-8 text-red-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white text-center mb-2">Payment Failed</h3>
                  <p className="text-white/80 text-center mb-4">{paymentError.message}</p>
                  <div className="bg-white/5 border border-[#9A7B4F]/20 rounded-lg p-3 mb-6">
                    <p className="text-sm text-white/60 text-center">💡 {paymentError.suggestion}</p>
                  </div>
                  <button onClick={() => setPaymentError({ ...paymentError, show: false })}
                    className="w-full py-3 text-white rounded-lg font-semibold hover:brightness-110 transition-all"
                    style={{ background: "linear-gradient(135deg, #9A7B4F 0%, #6b4423 100%)" }}>
                    Try Again
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function BlockedView({ status }) {
  if (status?.state === "no-window") {
    return (
      <div className="p-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 p-[2px]"
          style={{ background: "conic-gradient(from 45deg, #7a5c14, #f9e79f, #c9a227, #fff4c2, #8a6a1a, #f5d76e, #7a5c14)" }}>
          <div className="flex items-center justify-center w-full h-full rounded-full bg-[#1a0d02]">
            <Lock size={26} className="text-[#c9a227]" />
          </div>
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Voting Line Closed</h3>
        <p className="text-sm text-white/70 leading-relaxed max-w-xs mx-auto">
          The voting line is currently closed. Watch out for announcements about when it will be reopened.
        </p>
        <div className="mt-6 bg-[#9A7B4F]/10 border border-[#9A7B4F]/30 rounded-lg p-3">
          <p className="text-[11px] text-[#c9a227] text-center">Keep an eye on this page — voting dates will be posted soon.</p>
        </div>
      </div>
    );
  }
  if (status?.state === "not-started") {
    return (
      <div className="p-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 p-[2px]"
          style={{ background: "conic-gradient(from 45deg, #7a5c14, #f9e79f, #c9a227, #fff4c2, #8a6a1a, #f5d76e, #7a5c14)" }}>
          <div className="flex items-center justify-center w-full h-full rounded-full bg-[#1a0d02]">
            <Calendar size={26} className="text-[#c9a227]" />
          </div>
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Voting Starts Soon</h3>
        <p className="text-sm text-white/70 leading-relaxed max-w-xs mx-auto">
          The voting line hasn&apos;t opened yet. Get ready — it starts on:
        </p>
        <div className="mt-4 bg-white/5 border border-[#c9a227]/30 rounded-lg p-3">
          <p className="text-sm font-bold text-[#c9a227]">{formatDate(status.start)}</p>
        </div>
        <p className="text-[11px] text-white/40 mt-4">Come back on that date to cast your vote.</p>
      </div>
    );
  }
  if (status?.state === "closed") {
    return (
      <div className="p-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 p-[2px]"
          style={{ background: "conic-gradient(from 45deg, #7a5c14, #f9e79f, #c9a227, #fff4c2, #8a6a1a, #f5d76e, #7a5c14)" }}>
          <div className="flex items-center justify-center w-full h-full rounded-full bg-[#1a0d02]">
            <Clock size={26} className="text-[#c9a227]" />
          </div>
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Voting Line Closed</h3>
        <p className="text-sm text-white/70 leading-relaxed max-w-xs mx-auto">The voting line has closed. Voting ended on:</p>
        <div className="mt-4 bg-white/5 border border-[#9A7B4F]/30 rounded-lg p-3">
          <p className="text-sm font-bold text-[#c9a227]">{formatDate(status.end)}</p>
        </div>
        <p className="text-[11px] text-white/40 mt-4">Thanks to everyone who voted. Stay tuned for results.</p>
      </div>
    );
  }
  return null;
}