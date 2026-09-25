"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Loader,
  Check,
  ChevronRight,
  ShieldCheck,
  Clock,
  Calendar,
  Lock,
} from "lucide-react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";

// Fixed backend conversion. 1 vote = $1 USD = ₦1500 NGN.
// Paystack is charged in NGN; the user always sees USD.
const USD_TO_NGN = 1500;
const PRICE_PER_VOTE_USD = 1;
const PRICE_PER_VOTE_NGN = PRICE_PER_VOTE_USD * USD_TO_NGN;

const quickVotes = [10, 25, 50, 100, 250, 500];

/* ------------------------------------------------------------------
   Compute the voting window status from classicqueen.vote_start/end.
------------------------------------------------------------------ */
function computeVotingWindow(voteStart, voteEnd) {
  const now = Date.now();
  const start = voteStart ? new Date(voteStart).getTime() : null;
  const end = voteEnd ? new Date(voteEnd).getTime() : null;

  // Both null → no schedule set
  if (!start && !end) {
    return { state: "no-window" };
  }

  // Start is in the future → hasn't opened yet
  if (start && now < start) {
    return { state: "not-started", start: new Date(start) };
  }

  // End is in the past → closed
  if (end && now >= end) {
    return { state: "closed", end: new Date(end) };
  }

  // Otherwise open
  return { state: "open" };
}

