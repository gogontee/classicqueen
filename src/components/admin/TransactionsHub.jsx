"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Loader2,
  Search,
  AlertCircle,
  ChevronDown,
  RefreshCw,
  Download,
  ArrowDownLeft,
  ArrowUpRight,
  Gift,
  Sparkles,
  Wallet,
  Vote,
  TrendingUp,
  User as UserIcon,
  X,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const TABS = [
  { id: "votes", label: "Vote Transactions", icon: Vote },
  { id: "gifts", label: "Gift Transactions", icon: Gift },
  { id: "conversions", label: "Gift Conversions", icon: Sparkles },
  { id: "wallets", label: "Wallet Balances", icon: Wallet },
  { id: "wallet_tx", label: "Wallet Transactions", icon: ArrowRightIcon },
];

const PAGE_SIZE = 25;

export default function TransactionsHub() {
  const supabase = createClient();

  const [tab, setTab] = useState("votes");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Summary numbers (loaded once on mount)
  const [summary, setSummary] = useState({
    votesCount: 0,
    votesUSD: 0,
    giftsCount: 0,
    giftsUSD: 0,
    conversionsCount: 0,
    conversionsUSD: 0,
    walletsTotal: 0,
    walletsCount: 0,
  });

  const loadSummary = useCallback(async () => {
    try {
      // Votes: only completed
      const votesQ = supabase
        .from("vote_transactions")
        .select("total_amount, votes", { count: "exact", head: false })
        .eq("status", "completed");

      // Gifts: only completed
      const giftsQ = supabase
        .from("gift_transactions")
        .select("amount", { count: "exact", head: false })
        .eq("status", "completed");

      // Conversions
      const convQ = supabase
        .from("gift_conversions")
        .select("amount_usd, votes_awarded", { count: "exact", head: false });

      // Wallets
      const walletsQ = supabase
        .from("wallets")
        .select("balance", { count: "exact", head: false });

      const [votesRes, giftsRes, convRes, walletsRes] = await Promise.all([
        votesQ,
        giftsQ,
        convQ,
        walletsQ,
      ]);

      const votesUSD = (votesRes.data ?? []).reduce(
        (s, r) => s + Number(r.total_amount ?? 0),
        0
      );
      const giftsUSD = (giftsRes.data ?? []).reduce(
        (s, r) => s + Number(r.amount ?? 0),
        0
      );
      const conversionsUSD = (convRes.data ?? []).reduce(
        (s, r) => s + Number(r.amount_usd ?? 0),
        0
      );
      const walletsTotal = (walletsRes.data ?? []).reduce(
        (s, r) => s + Number(r.balance ?? 0),
        0
      );

      setSummary({
        votesCount: votesRes.count ?? 0,
        votesUSD,
        giftsCount: giftsRes.count ?? 0,
        giftsUSD,
        conversionsCount: convRes.count ?? 0,
        conversionsUSD,
        walletsCount: walletsRes.count ?? 0,
        walletsTotal,
      });
    } catch (err) {
      console.error("Summary load failed:", err);
    }
  }, [supabase]);

  const loadRows = useCallback(async () => {
    setLoading(true);
    setError("");

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    try {
      let data = [];
      let count = 0;

      if (tab === "votes") {
        let q = supabase
          .from("vote_transactions")
          .select(
            `
            id, created_at, user_id, guest_email, guest_name,
            candidate_id, package_name, votes, price_per_vote,
            total_amount, currency, payment_method, payment_provider,
            payment_id, reference, status,
            candidate:candidates (id, username, full_name, photo),
            user:users!vote_transactions_user_id_fkey (id, email, first_name, last_name)
          `,
            { count: "exact" }
          )
          .order("created_at", { ascending: false })
          .range(from, to);

        if (statusFilter !== "all") q = q.eq("status", statusFilter);

        const res = await q;
        if (res.error) throw res.error;
        data = res.data ?? [];
        count = res.count ?? 0;
      } else if (tab === "gifts") {
        let q = supabase
          .from("gift_transactions")
          .select(
            `
            id, created_at, user_id, guest_email, guest_name,
            candidate_id, gift_type, gift_name, gift_emoji, amount,
            currency, payment_method, payment_provider, payment_id,
            reference, status,
            candidate:candidates (id, username, full_name, photo),
            user:users!gift_transactions_user_id_fkey (id, email, first_name, last_name)
          `,
            { count: "exact" }
          )
          .order("created_at", { ascending: false })
          .range(from, to);

        if (statusFilter !== "all") q = q.eq("status", statusFilter);

        const res = await q;
        if (res.error) throw res.error;
        data = res.data ?? [];
        count = res.count ?? 0;
      } else if (tab === "conversions") {
        const q = supabase
          .from("gift_conversions")
          .select(
            `
            id, created_at, candidate_id, target_candidate_id, user_id,
            amount_usd, votes_awarded, balance_before, balance_after,
            reference, note,
            source:candidates!gift_conversions_candidate_id_fkey (id, username, full_name, photo),
            target:candidates!gift_conversions_target_candidate_id_fkey (id, username, full_name, photo)
          `,
            { count: "exact" }
          )
          .order("created_at", { ascending: false })
          .range(from, to);

        const res = await q;
        if (res.error) throw res.error;
        data = res.data ?? [];
        count = res.count ?? 0;
      } else if (tab === "wallets") {
        const q = supabase
          .from("wallets")
          .select(
            `
            user_id, balance, currency, updated_at,
            user:users!wallets_user_id_fkey (id, email, first_name, last_name, role)
          `,
            { count: "exact" }
          )
          .order("balance", { ascending: false })
          .range(from, to);

        const res = await q;
        if (res.error) throw res.error;
        data = res.data ?? [];
        count = res.count ?? 0;
      } else if (tab === "wallet_tx") {
        let q = supabase
          .from("wallet_transactions")
          .select(
            `
            id, created_at, user_id, type, amount, balance_after,
            reference, metadata,
            user:users!wallet_transactions_user_id_fkey (id, email, first_name, last_name)
          `,
            { count: "exact" }
          )
          .order("created_at", { ascending: false })
          .range(from, to);

        if (statusFilter !== "all") q = q.eq("type", statusFilter);

        const res = await q;
        if (res.error) throw res.error;
        data = res.data ?? [];
        count = res.count ?? 0;
      }

      setRows(data);
      setTotalCount(count);
    } catch (err) {
      console.error("Transactions load failed:", err);
      setError(err?.message || "Failed to load transactions.");
    } finally {
      setLoading(false);
    }
  }, [supabase, tab, statusFilter, page]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    setPage(1);
  }, [tab, statusFilter]);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  // Client-side search filter (works on the current page)
  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter((r) => {
      const hay = [
        r.reference,
        r.payment_id,
        r.guest_email,
        r.guest_name,
        r.candidate?.full_name,
        r.candidate?.username,
        r.user?.email,
        r.user?.first_name,
        r.user?.last_name,
        r.gift_name,
        r.source?.full_name,
        r.target?.full_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [rows, search]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const formatters = {
    money: (n, currency = "USD") => {
      const symbol = currency === "NGN" ? "₦" : "$";
      return `${symbol}${Number(n ?? 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    },
    date: (iso) => {
      if (!iso) return "—";
      return new Date(iso).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    },
    shortRef: (ref) => (ref ? String(ref).slice(-10) : "—"),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-[#2E1503]">
            Transactions & Wallets
          </h1>
          <p className="text-xs text-[#6b4423]/70 mt-0.5">
            Monitor votes, gifts, conversions, and wallet activity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              loadSummary();
              loadRows();
            }}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#9A7B4F]/40 text-[#6b4423] text-xs font-semibold hover:bg-[#faf6ee] transition"
          >
            <RefreshCw size={13} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <SummaryCard
          icon={Vote}
          label="Votes (completed)"
          primary={summary.votesCount.toLocaleString()}
          secondary={`$${summary.votesUSD.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          accent="#c9a227"
        />
        <SummaryCard
          icon={Gift}
          label="Gifts (completed)"
          primary={summary.giftsCount.toLocaleString()}
          secondary={`$${summary.giftsUSD.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          accent="#ec4899"
        />
        <SummaryCard
          icon={Sparkles}
          label="Conversions"
          primary={summary.conversionsCount.toLocaleString()}
          secondary={`$${summary.conversionsUSD.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          accent="#a855f7"
        />
        <SummaryCard
          icon={Wallet}
          label="Wallets in circulation"
          primary={summary.walletsCount.toLocaleString()}
          secondary={`$${summary.walletsTotal.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          accent="#22c55e"
        />
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-1 mb-4 pb-1 scrollbar-thin">
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                isActive
                  ? "bg-[#6b4423] text-white shadow-sm"
                  : "bg-white text-[#6b4423] border border-[#9A7B4F]/30 hover:border-[#6b4423]"
              }`}
            >
              <Icon size={13} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A7B4F]"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by reference, email, name, ID…"
            className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#9A7B4F]/30 rounded-xl text-sm text-[#2E1503] outline-none focus:border-[#6b4423]"
          />
        </div>

        {tab !== "conversions" && tab !== "wallets" && (
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-3 pr-9 py-2.5 bg-white border border-[#9A7B4F]/30 rounded-xl text-sm text-[#2E1503] outline-none focus:border-[#6b4423] cursor-pointer"
            >
              <option value="all">
                All {tab === "wallet_tx" ? "types" : "statuses"}
              </option>
              {tab === "wallet_tx" ? (
                <>
                  <option value="credit">Credit</option>
                  <option value="debit">Debit</option>
                </>
              ) : (
                <>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="reversed">Reversed</option>
                </>
              )}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b4423] pointer-events-none"
            />
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#9A7B4F]/20 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-[#6b4423] text-sm flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" />
            Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-[#6b4423]/70 text-sm">
            {rows.length === 0
              ? "No records match your filters."
              : "No records match your search."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            {tab === "votes" && (
              <VotesTable rows={filtered} formatters={formatters} />
            )}
            {tab === "gifts" && (
              <GiftsTable rows={filtered} formatters={formatters} />
            )}
            {tab === "conversions" && (
              <ConversionsTable rows={filtered} formatters={formatters} />
            )}
            {tab === "wallets" && (
              <WalletsTable rows={filtered} formatters={formatters} />
            )}
            {tab === "wallet_tx" && (
              <WalletTxTable rows={filtered} formatters={formatters} />
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalCount > PAGE_SIZE && (
        <div className="flex items-center justify-between mt-4 text-xs">
          <p className="text-[#6b4423]/70">
            Page {page} of {totalPages} · {totalCount.toLocaleString()} total
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg border border-[#9A7B4F]/40 text-[#6b4423] font-semibold hover:bg-[#faf6ee] transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-[#9A7B4F]/40 text-[#6b4423] font-semibold hover:bg-[#faf6ee] transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Sub-components ---------------- */

function SummaryCard({ icon: Icon, label, primary, secondary, accent }) {
  return (
    <div className="bg-white rounded-xl border border-[#9A7B4F]/20 p-3.5">
      <div className="flex items-center gap-2 mb-1.5">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: `${accent}18` }}
        >
          <Icon size={14} style={{ color: accent }} />
        </div>
        <p className="text-[10px] uppercase tracking-wider font-semibold text-[#6b4423]/70">
          {label}
        </p>
      </div>
      <p className="text-lg font-bold text-[#2E1503] tabular-nums leading-tight">
        {primary}
      </p>
      <p className="text-xs font-semibold tabular-nums" style={{ color: accent }}>
        {secondary}
      </p>
    </div>
  );
}

function EmptyCell() {
  return <span className="text-[#6b4423]/40">—</span>;
}

function StatusPill({ status }) {
  const map = {
    completed: { bg: "#d1fae5", color: "#065f46" },
    pending: { bg: "#fef3c7", color: "#92400e" },
    failed: { bg: "#fee2e2", color: "#991b1b" },
    cancelled: { bg: "#f3f4f6", color: "#4b5563" },
    refunded: { bg: "#e0e7ff", color: "#3730a3" },
    reversed: { bg: "#fce7f3", color: "#9d174d" },
    credit: { bg: "#d1fae5", color: "#065f46" },
    debit: { bg: "#fee2e2", color: "#991b1b" },
  };
  const style = map[status] || { bg: "#f3f4f6", color: "#4b5563" };
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
      style={{ background: style.bg, color: style.color }}
    >
      {status}
    </span>
  );
}

function UserCell({ row }) {
  if (row.user) {
    const name =
      `${row.user.first_name ?? ""} ${row.user.last_name ?? ""}`.trim();
    return (
      <div className="min-w-0">
        <p className="text-xs font-semibold text-[#2E1503] truncate">
          {name || row.user.email}
        </p>
        <p className="text-[10px] text-[#6b4423]/60 truncate">
          {row.user.email}
        </p>
      </div>
    );
  }
  if (row.guest_email || row.guest_name) {
    return (
      <div className="min-w-0">
        <p className="text-xs font-semibold text-[#2E1503] truncate">
          {row.guest_name || "Guest"}
        </p>
        <p className="text-[10px] text-[#6b4423]/60 truncate">
          {row.guest_email || "no email"}
        </p>
      </div>
    );
  }
  return <EmptyCell />;
}

function CandidateCell({ candidate }) {
  if (!candidate) return <EmptyCell />;
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="w-7 h-7 rounded-full overflow-hidden bg-[#faf6ee] flex-shrink-0">
        {candidate.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={candidate.photo}
            alt={candidate.full_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <UserIcon size={12} color="#9A7B4F" />
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-[#2E1503] truncate">
          {candidate.full_name}
        </p>
        <p className="text-[10px] text-[#9A7B4F] truncate">
          @{candidate.username}
        </p>
      </div>
    </div>
  );
}

/* ---------------- Tables ---------------- */

function TableShell({ children }) {
  return <table className="w-full text-sm">{children}</table>;
}

function Th({ children, className = "" }) {
  return (
    <th
      className={`px-3 py-2.5 text-left text-[10px] uppercase tracking-wider font-bold text-[#6b4423] ${className}`}
    >
      {children}
    </th>
  );
}

function Td({ children, className = "" }) {
  return (
    <td className={`px-3 py-3 align-top ${className}`}>{children}</td>
  );
}

function VotesTable({ rows, formatters }) {
  return (
    <TableShell>
      <thead className="bg-[#faf6ee] border-b border-[#9A7B4F]/20">
        <tr>
          <Th>Date</Th>
          <Th>User</Th>
          <Th>Candidate</Th>
          <Th>Votes</Th>
          <Th>Amount</Th>
          <Th>Method</Th>
          <Th>Status</Th>
          <Th className="hidden lg:table-cell">Reference</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr
            key={r.id}
            className="border-b border-[#9A7B4F]/10 last:border-0 hover:bg-[#faf6ee]/40 transition"
          >
            <Td>
              <span className="text-[11px] text-[#6b4423] whitespace-nowrap">
                {formatters.date(r.created_at)}
              </span>
            </Td>
            <Td>
              <UserCell row={r} />
            </Td>
            <Td>
              <CandidateCell candidate={r.candidate} />
            </Td>
            <Td>
              <span className="text-xs font-bold text-[#2E1503] tabular-nums">
                {r.votes}
              </span>
            </Td>
            <Td>
              <span className="text-xs font-bold text-[#c9a227] tabular-nums whitespace-nowrap">
                {formatters.money(r.total_amount, r.currency)}
              </span>
            </Td>
            <Td>
              <div className="text-[11px] text-[#6b4423] leading-tight">
                <p className="font-semibold capitalize">
                  {r.payment_method || "—"}
                </p>
                <p className="text-[9px] text-[#6b4423]/60">
                  {r.payment_provider}
                </p>
              </div>
            </Td>
            <Td>
              <StatusPill status={r.status} />
            </Td>
            <Td className="hidden lg:table-cell">
              <span className="font-mono text-[10px] text-[#6b4423]/70">
                {formatters.shortRef(r.reference)}
              </span>
            </Td>
          </tr>
        ))}
      </tbody>
    </TableShell>
  );
}

function GiftsTable({ rows, formatters }) {
  return (
    <TableShell>
      <thead className="bg-[#faf6ee] border-b border-[#9A7B4F]/20">
        <tr>
          <Th>Date</Th>
          <Th>Sender</Th>
          <Th>Recipient</Th>
          <Th>Gift</Th>
          <Th>Amount</Th>
          <Th>Method</Th>
          <Th>Status</Th>
          <Th className="hidden lg:table-cell">Reference</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr
            key={r.id}
            className="border-b border-[#9A7B4F]/10 last:border-0 hover:bg-[#faf6ee]/40 transition"
          >
            <Td>
              <span className="text-[11px] text-[#6b4423] whitespace-nowrap">
                {formatters.date(r.created_at)}
              </span>
            </Td>
            <Td>
              <UserCell row={r} />
            </Td>
            <Td>
              <CandidateCell candidate={r.candidate} />
            </Td>
            <Td>
              <div className="flex items-center gap-1.5">
                <span className="text-base">{r.gift_emoji || "🎁"}</span>
                <span className="text-xs font-semibold text-[#2E1503]">
                  {r.gift_name}
                </span>
              </div>
            </Td>
            <Td>
              <span className="text-xs font-bold text-[#c9a227] tabular-nums whitespace-nowrap">
                {formatters.money(r.amount, r.currency)}
              </span>
            </Td>
            <Td>
              <div className="text-[11px] text-[#6b4423] leading-tight">
                <p className="font-semibold capitalize">
                  {r.payment_method || "—"}
                </p>
                <p className="text-[9px] text-[#6b4423]/60">
                  {r.payment_provider}
                </p>
              </div>
            </Td>
            <Td>
              <StatusPill status={r.status} />
            </Td>
            <Td className="hidden lg:table-cell">
              <span className="font-mono text-[10px] text-[#6b4423]/70">
                {formatters.shortRef(r.reference)}
              </span>
            </Td>
          </tr>
        ))}
      </tbody>
    </TableShell>
  );
}

function ConversionsTable({ rows, formatters }) {
  return (
    <TableShell>
      <thead className="bg-[#faf6ee] border-b border-[#9A7B4F]/20">
        <tr>
          <Th>Date</Th>
          <Th>From (source)</Th>
          <Th>To (target)</Th>
          <Th>Amount</Th>
          <Th>Votes</Th>
          <Th className="hidden lg:table-cell">Balance Trail</Th>
          <Th className="hidden lg:table-cell">Reference</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => {
          const isSelf =
            r.candidate_id && r.target_candidate_id === r.candidate_id;
          return (
            <tr
              key={r.id}
              className="border-b border-[#9A7B4F]/10 last:border-0 hover:bg-[#faf6ee]/40 transition"
            >
              <Td>
                <span className="text-[11px] text-[#6b4423] whitespace-nowrap">
                  {formatters.date(r.created_at)}
                </span>
              </Td>
              <Td>
                <CandidateCell candidate={r.source} />
              </Td>
              <Td>
                {isSelf ? (
                  <span className="text-[10px] text-[#6b4423]/70 italic">
                    Self
                  </span>
                ) : (
                  <CandidateCell candidate={r.target} />
                )}
              </Td>
              <Td>
                <span className="text-xs font-bold text-[#a855f7] tabular-nums">
                  ${Number(r.amount_usd).toFixed(2)}
                </span>
              </Td>
              <Td>
                <span className="text-xs font-bold text-green-600 tabular-nums">
                  +{r.votes_awarded}
                </span>
              </Td>
              <Td className="hidden lg:table-cell">
                <span className="text-[10px] text-[#6b4423]/70 tabular-nums">
                  ${Number(r.balance_before).toFixed(2)} → $
                  {Number(r.balance_after).toFixed(2)}
                </span>
              </Td>
              <Td className="hidden lg:table-cell">
                <span className="font-mono text-[10px] text-[#6b4423]/70">
                  {formatters.shortRef(r.reference)}
                </span>
              </Td>
            </tr>
          );
        })}
      </tbody>
    </TableShell>
  );
}

function WalletsTable({ rows, formatters }) {
  return (
    <TableShell>
      <thead className="bg-[#faf6ee] border-b border-[#9A7B4F]/20">
        <tr>
          <Th>User</Th>
          <Th>Balance</Th>
          <Th>Currency</Th>
          <Th>Last Updated</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr
            key={r.user_id}
            className="border-b border-[#9A7B4F]/10 last:border-0 hover:bg-[#faf6ee]/40 transition"
          >
            <Td>
              <UserCell row={r} />
            </Td>
            <Td>
              <span
                className={`text-sm font-bold tabular-nums ${
                  Number(r.balance) > 0 ? "text-green-600" : "text-[#6b4423]/50"
                }`}
              >
                ${Number(r.balance).toFixed(2)}
              </span>
            </Td>
            <Td>
              <span className="text-[11px] text-[#6b4423]/70">
                {r.currency}
              </span>
            </Td>
            <Td>
              <span className="text-[11px] text-[#6b4423] whitespace-nowrap">
                {formatters.date(r.updated_at)}
              </span>
            </Td>
          </tr>
        ))}
      </tbody>
    </TableShell>
  );
}

function WalletTxTable({ rows, formatters }) {
  return (
    <TableShell>
      <thead className="bg-[#faf6ee] border-b border-[#9A7B4F]/20">
        <tr>
          <Th>Date</Th>
          <Th>User</Th>
          <Th>Type</Th>
          <Th>Amount</Th>
          <Th>Balance After</Th>
          <Th className="hidden lg:table-cell">Reference</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => {
          const isCredit = r.type === "credit";
          return (
            <tr
              key={r.id}
              className="border-b border-[#9A7B4F]/10 last:border-0 hover:bg-[#faf6ee]/40 transition"
            >
              <Td>
                <span className="text-[11px] text-[#6b4423] whitespace-nowrap">
                  {formatters.date(r.created_at)}
                </span>
              </Td>
              <Td>
                <UserCell row={r} />
              </Td>
              <Td>
                <div className="flex items-center gap-1.5">
                  {isCredit ? (
                    <ArrowDownLeft size={12} className="text-green-600" />
                  ) : (
                    <ArrowUpRight size={12} className="text-red-500" />
                  )}
                  <StatusPill status={r.type} />
                </div>
              </Td>
              <Td>
                <span
                  className={`text-xs font-bold tabular-nums ${
                    isCredit ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {isCredit ? "+" : "-"}${Number(r.amount).toFixed(2)}
                </span>
              </Td>
              <Td>
                <span className="text-xs font-semibold text-[#2E1503] tabular-nums">
                  ${Number(r.balance_after).toFixed(2)}
                </span>
              </Td>
              <Td className="hidden lg:table-cell">
                <span className="font-mono text-[10px] text-[#6b4423]/70">
                  {formatters.shortRef(r.reference)}
                </span>
              </Td>
            </tr>
          );
        })}
      </tbody>
    </TableShell>
  );
}

/* Small inline icon so we don't add another import */
function ArrowRightIcon(props) {
  return <TrendingUp {...props} />;
}