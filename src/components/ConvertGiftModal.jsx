"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Loader,
  Check,
  ArrowRightCircle,
  Sparkles,
  Coins,
  User as UserIcon,
  Search,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useNetworkError, isNetworkError } from "@/contexts/NetworkErrorContext";
import { formatPoints } from "@/lib/points";

export default function ConvertGiftModal({
  isOpen,
  onClose,
  candidate,
  onConverted,
}) {
  const supabase = createClient();
  const { reportNetworkError } = useNetworkError();

  const [amount, setAmount] = useState("");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  // Target selection (null = self)
  const [targetCandidate, setTargetCandidate] = useState(null);
  const [showTargetPicker, setShowTargetPicker] = useState(false);
  const [candidateSearch, setCandidateSearch] = useState("");
  const [candidateResults, setCandidateResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const balance = Number(candidate?.gift_balance_usd ?? 0);
  const amountNum = Number(amount) || 0;
  const votesToGet = Math.floor(amountNum);
  const remaining = Math.max(balance - amountNum, 0);
  const isValid = amountNum > 0 && amountNum <= balance;

  // Preset quick-pick amounts
  const presets = useMemo(() => {
    if (balance <= 0) return [];
    const options = [10, 20, 50, 100, 250, 500]
      .filter((v) => v <= balance)
      .slice(0, 4);
    if (!options.includes(Math.floor(balance)) && balance >= 1) {
      options.push(Math.floor(balance));
    }
    return Array.from(new Set(options));
  }, [balance]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setAmount("");
      setProcessing(false);
      setSuccess(false);
      setError("");
      setResult(null);
      setTargetCandidate(null);
      setShowTargetPicker(false);
      setCandidateSearch("");
      setCandidateResults([]);
    }
  }, [isOpen]);

  // Debounced candidate search
  useEffect(() => {
    if (!showTargetPicker) return;
    const q = candidateSearch.trim();
    if (q.length < 2) {
      setCandidateResults([]);
      return;
    }

    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await supabase
          .from("candidates")
          .select("id, username, full_name, country, photo")
          .eq("status", "Approved")
          .or(`full_name.ilike.%${q}%,username.ilike.%${q}%`)
          .neq("id", candidate?.id ?? "00000000-0000-0000-0000-000000000000")
          .limit(10);
        setCandidateResults(data ?? []);
      } catch (err) {
        if (isNetworkError(err)) reportNetworkError();
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [
    candidateSearch,
    showTargetPicker,
    supabase,
    candidate?.id,
    reportNetworkError,
  ]);

  const resetTargetPicker = useCallback(() => {
    setShowTargetPicker(false);
    setCandidateSearch("");
    setCandidateResults([]);
  }, []);

  const handleConvert = async () => {
    if (!isValid || !candidate?.id) return;
    setProcessing(true);
    setError("");

    try {
      const { data, error: rpcError } = await supabase.rpc(
        "convert_gift_to_votes",
        {
          p_candidate_id: candidate.id,
          p_amount_usd: amountNum,
          p_target_candidate_id: targetCandidate?.id ?? candidate.id,
          p_user_id: null,
        }
      );

      if (rpcError) throw rpcError;
      if (!data?.success) {
        throw new Error(data?.error || "Conversion failed");
      }

      setResult({
        ...data,
        target_full_name:
          targetCandidate?.full_name ||
          targetCandidate?.username ||
          candidate.full_name ||
          candidate.username,
        is_self:
          !targetCandidate || targetCandidate.id === candidate.id,
      });
      setSuccess(true);

      if (onConverted) onConverted(data);

      setTimeout(() => {
        onClose();
      }, 2600);
    } catch (err) {
      console.error("Convert gift failed:", err);
      if (isNetworkError(err)) {
        reportNetworkError();
      } else {
        setError(err?.message || "Could not convert. Please try again.");
      }
      setProcessing(false);
    }
  };

  const recipientName =
    targetCandidate?.full_name ||
    targetCandidate?.username ||
    "yourself";
  const isSelf = !targetCandidate;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          onClick={success ? undefined : onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-gradient-to-b from-[#1a0d02] to-black rounded-2xl border border-[#c9a227]/30 overflow-hidden"
            style={{ maxWidth: "440px", maxHeight: "min(92vh, 780px)", display: "flex", flexDirection: "column" }}
          >
            {/* Success view */}
            {success ? (
              <div className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Check className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-lg font-bold text-white mb-1">
                  Conversion Successful
                </h3>
                <p className="text-xs text-white/60 mb-5">
                  {result?.is_self
                    ? "Your gift points were converted into votes"
                    : `Votes sent to ${result?.target_full_name}`}
                </p>

                <div
                  className="rounded-xl border border-[#c9a227]/40 p-4 text-center"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(201,162,39,0.15) 0%, rgba(154,123,79,0.08) 100%)",
                  }}
                >
                  <p className="text-[10px] uppercase tracking-wider text-[#c9a227] font-semibold mb-1">
                    Votes Added
                  </p>
                  <p className="text-3xl font-bold text-[#f5d76e] mb-2">
                    +{result?.votes_awarded ?? 0}
                  </p>
                  {!result?.is_self && (
                    <p className="text-[11px] text-white/75 mb-2">
                      To{" "}
                      <span className="font-semibold text-[#f5d76e]">
                        {result?.target_full_name}
                      </span>
                    </p>
                  )}
                  <div className="flex items-center justify-center gap-3 text-[10px] text-white/60">
                    <span>
                      Converted:{" "}
                      <span className="text-white font-semibold">
                        {formatPoints(Number(result?.amount_usd ?? 0))}
                      </span>
                    </span>
                    <span className="text-white/20">·</span>
                    <span>
                      Remaining:{" "}
                      <span className="text-white font-semibold">
                        {formatPoints(Number(result?.balance_after ?? 0))}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Header */}
                <div
                  className="p-3 border-b border-[#c9a227]/30 flex items-center justify-between flex-shrink-0"
                  style={{
                    background: "linear-gradient(90deg, #6b4423, #9A7B4F)",
                  }}
                >
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <ArrowRightCircle className="w-4 h-4 text-[#f5d76e]" />
                    Convert Gifts to Votes
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-4">
                  {/* Balance card */}
                  <div
                    className="rounded-xl p-3 border border-[#c9a227]/35"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(201,162,39,0.15) 0%, rgba(154,123,79,0.08) 100%)",
                    }}
                  >
                    <p className="text-[10px] uppercase tracking-wider text-[#c9a227] font-semibold mb-1 flex items-center gap-1.5">
                      <Coins size={11} /> Gift Points Available
                    </p>
                    <p className="text-2xl font-bold text-[#f5d76e] leading-tight">
                      {formatPoints(balance)}
                    </p>
                    <p className="text-[10px] text-white/50 mt-1">
                      Unconverted gifts ready to be turned into votes.
                    </p>
                  </div>

                  {balance < 1 ? (
                    <div className="rounded-lg border border-red-500/25 bg-red-500/10 p-3 text-center">
                      <p className="text-xs text-red-300">
                        You need at least 1 pt in your gift balance to convert.
                        Keep receiving gifts — you&apos;ll be able to convert
                        soon.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Target selector */}
                      <div className="rounded-lg border border-[#c9a227]/25 bg-white/[0.03] p-3">
                        <p className="text-[10px] uppercase tracking-wider text-white/50 font-semibold mb-2">
                          Convert to votes for
                        </p>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setTargetCandidate(null);
                              resetTargetPicker();
                            }}
                            className={`py-2 rounded-lg border text-[11px] font-bold transition-all ${
                              isSelf
                                ? "border-[#c9a227] bg-[#c9a227]/15 text-[#f5d76e]"
                                : "border-[#c9a227]/25 text-white/60 hover:border-[#c9a227]/50"
                            }`}
                          >
                            Yourself
                          </button>

                          <button
                            type="button"
                            onClick={() => setShowTargetPicker(!showTargetPicker)}
                            className={`py-2 rounded-lg border text-[11px] font-bold transition-all ${
                              !isSelf
                                ? "border-[#c9a227] bg-[#c9a227]/15 text-[#f5d76e]"
                                : "border-[#c9a227]/25 text-white/60 hover:border-[#c9a227]/50"
                            }`}
                          >
                            Another Candidate
                          </button>
                        </div>

                        {showTargetPicker && (
                          <div className="mt-3">
                            <div className="relative">
                              <Search
                                size={13}
                                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#c9a227]/60"
                              />
                              <input
                                type="text"
                                placeholder="Search by name or username…"
                                value={candidateSearch}
                                onChange={(e) => setCandidateSearch(e.target.value)}
                                autoFocus
                                className="w-full pl-8 pr-3 py-2 bg-white/5 border border-[#c9a227]/30 rounded-lg text-xs text-white placeholder-white/40 focus:border-[#c9a227] focus:outline-none"
                              />
                            </div>

                            {searching && (
                              <div className="py-3 text-center">
                                <Loader
                                  size={14}
                                  className="text-[#c9a227] animate-spin mx-auto"
                                />
                              </div>
                            )}

                            {!searching && candidateResults.length > 0 && (
                              <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
                                {candidateResults.map((c) => (
                                  <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => {
                                      setTargetCandidate(c);
                                      resetTargetPicker();
                                    }}
                                    className="w-full flex items-center gap-2 p-2 rounded-lg border border-[#c9a227]/20 bg-white/[0.03] hover:bg-white/[0.07] transition text-left"
                                  >
                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-[#c9a227]/20 flex-shrink-0 border border-[#c9a227]/30">
                                      {c.photo ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                          src={c.photo}
                                          alt={c.full_name}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                          <UserIcon
                                            size={14}
                                            className="text-[#c9a227]"
                                          />
                                        </div>
                                      )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-[11px] font-semibold text-white truncate">
                                        {c.full_name || c.username}
                                      </p>
                                      <p className="text-[9px] text-white/50 truncate">
                                        {c.country}
                                      </p>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}

                            {!searching &&
                              candidateSearch.trim().length >= 2 &&
                              candidateResults.length === 0 && (
                                <p className="text-[10px] text-white/40 text-center py-2">
                                  No candidates match &quot;{candidateSearch}&quot;
                                </p>
                              )}

                            {!searching && candidateSearch.trim().length < 2 && (
                              <p className="text-[10px] text-white/40 text-center py-2">
                                Type at least 2 characters
                              </p>
                            )}
                          </div>
                        )}

                        {!isSelf && !showTargetPicker && (
                          <div className="mt-3 flex items-center gap-2 p-2 rounded-lg bg-[#c9a227]/10 border border-[#c9a227]/30">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-[#c9a227]/20 flex-shrink-0 border border-[#c9a227]/30">
                              {targetCandidate?.photo ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={targetCandidate.photo}
                                  alt={targetCandidate.full_name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <UserIcon
                                    size={14}
                                    className="text-[#c9a227]"
                                  />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[11px] font-semibold text-white truncate">
                                {targetCandidate.full_name ||
                                  targetCandidate.username}
                              </p>
                              <p className="text-[9px] text-[#f5d76e]">
                                Will receive the votes
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setTargetCandidate(null);
                                resetTargetPicker();
                              }}
                              className="text-[10px] text-white/40 hover:text-white/70 underline"
                            >
                              Clear
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Preset buttons */}
                      {presets.length > 0 && (
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-white/50 font-semibold mb-2">
                            Quick pick
                          </p>
                          <div className="grid grid-cols-4 gap-1.5">
                            {presets.map((p) => (
                              <button
                                key={p}
                                type="button"
                                onClick={() => setAmount(String(p))}
                                className="py-2 rounded-lg border text-center transition-all"
                                style={{
                                  background:
                                    Number(amount) === p
                                      ? "rgba(201, 162, 39, 0.18)"
                                      : "rgba(255,255,255,0.04)",
                                  borderColor:
                                    Number(amount) === p
                                      ? "#c9a227"
                                      : "rgba(154, 123, 79, 0.35)",
                                }}
                              >
                                <span className="block text-[11px] font-bold text-white">
                                  {p} pts
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Slider */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[10px] uppercase tracking-wider text-white/50 font-semibold">
                            Amount to convert
                          </p>
                          <p className="text-[10px] text-white/40">
                            Max: {formatPoints(balance)}
                          </p>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max={Math.max(Math.floor(balance), 1)}
                          step="1"
                          value={amountNum || 1}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[#c9a227]"
                          style={{
                            background: `linear-gradient(to right, #c9a227 0%, #c9a227 ${
                              (amountNum / Math.max(balance, 1)) * 100
                            }%, rgba(255,255,255,0.15) ${
                              (amountNum / Math.max(balance, 1)) * 100
                            }%, rgba(255,255,255,0.15) 100%)`,
                          }}
                        />
                      </div>

                      {/* Numeric input */}
                      <div>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c9a227] font-bold text-sm">
                            pts
                          </span>
                          <input
                            type="number"
                            min="1"
                            max={Math.floor(balance)}
                            step="1"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Enter amount"
                            className="w-full pl-12 pr-3 py-3 bg-white/5 border border-[#c9a227]/30 rounded-lg text-lg text-white placeholder-white/30 focus:border-[#c9a227] focus:outline-none text-center font-bold"
                          />
                        </div>
                        {amountNum > balance && (
                          <p className="text-[10px] text-red-400 mt-1.5 text-center">
                            Amount exceeds your gift balance of{" "}
                            {formatPoints(balance)}.
                          </p>
                        )}
                      </div>

                      {/* Preview */}
                      {isValid && (
                        <div className="rounded-lg border border-[#c9a227]/25 bg-white/[0.03] p-3">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] text-white/60">
                              Votes to{" "}
                              {isSelf ? "you" : recipientName}
                            </span>
                            <span className="text-sm font-bold text-[#f5d76e]">
                              +{votesToGet} vote{votesToGet === 1 ? "" : "s"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-white/60">
                              Remaining balance
                            </span>
                            <span className="text-sm font-semibold text-white">
                              {formatPoints(remaining)}
                            </span>
                          </div>
                        </div>
                      )}

                      {error && (
                        <div className="rounded-lg border border-red-500/25 bg-red-500/10 p-2.5">
                          <p className="text-xs text-red-300 text-center">
                            {error}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-[#c9a227]/25 bg-black/30 flex-shrink-0">
                  <button
                    type="button"
                    onClick={handleConvert}
                    disabled={!isValid || processing}
                    className="w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 text-white"
                    style={{
                      background:
                        "linear-gradient(135deg, #9A7B4F 0%, #6b4423 100%)",
                    }}
                  >
                    {processing ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Converting…
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Send {votesToGet || 0} Vote
                        {votesToGet === 1 ? "" : "s"}{" "}
                        {isSelf ? "to Yourself" : `to ${recipientName}`}
                      </>
                    )}
                  </button>
                  <p className="text-[9px] text-white/40 text-center mt-2">
                    Conversions are final. Remaining balance stays available
                    until the show ends.
                  </p>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}