/* Friendly format: "January 15, 2026 at 9:00 AM" */
function formatDate(date) {
  if (!date) return "";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function VoteModal({
  isOpen,
  onClose,
  candidate,
  onVoteSuccess,
  onVoteError,
}) {
  const supabase = createClient();

  const [voteCount, setVoteCount] = useState(10);
  const [customVotes, setCustomVotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [guestInfo, setGuestInfo] = useState({ email: "", name: "" });
  const [currentUser, setCurrentUser] = useState(null);
  const [paymentStep, setPaymentStep] = useState("selection");
  const [error, setError] = useState("");
  const [paystackLoaded, setPaystackLoaded] = useState(false);
  const [shouldScroll, setShouldScroll] = useState(false);
  const [paymentError, setPaymentError] = useState({
    show: false,
    message: "",
    suggestion: "",
  });

  // Voting window
  const [windowStatus, setWindowStatus] = useState(null);
  const [windowLoading, setWindowLoading] = useState(true);

  const payButtonRef = useRef(null);
  const customTimerRef = useRef(null);

  const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

  // Fetch voting window from classicqueen table when modal opens
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    (async () => {
      setWindowLoading(true);
      try {
        const { data, error } = await supabase
          .from("classicqueen")
          .select("vote_start, vote_end")
          .limit(1)
          .maybeSingle();

        if (cancelled) return;

        if (error) {
          console.error("Voting window fetch error:", error.message);
          setWindowStatus({ state: "open" });
        } else {
          setWindowStatus(
            computeVotingWindow(data?.vote_start, data?.vote_end)
          );
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Voting window fetch failed:", err);
          setWindowStatus({ state: "open" });
        }
      } finally {
        if (!cancelled) setWindowLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, supabase]);

  // Load auth user when modal opens
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!cancelled) setCurrentUser(data?.user ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen, supabase]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setVoteCount(10);
      setCustomVotes("");
      setProcessing(false);
      setGuestInfo({ email: "", name: "" });
      setPaymentStep("selection");
      setError("");
      setShouldScroll(false);
      setPaymentError({ show: false, message: "", suggestion: "" });
      setWindowStatus(null);
      setWindowLoading(true);
      if (customTimerRef.current) clearTimeout(customTimerRef.current);
    }
  }, [isOpen]);

  // Load Paystack inline script once — only when the window is open
  useEffect(() => {
    if (!isOpen || paystackLoaded) return;
    if (windowStatus?.state !== "open") return;
    if (window.PaystackPop) {
      setPaystackLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => {
      if (window.PaystackPop) setPaystackLoaded(true);
    };
    script.onerror = () => {
      setError("Failed to load payment system.");
    };
    document.head.appendChild(script);
  }, [isOpen, paystackLoaded, windowStatus?.state]);

  // Auto-scroll to pay button
  useEffect(() => {
    if (shouldScroll && payButtonRef.current) {
      const t = setTimeout(() => {
        payButtonRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        setShouldScroll(false);
      }, 250);
      return () => clearTimeout(t);
    }
  }, [shouldScroll]);

  const handleQuickVoteSelect = (votes) => {
    setVoteCount(votes);
    setCustomVotes("");
    setShouldScroll(true);
  };

  const handleCustomVoteChange = (e) => {
    const v = e.target.value.replace(/\D/g, "");
    setCustomVotes(v);
    if (v) setVoteCount(parseInt(v, 10));

    if (customTimerRef.current) clearTimeout(customTimerRef.current);
    if (v) {
      customTimerRef.current = setTimeout(() => {
        setShouldScroll(true);
      }, 2000);
    }
  };

  const processPaystackPayment = () => {
    if (!window.PaystackPop) {
      setError("Payment system not loaded.");
      setProcessing(false);
      return;
    }

    const email = currentUser?.email || guestInfo.email;
    if (!email) {
      setError("Please enter your email address.");
      setProcessing(false);
      return;
    }

    const name =
      currentUser?.user_metadata?.full_name || guestInfo.name || "Voter";
    const totalUSD = voteCount * PRICE_PER_VOTE_USD;
    const totalNGN = voteCount * PRICE_PER_VOTE_NGN;
    const amountKobo = Math.round(totalNGN * 100);
    const reference = `VOTE_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 10)}`;

    try {
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email,
        amount: amountKobo,
        currency: "NGN",
        ref: reference,
        metadata: {
          custom_fields: [
            {
              display_name: "Voter Name",
              variable_name: "voter_name",
              value: name,
            },
            {
              display_name: "Candidate",
              variable_name: "candidate",
              value: candidate?.username,
            },
            {
              display_name: "Votes",
              variable_name: "votes",
              value: String(voteCount),
            },
            {
              display_name: "Amount (USD)",
              variable_name: "amount_usd",
              value: totalUSD.toFixed(2),
            },
          ],
        },
        callback: (response) => {
          handlePaymentSuccess({
            reference: response.reference,
            totalUSD,
            totalNGN,
            email,
            name,
          });
        },
        onClose: () => {
          setProcessing(false);
          setError("Payment cancelled.");
        },
      });

      handler.openIframe();
    } catch {
      setError("Failed to initialize payment.");
      setProcessing(false);
    }
  };

  const processPayment = () => {
    if (windowStatus?.state !== "open") {
      setError("Voting is not currently open.");
      return;
    }
    if (voteCount < 1) {
      setError("Please select or enter a valid number of votes.");
      return;
    }
    if (!currentUser && !guestInfo.email) {
      setError("Please enter your email address.");
      return;
    }
    if (!paystackLoaded) {
      setError("Payment system is loading. Please wait…");
      return;
    }

    setProcessing(true);
    setError("");
    setPaymentStep("processing");
    processPaystackPayment();
  };

  const handlePaymentSuccess = async ({
    reference,
    totalUSD,
    totalNGN,
    email,
    name,
  }) => {
    try {
      const row = {
        user_id: currentUser?.id ?? null,
        guest_email: currentUser ? null : email,
        guest_name: currentUser ? null : name,
        candidate_id: candidate.id,
        package_name: `${voteCount} Vote${voteCount > 1 ? "s" : ""}`,
        votes: voteCount,
        price_per_vote: PRICE_PER_VOTE_USD,
        total_amount: totalUSD,
        currency: "USD",
        payment_method: "paystack",
        payment_provider: "paystack",
        payment_id: reference,
        reference,
        status: "completed",
        metadata: {
          amount_usd: totalUSD,
          amount_ngn_charged: totalNGN,
          usd_to_ngn_rate: USD_TO_NGN,
        },
      };

      const { error: insertError } = await supabase
        .from("vote_transactions")
        .insert(row);

      if (insertError) throw insertError;

      setPaymentStep("success");
      setProcessing(false);

      if (onVoteSuccess) {
        onVoteSuccess(voteCount, `$${totalUSD.toFixed(2)}`);
      }

      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (err) {
      console.error("Vote insert failed:", err);
      setError("Payment verified but vote could not be saved: " + err.message);
      setPaymentStep("selection");
      setProcessing(false);
      if (onVoteError) onVoteError(err.message);
    }
  };

  const totalUSD = voteCount * PRICE_PER_VOTE_USD;

  // Which view to render inside the modal body
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-start justify-center p-3 pt-12 pb-16 overflow-y-auto bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-gradient-to-b from-[#1a0d02] to-black rounded-xl border border-[#9A7B4F]/30 overflow-hidden my-auto"
            style={{
              maxWidth: "420px",
              height: "min(80vh, 640px)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <div
              className="p-3 border-b border-[#9A7B4F]/30 flex items-center justify-between sticky top-0 z-10 flex-shrink-0"
              style={{
                background: "linear-gradient(90deg, #6b4423, #9A7B4F)",
              }}
            >
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 min-w-0">
                <span
                  className="relative flex-shrink-0"
                  style={{ width: "32px", height: "32px" }}
                >
                  <Image
                    src="/cqi.png"
                    alt="Classic Queen International"
                    fill
                    sizes="32px"
                    style={{ objectFit: "contain" }}
                    priority
                  />
                </span>
                <span className="truncate">
                  Vote for {candidate?.full_name || candidate?.username}
                </span>
              </h2>

              <div className="flex items-center gap-3 flex-shrink-0">
                <div
                  className="rounded-full overflow-hidden border-2 border-white/40 bg-black/30 flex-shrink-0"
                  style={{ width: "52px", height: "52px" }}
                >
                  {candidate?.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={candidate.photo}
                      alt={candidate?.full_name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  ) : (
                    <span
                      className="relative block"
                      style={{ width: "100%", height: "100%" }}
                    >
                      <Image
                        src="/cqi.png"
                        alt="Classic Queen"
                        fill
                        sizes="52px"
                        style={{ objectFit: "contain", padding: "8px" }}
                      />
                    </span>
                  )}
                </div>

                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {view === "loading" && (
                <div className="p-10 text-center">
                  <Loader className="w-8 h-8 text-[#c9a227] animate-spin mx-auto mb-3" />
                  <p className="text-white/60 text-xs">
                    Checking voting schedule…
                  </p>
                </div>
              )}

              {view === "blocked" && <BlockedView status={windowStatus} />}

              {view === "success" && (
                <div className="p-6 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3"
                  >
                    <Check className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    Vote Cast Successfully!
                  </h3>
                  <p className="text-white/60 text-xs mb-3">
                    You've cast {voteCount} vote{voteCount > 1 ? "s" : ""} for{" "}
                    {candidate?.full_name || `@${candidate?.username}`}
                  </p>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-yellow-400 font-semibold text-base">
                      Total: ${totalUSD.toFixed(2)}
                    </p>
                  </div>
                </div>
              )}

              {view === "processing" && (
                <div className="p-10 text-center">
                  <Loader className="w-8 h-8 text-[#c9a227] animate-spin mx-auto mb-3" />
                  <p className="text-white text-sm font-medium">
                    Verifying payment…
                  </p>
                  <p className="text-white/40 text-xs mt-1">
                    Please do not close this window.
                  </p>
                </div>
              )}

              {view === "form" && (
                <>
                  {/* Quick Vote */}
                  <div className="p-3 border-b border-[#9A7B4F]/20">
                    <label className="block text-xs font-medium text-white/80 mb-2">
                      Select votes for{" "}
                      {candidate?.full_name || `@${candidate?.username}`}
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {quickVotes.map((votes) => (
                        <button
                          key={votes}
                          onClick={() => handleQuickVoteSelect(votes)}
                          className={`p-2 rounded-lg border transition-all ${
                            voteCount === votes && !customVotes
                              ? "border-[#c9a227] bg-[#c9a227]/15"
                              : "border-[#9A7B4F]/25 hover:border-[#9A7B4F]/60 bg-white/5"
                          }`}
                        >
                          <span className="block text-base font-bold text-white">
                            {votes}
                          </span>
                          <span className="text-[10px] text-[#c9a227]">
                            ${votes}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom */}
                  <div className="p-3 border-b border-[#9A7B4F]/20">
                    <label className="block text-xs font-medium text-white/80 mb-1">
                      Or enter a custom amount
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={customVotes}
                      onChange={handleCustomVoteChange}
                      placeholder="Enter number of votes"
                      className="w-full px-3 py-2 bg-white/5 border border-[#9A7B4F]/30 rounded-lg text-base text-white placeholder-white/40 focus:border-[#c9a227] focus:outline-none text-center"
                    />
                    <p className="text-[10px] text-[#c9a227]/80 text-center mt-1">
                      $1 = 1 vote
                    </p>
                  </div>

                  {/* Summary */}
                  <div className="p-3 border-b border-[#9A7B4F]/20">
                    <div className="bg-white/5 rounded-lg p-3 border border-[#9A7B4F]/20">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-white/60">Votes:</span>
                        <span className="text-xl font-bold text-white">
                          {voteCount}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-white/60">Total:</span>
                        <span className="text-lg font-bold text-[#c9a227]">
                          ${totalUSD.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Guest info */}
                  {!currentUser && (
                    <div className="p-3 border-b border-[#9A7B4F]/20 space-y-2">
                      <label className="block text-xs font-medium text-white/80">
                        Your Information
                      </label>
                      <input
                        type="email"
                        placeholder="Email address *"
                        value={guestInfo.email}
                        onChange={(e) =>
                          setGuestInfo({ ...guestInfo, email: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-white/5 border border-[#9A7B4F]/30 rounded-lg text-xs text-white placeholder-white/40 focus:border-[#c9a227] focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Your name (optional)"
                        value={guestInfo.name}
                        onChange={(e) =>
                          setGuestInfo({ ...guestInfo, name: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-white/5 border border-[#9A7B4F]/30 rounded-lg text-xs text-white placeholder-white/40 focus:border-[#c9a227] focus:outline-none"
                      />
                    </div>
                  )}

                  {/* Trust line */}
                  <div className="px-3 py-2">
                    <div className="flex items-center gap-2 bg-[#9A7B4F]/10 border border-[#9A7B4F]/30 rounded-lg p-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#c9a227] flex-shrink-0" />
                      <span className="text-[#c9a227] text-[11px]">
                        Secure payment · Cards accepted worldwide
                      </span>
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="px-3 py-1">
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                        <p className="text-xs text-red-400">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Pay button */}
                  <div ref={payButtonRef} className="p-3">
                    <button
                      onClick={processPayment}
                      disabled={
                        processing || (!currentUser && !guestInfo.email)
                      }
                      className="
                        w-full py-3 text-white rounded-lg text-sm font-semibold
                        flex items-center justify-center gap-2
                        transition-all duration-300
                        disabled:opacity-50 disabled:cursor-not-allowed
                        hover:brightness-110
                      "
                      style={{
                        background:
                          "linear-gradient(135deg, #9A7B4F 0%, #6b4423 100%)",
                        boxShadow: "0 10px 20px rgba(0,0,0,0.3)",
                      }}
                      onMouseEnter={(e) => {
                        if (!processing && (currentUser || guestInfo.email)) {
                          e.currentTarget.style.background =
                            "linear-gradient(135deg, #16a34a 0%, #15803d 100%)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          "linear-gradient(135deg, #9A7B4F 0%, #6b4423 100%)";
                      }}
                    >
                      {processing ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Processing…
                        </>
                      ) : (
                        <>
                          Pay ${totalUSD.toFixed(2)}
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <p className="text-[10px] text-white/40 text-center mt-2">
                      By proceeding, you agree to our Terms of Service
                    </p>
                  </div>
                </>
              )}
            </div>
          </motion.div>

          {/* Payment error popup */}
          <AnimatePresence>
            {paymentError.show && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                onClick={() =>
                  setPaymentError({ ...paymentError, show: false })
                }
              >
                <motion.div
                  initial={{ scale: 0.95, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-gradient-to-b from-[#1a0d02] to-black rounded-xl border border-[#9A7B4F]/30 p-6 max-w-md w-full"
                >
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                      <X className="w-8 h-8 text-red-400" />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white text-center mb-2">
                    Payment Failed
                  </h3>
                  <p className="text-white/80 text-center mb-4">
                    {paymentError.message}
                  </p>

                  <div className="bg-white/5 border border-[#9A7B4F]/20 rounded-lg p-3 mb-6">
                    <p className="text-sm text-white/60 text-center">
                      💡 {paymentError.suggestion}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setPaymentError({ ...paymentError, show: false })
                    }
                    className="w-full py-3 text-white rounded-lg font-semibold hover:brightness-110 transition-all"
                    style={{
                      background:
                        "linear-gradient(135deg, #9A7B4F 0%, #6b4423 100%)",
                    }}
                  >
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

/* ------------------------------------------------------------------
   BlockedView — shown when the voting window is not open.
------------------------------------------------------------------ */
function BlockedView({ status }) {
  // ---- No schedule configured ----
  if (status?.state === "no-window") {
    return (
      <div className="p-6 text-center">
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 p-[2px]"
          style={{
            background:
              "conic-gradient(from 45deg, #7a5c14, #f9e79f, #c9a227, #fff4c2, #8a6a1a, #f5d76e, #7a5c14)",
          }}
        >
          <div className="flex items-center justify-center w-full h-full rounded-full bg-[#1a0d02]">
            <Lock size={26} className="text-[#c9a227]" />
          </div>
        </div>

        <h3 className="text-lg font-bold text-white mb-2">
          Voting Line Closed
        </h3>
        <p className="text-sm text-white/70 leading-relaxed max-w-xs mx-auto">
          The voting line is currently closed. Watch out for announcements
          about when it will be reopened.
        </p>

        <div className="mt-6 bg-[#9A7B4F]/10 border border-[#9A7B4F]/30 rounded-lg p-3">
          <p className="text-[11px] text-[#c9a227] text-center">
            Keep an eye on this page — voting dates will be posted soon.
          </p>
        </div>
      </div>
    );
  }

  // ---- Start is in the future ----
  if (status?.state === "not-started") {
    return (
      <div className="p-6 text-center">
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 p-[2px]"
          style={{
            background:
              "conic-gradient(from 45deg, #7a5c14, #f9e79f, #c9a227, #fff4c2, #8a6a1a, #f5d76e, #7a5c14)",
          }}
        >
          <div className="flex items-center justify-center w-full h-full rounded-full bg-[#1a0d02]">
            <Calendar size={26} className="text-[#c9a227]" />
          </div>
        </div>

        <h3 className="text-lg font-bold text-white mb-2">
          Voting Starts Soon
        </h3>
        <p className="text-sm text-white/70 leading-relaxed max-w-xs mx-auto">
          The voting line hasn&apos;t opened yet. Get ready — it starts on:
        </p>

        <div className="mt-4 bg-white/5 border border-[#c9a227]/30 rounded-lg p-3">
          <p className="text-sm font-bold text-[#c9a227]">
            {formatDate(status.start)}
          </p>
        </div>

        <p className="text-[11px] text-white/40 mt-4">
          Come back on that date to cast your vote.
        </p>
      </div>
    );
  }

  // ---- End has passed ----
  if (status?.state === "closed") {
    return (
      <div className="p-6 text-center">
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 p-[2px]"
          style={{
            background:
              "conic-gradient(from 45deg, #7a5c14, #f9e79f, #c9a227, #fff4c2, #8a6a1a, #f5d76e, #7a5c14)",
          }}
        >
          <div className="flex items-center justify-center w-full h-full rounded-full bg-[#1a0d02]">
            <Clock size={26} className="text-[#c9a227]" />
          </div>
        </div>

        <h3 className="text-lg font-bold text-white mb-2">
          Voting Line Closed
        </h3>
        <p className="text-sm text-white/70 leading-relaxed max-w-xs mx-auto">
          The voting line has closed. Voting ended on:
        </p>

        <div className="mt-4 bg-white/5 border border-[#9A7B4F]/30 rounded-lg p-3">
          <p className="text-sm font-bold text-[#c9a227]">
            {formatDate(status.end)}
          </p>
        </div>

        <p className="text-[11px] text-white/40 mt-4">
          Thanks to everyone who voted. Stay tuned for results.
        </p>
      </div>
    );
  }

  return null;
}