"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, Loader, ArrowRightCircle, Info } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useNetworkError, isNetworkError } from "@/contexts/NetworkErrorContext";
import { formatPoints } from "@/lib/points";

export default function GiftTransactionsModal({
  isOpen,
  onClose,
  candidate,
  onConverted,
}) {
  const supabase = createClient();
  const { reportNetworkError } = useNetworkError();

  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadGifts = useCallback(async () => {
    if (!candidate?.id) return;
    setLoading(true);
    setError("");
    try {
      const { data, error } = await supabase
        .from("gift_transactions")
        .select(
          `
          id,
          created_at,
          gift_type,
          gift_name,
          gift_emoji,
          amount,
          currency,
          status,
          guest_name,
          guest_email,
          message,
          user_id,
          sender:users (
            first_name,
            last_name,
            email
          )
        `
        )
        .eq("candidate_id", candidate.id)
        .eq("status", "completed")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGifts(data ?? []);
    } catch (err) {
      if (isNetworkError(err)) {
        reportNetworkError();
        return;
      }
      console.error("Gift transactions error:", err);
      setError(err?.message || "Failed to load gifts.");
    } finally {
      setLoading(false);
    }
  }, [candidate?.id, supabase, reportNetworkError]);

  useEffect(() => {
    if (isOpen) loadGifts();
  }, [isOpen, loadGifts]);

  const formatDate = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const senderLabel = (g) => {
    if (g.sender) {
      const name = `${g.sender.first_name ?? ""} ${
        g.sender.last_name ?? ""
      }`.trim();
      return name || g.sender.email || "Anonymous";
    }
    return g.guest_name || g.guest_email || "Anonymous";
  };

  // Authoritative figures come from the candidate row, NOT the fetched list.
  const totalUSD = Number(candidate?.gift_total_usd ?? 0);
  const giftCount = Number(candidate?.gift_count ?? 0);
  const balance = Number(candidate?.gift_balance_usd ?? 0);
  const canConvert = balance >= 1;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[95] flex items-start justify-center p-3 pt-14 pb-16 overflow-y-auto bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-gradient-to-b from-[#1a0d02] to-black rounded-xl border border-[#c9a227]/30 overflow-hidden my-auto"
            style={{
              maxWidth: "460px",
              maxHeight: "min(88vh, 780px)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <div
              className="p-3 border-b border-[#c9a227]/30 flex items-center justify-between sticky top-0 z-10 flex-shrink-0"
              style={{ background: "linear-gradient(90deg, #6b4423, #9A7B4F)" }}
            >
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 min-w-0">
                <Gift className="w-4 h-4 text-[#f5d76e]" />
                <span className="truncate">Gifts You Received</span>
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
            <div className="flex-1 overflow-y-auto min-h-0">
              {/* Totals summary — sourced from candidates row */}
              <div className="p-3 border-b border-[#c9a227]/20">
                <div
                  className="rounded-xl p-3 border grid grid-cols-2 gap-3"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(201,162,39,0.15) 0%, rgba(154,123,79,0.08) 100%)",
                    borderColor: "rgba(201, 162, 39, 0.35)",
                  }}
                >
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#c9a227]/80 font-semibold">
                      Total Received
                    </p>
                    <p className="text-xl font-bold text-[#f5d76e] leading-tight">
                      {formatPoints(totalUSD)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-green-400/80 font-semibold">
                      Convertible
                    </p>
                    <p className="text-xl font-bold text-green-400 leading-tight">
                      {formatPoints(balance)}
                    </p>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-[#c9a227]/20">
                    <p className="text-[10px] text-white/50 text-center">
                      {giftCount} gift{giftCount === 1 ? "" : "s"} received so far
                    </p>
                  </div>
                </div>
              </div>

              {/* Terms / Agreement */}
              <div className="p-3 border-b border-[#c9a227]/20">
                <div className="rounded-lg border border-[#c9a227]/30 bg-[#c9a227]/8 p-3">
                  <div className="flex items-start gap-2">
                    <Info
                      size={14}
                      className="text-[#c9a227] flex-shrink-0 mt-0.5"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold text-[#f5d76e] mb-1">
                        Convert Your Gifts to Votes
                      </p>
                      <p className="text-[10px] text-white/75 leading-relaxed">
                        Every gift you receive can be converted into votes at
                        any time before the event ends. Once converted, those
                        votes are locked into your final score.
                      </p>
                      <p className="text-[10px] text-white/75 leading-relaxed mt-1.5">
                        <span className="font-semibold text-red-300">
                          Please note:
                        </span>{" "}
                        Any gift that is{" "}
                        <span className="font-semibold text-white">
                          not converted to votes
                        </span>{" "}
                        before the end of the show will be settled at{" "}
                        <span className="font-semibold text-red-300">
                          50% of its value
                        </span>{" "}
                        to you. The remaining 50% is retained by Classic Queen
                        International as an administrative and platform fee.
                      </p>
                      <p className="text-[10px] text-white/50 mt-1.5 italic">
                        By receiving gifts, you agree to these terms.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gift list */}
              <div className="p-3">
                {loading ? (
                  <div className="py-10 flex items-center justify-center">
                    <Loader size={20} className="text-[#c9a227] animate-spin" />
                  </div>
                ) : error ? (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <p className="text-xs text-red-400 text-center">{error}</p>
                  </div>
                ) : gifts.length === 0 ? (
                  <div className="py-10 text-center">
                    <div
                      className="w-14 h-14 mx-auto mb-3 rounded-full p-[2px]"
                      style={{
                        background:
                          "conic-gradient(from 45deg, #7a5c14, #f9e79f, #c9a227, #fff4c2, #8a6a1a, #f5d76e, #7a5c14)",
                      }}
                    >
                      <div className="w-full h-full rounded-full bg-[#1a0d02] flex items-center justify-center">
                        <Gift size={22} className="text-[#c9a227]" />
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-white">
                      No gifts yet
                    </p>
                    <p className="text-xs text-white/50 mt-1">
                      When supporters send you gifts, they&apos;ll appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {gifts.map((g) => (
                      <div
                        key={g.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-[#c9a227]/15 bg-white/[0.03] px-3 py-2.5"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="w-9 h-9 flex-shrink-0 rounded-full bg-[#c9a227]/10 border border-[#c9a227]/30 flex items-center justify-center text-base">
                            {g.gift_emoji || "🎁"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[12px] font-semibold text-white truncate">
                              {g.gift_name}
                            </p>
                            <p className="text-[10px] text-white/55 truncate">
                              From {senderLabel(g)}
                            </p>
                            <p className="text-[9px] text-white/35">
                              {formatDate(g.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold text-[#f5d76e]">
                            {formatPoints(Number(g.amount))}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer — convert CTA */}
            <div className="p-3 border-t border-[#c9a227]/30 bg-black/40 flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (!canConvert) return;
                  onClose();
                  setTimeout(() => {
                    onConverted?.();
                  }, 200);
                }}
                disabled={!canConvert}
                className="w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 text-white"
                style={{
                  background: "linear-gradient(135deg, #9A7B4F 0%, #6b4423 100%)",
                }}
              >
                <ArrowRightCircle size={14} />
                {canConvert
                  ? `Convert to Votes · ${formatPoints(balance)}`
                  : "No Points to Convert"}
              </button>
              <p className="text-[9px] text-white/40 text-center mt-2">
                {canConvert
                  ? "Choose any amount — from 1 pt up to your full balance."
                  : "Keep receiving gifts to unlock conversions."}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}