"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ArrowRightCircle,
  Loader,
  Sparkles,
  Send,
  UserCheck,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useNetworkError, isNetworkError } from "@/contexts/NetworkErrorContext";
import { formatPoints } from "@/lib/points";

export default function ConversionHistoryModal({
  isOpen,
  onClose,
  candidate,
}) {
  const supabase = createClient();
  const { reportNetworkError } = useNetworkError();

  const [conversions, setConversions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadConversions = useCallback(async () => {
    if (!candidate?.id) return;
    setLoading(true);
    setError("");
    try {
      const { data, error } = await supabase
        .from("gift_conversions")
        .select(
          `
          id,
          created_at,
          amount_usd,
          votes_awarded,
          balance_before,
          balance_after,
          reference,
          candidate_id,
          target_candidate_id,
          source:candidates!gift_conversions_candidate_id_fkey (
            id,
            username,
            full_name
          ),
          target:candidates!gift_conversions_target_candidate_id_fkey (
            id,
            username,
            full_name
          )
        `
        )
        .or(
          `candidate_id.eq.${candidate.id},target_candidate_id.eq.${candidate.id}`
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setConversions(data ?? []);
    } catch (err) {
      console.error("Conversions fetch error:", err);
      if (isNetworkError(err)) {
        reportNetworkError();
        return;
      }
      setError(err?.message || "Failed to load conversion history.");
    } finally {
      setLoading(false);
    }
  }, [candidate?.id, supabase, reportNetworkError]);

  useEffect(() => {
    if (isOpen) loadConversions();
  }, [isOpen, loadConversions]);

  const formatDate = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Determine the role of this candidate in each conversion
  const roleOf = (row) => {
    if (row.candidate_id === candidate.id && row.target_candidate_id === candidate.id) {
      return "self";
    }
    if (row.candidate_id === candidate.id) {
      return "sent";
    }
    return "received";
  };

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
                <Sparkles className="w-4 h-4 text-[#f5d76e]" />
                <span className="truncate">Conversion History</span>
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
            <div className="flex-1 overflow-y-auto min-h-0 p-3">
              {loading ? (
                <div className="py-10 flex items-center justify-center">
                  <Loader size={20} className="text-[#c9a227] animate-spin" />
                </div>
              ) : error ? (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-xs text-red-400 text-center">{error}</p>
                </div>
              ) : conversions.length === 0 ? (
                <div className="py-10 text-center">
                  <div
                    className="w-14 h-14 mx-auto mb-3 rounded-full p-[2px]"
                    style={{
                      background:
                        "conic-gradient(from 45deg, #7a5c14, #f9e79f, #c9a227, #fff4c2, #8a6a1a, #f5d76e, #7a5c14)",
                    }}
                  >
                    <div className="w-full h-full rounded-full bg-[#1a0d02] flex items-center justify-center">
                      <ArrowRightCircle size={22} className="text-[#c9a227]" />
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-white">
                    No conversions yet
                  </p>
                  <p className="text-xs text-white/50 mt-1">
                    When you convert gift points to votes, it shows here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {conversions.map((row) => {
                    const role = roleOf(row);
                    const targetName =
                      row.target?.full_name || row.target?.username || "Unknown";
                    const sourceName =
                      row.source?.full_name || row.source?.username || "Unknown";
                    const amountPts = Number(row.amount_usd);

                    return (
                      <div
                        key={row.id}
                        className="rounded-lg border border-[#c9a227]/15 bg-white/[0.03] p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div
                              className={`w-9 h-9 flex-shrink-0 rounded-full border flex items-center justify-center ${
                                role === "received"
                                  ? "bg-green-500/10 border-green-500/30"
                                  : "bg-[#c9a227]/10 border-[#c9a227]/30"
                              }`}
                            >
                              {role === "received" ? (
                                <UserCheck
                                  size={16}
                                  className="text-green-400"
                                />
                              ) : (
                                <Send size={16} className="text-[#f5d76e]" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[12px] font-semibold text-white">
                                {role === "received"
                                  ? `+${row.votes_awarded} votes received`
                                  : `Converted ${formatPoints(
                                      amountPts
                                    )} to ${row.votes_awarded} votes`}
                              </p>
                              <p className="text-[10px] text-white/55 truncate mt-0.5">
                                {role === "self" && (
                                  <>To yourself · {targetName}</>
                                )}
                                {role === "sent" && (
                                  <>To {targetName}</>
                                )}
                                {role === "received" && (
                                  <>From {sourceName}&apos;s gift points</>
                                )}
                              </p>
                              <p className="text-[9px] text-white/35 mt-0.5">
                                {formatDate(row.created_at)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p
                              className={`text-sm font-bold ${
                                role === "received"
                                  ? "text-green-400"
                                  : "text-[#f5d76e]"
                              }`}
                            >
                              {role === "received"
                                ? `+${row.votes_awarded}`
                                : `-${formatPoints(amountPts)}`}
                            </p>
                          </div>
                        </div>

                        {/* Balance trail */}
                        <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[9px] text-white/40">
                          <span>
                            Balance: {formatPoints(Number(row.balance_before))}{" "}
                            → {formatPoints(Number(row.balance_after))}
                          </span>
                          <span className="font-mono">
                            {row.reference?.slice(-8)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}