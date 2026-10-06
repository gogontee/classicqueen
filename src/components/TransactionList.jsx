"use client";

import { useEffect, useState, useCallback } from "react";
import { ArrowDownLeft, ArrowUpRight, Loader, Filter } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useNetworkError, isNetworkError } from "@/contexts/NetworkErrorContext";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "inflow", label: "Inflow" },
  { key: "outflow", label: "Outflow" },
];

/**
 * TransactionList
 * @param userId          the user whose transactions to show
 * @param visibleCount    how many rows are visible before scrolling (default 4)
 * @param variant         "card" (default) | "embedded" (no border/shadow)
 * @param showFilters     whether to render filter pills (default true)
 * @param onTransactionsLoaded optional callback for parent to know count
 */
export default function TransactionList({
  userId,
  visibleCount = 4,
  variant = "card",
  showFilters = true,
  onTransactionsLoaded,
}) {
  const supabase = createClient();
  const { reportNetworkError } = useNetworkError();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchTransactions = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      const rows = data ?? [];
      setTransactions(rows);
      onTransactionsLoaded?.(rows.length);
    } catch (err) {
      if (isNetworkError(err)) {
        reportNetworkError();
      } else {
        console.error("Transactions fetch failed:", err?.message);
      }
    } finally {
      setLoading(false);
    }
  }, [userId, supabase, reportNetworkError, onTransactionsLoaded]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Filter
  const filtered = transactions.filter((t) => {
    if (filter === "all") return true;
    if (filter === "inflow") return t.type === "credit";
    if (filter === "outflow") return t.type === "debit";
    return true;
  });

  // Rows visible at a glance before scrolling
  const rowHeight = 52; // px — keep in sync with the row markup
  const maxHeight = rowHeight * visibleCount;

  const wrapperClass =
    variant === "card"
      ? "bg-white rounded-2xl border border-[#9A7B4F]/20 p-4 flex flex-col"
      : "flex flex-col";

  return (
    <div className={wrapperClass}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold text-[#2E1503]">Recent Activity</h4>
        {showFilters && (
          <div className="flex items-center gap-1 p-0.5 rounded-full bg-[#faf6ee] border border-[#9A7B4F]/20">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={`px-2 py-[3px] rounded-full text-[10px] font-semibold transition ${
                  filter === f.key
                    ? "bg-[#9A7B4F] text-white shadow-sm"
                    : "text-[#6b4423] hover:bg-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Body */}
      {loading ? (
        <div className="py-6 flex items-center justify-center">
          <Loader size={16} className="text-[#9A7B4F] animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-xs text-[#6b4423]/60 text-center py-6">
          {filter === "all"
            ? "No transactions yet"
            : `No ${filter} transactions`}
        </p>
      ) : (
        <div
          className="space-y-1.5 overflow-y-auto pr-1 transactions-scroll"
          style={{ maxHeight }}
        >
          {filtered.map((t) => (
            <TransactionRow key={t.id} t={t} />
          ))}
        </div>
      )}

      {/* Thin custom scrollbar styling */}
      <style jsx>{`
        .transactions-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .transactions-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .transactions-scroll::-webkit-scrollbar-thumb {
          background: rgba(154, 123, 79, 0.35);
          border-radius: 4px;
        }
        .transactions-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(154, 123, 79, 0.6);
        }
      `}</style>
    </div>
  );
}

function TransactionRow({ t }) {
  const isCredit = t.type === "credit";
  return (
    <div
      className="flex justify-between items-center gap-3 rounded-lg px-2.5 border border-[#9A7B4F]/10"
      style={{ minHeight: 46 }}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div
          className={`w-7 h-7 flex-shrink-0 rounded-full flex items-center justify-center ${
            isCredit ? "bg-green-100" : "bg-red-100"
          }`}
        >
          {isCredit ? (
            <ArrowDownLeft size={13} className="text-green-600" />
          ) : (
            <ArrowUpRight size={13} className="text-red-500" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold text-[#2E1503] truncate">
            {isCredit ? "Wallet Funded" : "Vote Cast"}
          </p>
          <p className="text-[9px] text-[#6b4423]/60 truncate">
            {new Date(t.created_at).toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>
      <span
        className={`text-xs font-bold flex-shrink-0 ${
          isCredit ? "text-green-600" : "text-red-500"
        }`}
      >
        {isCredit ? "+" : "-"}${Number(t.amount).toFixed(2)}
      </span>
    </div>
  );
}