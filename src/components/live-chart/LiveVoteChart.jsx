'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Crown,
  Loader,
  Activity,
  Trophy,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useNetworkError, isNetworkError } from '@/contexts/NetworkErrorContext';
import VoteModal from '@/components/VoteModal';

const CHART_VIEWS = [
  { key: 'bar', label: 'Bar', icon: BarChart3 },
  { key: 'pie', label: 'Pie', icon: PieChart },
];

// Vibrant, diverse palette for pie slices — each slice gets a distinct color
const PALETTE = [
  '#c9a227', // gold (brand primary)
  '#dc2626', // red
  '#16a34a', // green
  '#2563eb', // blue
  '#ec4899', // pink
  '#f97316', // orange
  '#8b5cf6', // purple
  '#0891b2', // teal
  '#eab308', // yellow
  '#78350f', // deep brown
  '#14b8a6', // emerald
  '#e11d48', // rose
];

export default function LiveVoteChart({ initialCandidates = [] }) {
  const supabase = createClient();
  const { reportNetworkError } = useNetworkError();

  const [candidates, setCandidates] = useState(initialCandidates);
  const [view, setView] = useState('bar');
  const [loading, setLoading] = useState(initialCandidates.length === 0);
  const [lastUpdatedId, setLastUpdatedId] = useState(null);
  const [pulseKey, setPulseKey] = useState(0);
  const pulseTimers = useRef({});

  // ---- Vote modal state ----
  const [voteCandidate, setVoteCandidate] = useState(null);
  const [voteOpen, setVoteOpen] = useState(false);

  const openVoteModal = (candidate) => {
    setVoteCandidate(candidate);
    setVoteOpen(true);
  };

  const handleVoteSuccess = (votes) => {
    if (!voteCandidate) return;
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === voteCandidate.id
          ? { ...c, vote_count: (c.vote_count ?? 0) + votes }
          : c
      )
    );
  };

  // ---- Initial fetch if server didn't pass data ----
  useEffect(() => {
    if (initialCandidates.length > 0) return;

    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('candidates')
          .select('id, username, full_name, country, photo, vote_count')
          .eq('status', 'Approved')
          .order('vote_count', { ascending: false });

        if (error) throw error;
        if (!cancelled) setCandidates(data ?? []);
      } catch (err) {
        if (isNetworkError(err)) reportNetworkError();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [initialCandidates.length, supabase, reportNetworkError]);

  // ---- Realtime subscription ----
  useEffect(() => {
    const channel = supabase
      .channel('live-vote-chart')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'candidates',
        },
        (payload) => {
          const updated = payload.new;
          if (!updated || updated.vote_count == null) return;

          setCandidates((prev) =>
            prev.map((c) =>
              c.id === updated.id
                ? { ...c, vote_count: updated.vote_count }
                : c
            )
          );

          setLastUpdatedId(updated.id);
          setPulseKey((k) => k + 1);

          if (pulseTimers.current[updated.id]) {
            clearTimeout(pulseTimers.current[updated.id]);
          }
          pulseTimers.current[updated.id] = setTimeout(() => {
            setLastUpdatedId((current) =>
              current === updated.id ? null : current
            );
          }, 2500);
        }
      )
      .subscribe();

    return () => {
      Object.values(pulseTimers.current).forEach(clearTimeout);
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // ---- Derived data ----
  const sorted = useMemo(
    () =>
      [...candidates].sort(
        (a, b) => (b.vote_count ?? 0) - (a.vote_count ?? 0)
      ),
    [candidates]
  );

  const totalVotes = useMemo(
    () => sorted.reduce((sum, c) => sum + (c.vote_count ?? 0), 0),
    [sorted]
  );

  const maxVotes = sorted[0]?.vote_count ?? 0;

  return (
    <div className="space-y-6">
      {/* ===== Header ===== */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#c9a227]/50 bg-[#faf6ee] mb-3 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b4423]">
            Live
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold bg-[linear-gradient(135deg,#2E1503,#9A7B4F,#c9a227)] bg-clip-text text-transparent mb-1">
          Live Vote Chart
        </h1>
        <p className="text-xs sm:text-sm font-semibold bg-[linear-gradient(135deg,#9A7B4F,#c9a227,#e6b84a)] bg-clip-text text-transparent">
          Watch the race unfold in real time — updates the moment a vote lands.
        </p>
      </div>

      {/* ===== Summary bar ===== */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <StatCard label="Total Votes" value={totalVotes.toLocaleString()} />
        <StatCard label="Candidates" value={sorted.length.toString()} />
        <StatCard
          label="Leading"
          value={sorted[0]?.full_name?.split(' ')[0] || '—'}
          accent
        />
      </div>

      {/* ===== View toggle ===== */}
      <div className="flex items-center justify-center">
        <div className="inline-flex rounded-lg border border-[#c9a227]/40 overflow-hidden bg-white shadow-sm">
          {CHART_VIEWS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold transition ${
                view === key
                  ? 'bg-[#c9a227] text-white'
                  : 'text-[#6b4423] hover:bg-[#faf6ee]'
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ===== Chart ===== */}
      {loading ? (
        <div className="py-16 text-center">
          <Loader className="w-8 h-8 text-[#c9a227] animate-spin mx-auto mb-3" />
          <p className="text-[#6b4423]/60 text-xs">Loading chart…</p>
        </div>
      ) : sorted.length === 0 ? (
        <EmptyState />
      ) : view === 'bar' ? (
        <BarView
          candidates={sorted}
          maxVotes={maxVotes}
          lastUpdatedId={lastUpdatedId}
          onCandidateClick={openVoteModal}
        />
      ) : (
        <PieView
          candidates={sorted}
          totalVotes={totalVotes}
          onCandidateClick={openVoteModal}
        />
      )}

      {/* ===== Leaderboard ===== */}
      {!loading && sorted.length > 0 && (
        <Leaderboard
          candidates={sorted}
          lastUpdatedId={lastUpdatedId}
          pulseKey={pulseKey}
          onCandidateClick={openVoteModal}
        />
      )}

      {/* ===== Vote modal ===== */}
      <VoteModal
        isOpen={voteOpen}
        onClose={() => setVoteOpen(false)}
        candidate={voteCandidate}
        onVoteSuccess={handleVoteSuccess}
      />
    </div>
  );
}

/* ============================================================
   Sub-components
   ============================================================ */

function StatCard({ label, value, accent }) {
  return (
    <div
      className="rounded-xl border border-[#c9a227]/35 p-3 text-center shadow-sm"
      style={{
        background: accent
          ? 'linear-gradient(135deg, rgba(201,162,39,0.22) 0%, rgba(154,123,79,0.10) 100%)'
          : 'linear-gradient(135deg, #fffdf7 0%, #faf6ee 100%)',
      }}
    >
      <p className="text-[9px] uppercase tracking-wider text-[#9A7B4F] font-bold mb-1">
        {label}
      </p>
      {accent ? (
        <p className="text-base sm:text-lg font-bold truncate bg-[linear-gradient(135deg,#9A7B4F,#c9a227,#e6b84a)] bg-clip-text text-transparent">
          {value}
        </p>
      ) : (
        <p className="text-base sm:text-lg font-bold truncate text-[#2E1503]">
          {value}
        </p>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-16 text-center bg-white/70 rounded-2xl border border-[#c9a227]/25">
      <Activity className="w-10 h-10 text-[#c9a227]/60 mx-auto mb-3" />
      <p className="text-[#6b4423] text-sm font-semibold">No votes yet</p>
      <p className="text-[#6b4423]/60 text-xs mt-1">
        The chart will fill as soon as the first vote comes in.
      </p>
    </div>
  );
}

/* ---------------- Bar view ---------------- */

function BarView({ candidates, maxVotes, lastUpdatedId, onCandidateClick }) {
  return (
    <div
      className="rounded-2xl border border-[#c9a227]/30 p-4 sm:p-5 shadow-sm"
      style={{
        background:
          'linear-gradient(135deg, #fffdf7 0%, #faf6ee 60%, #f3ead8 100%)',
      }}
    >
      {candidates.map((c, i) => {
        const pct = maxVotes > 0 ? ((c.vote_count ?? 0) / maxVotes) * 100 : 0;
        const isUpdated = lastUpdatedId === c.id;
        const isLeader = i === 0;
        const isLast = i === candidates.length - 1;

        return (
          <div key={c.id}>
            <button
              type="button"
              onClick={() => onCandidateClick(c)}
              className="w-full text-left space-y-1 py-2 rounded-lg hover:bg-[#c9a227]/8 transition-colors px-1 -mx-1"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`text-[10px] font-bold w-5 text-center ${
                      isLeader ? 'text-[#c9a227]' : 'text-[#6b4423]/50'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <CandidateAvatar candidate={c} size={22} />
                  <span className="text-[11px] font-semibold text-[#2E1503] truncate">
                    {c.full_name || c.username}
                  </span>
                  {isLeader && (
                    <Crown size={11} className="text-[#c9a227] flex-shrink-0" />
                  )}
                </div>
                <motion.span
                  key={isUpdated ? `v-${c.vote_count}` : c.vote_count}
                  initial={isUpdated ? { scale: 1.3, color: '#16a34a' } : false}
                  animate={{ scale: 1, color: '#2E1503' }}
                  transition={{ duration: 0.6 }}
                  className="text-[11px] font-bold tabular-nums"
                >
                  {(c.vote_count ?? 0).toLocaleString()}
                </motion.span>
              </div>

              <div className="relative h-2.5 rounded-full bg-[#9A7B4F]/12 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    background: isLeader
                      ? 'linear-gradient(90deg, #c9a227, #f5d76e)'
                      : 'linear-gradient(90deg, #9A7B4F, #c9a227)',
                    boxShadow: isLeader
                      ? '0 0 10px rgba(201,162,39,0.5)'
                      : 'none',
                  }}
                />
                <AnimatePresence>
                  {isUpdated && (
                    <motion.div
                      key="pulse"
                      initial={{ opacity: 0.9 }}
                      animate={{ opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.8 }}
                      className="absolute inset-0 rounded-full bg-green-400"
                    />
                  )}
                </AnimatePresence>
              </div>
            </button>

            {/* Faint divider between candidates */}
            {!isLast && <div className="h-px bg-[#9A7B4F]/15 my-1" />}
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- Pie view ---------------- */

function PieView({ candidates, totalVotes, onCandidateClick }) {
  const top = candidates.slice(0, 10);
  const rest = candidates.slice(10);
  const restTotal = rest.reduce((s, c) => s + (c.vote_count ?? 0), 0);

  const segments = [
    ...top.map((c, i) => ({
      id: c.id,
      label: c.full_name || c.username,
      value: c.vote_count ?? 0,
      color: PALETTE[i % PALETTE.length],
      candidate: c,
    })),
    ...(restTotal > 0
      ? [
          {
            id: '__others__',
            label: `Others (${rest.length})`,
            value: restTotal,
            color: '#94a3b8', // slate grey — clearly "not a real candidate"
          },
        ]
      : []),
  ];

  const size = 260;
  const radius = size / 2;
  const innerRadius = radius * 0.55;
  const cx = radius;
  const cy = radius;

  let accumulated = 0;
  const arcs = segments.map((s) => {
    const startAngle =
      (accumulated / (totalVotes || 1)) * 2 * Math.PI - Math.PI / 2;
    accumulated += s.value;
    const endAngle =
      (accumulated / (totalVotes || 1)) * 2 * Math.PI - Math.PI / 2;

    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);

    const xi1 = cx + innerRadius * Math.cos(endAngle);
    const yi1 = cy + innerRadius * Math.sin(endAngle);
    const xi2 = cx + innerRadius * Math.cos(startAngle);
    const yi2 = cy + innerRadius * Math.sin(startAngle);

    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

    const path = [
      `M ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${xi1} ${yi1}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${xi2} ${yi2}`,
      'Z',
    ].join(' ');

    return { ...s, path };
  });

  return (
    <div
      className="rounded-2xl border border-[#c9a227]/30 p-4 sm:p-5 shadow-sm"
      style={{
        background:
          'linear-gradient(135deg, #fffdf7 0%, #faf6ee 60%, #f3ead8 100%)',
      }}
    >
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Donut */}
        <div className="relative flex-shrink-0">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {arcs.map((a) => (
              <motion.path
                key={a.id}
                d={a.path}
                fill={a.color}
                stroke="#fffdf7"
                strokeWidth="1.5"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                style={{ cursor: a.candidate ? 'pointer' : 'default' }}
                onClick={() => {
                  if (a.candidate) onCandidateClick(a.candidate);
                }}
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-[10px] uppercase tracking-wider text-[#9A7B4F] font-bold">
              Total
            </p>
            <p className="text-xl font-bold text-[#2E1503] tabular-nums">
              {totalVotes.toLocaleString()}
            </p>
            <p className="text-[9px] text-[#6b4423]/60">votes</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 w-full min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-[#9A7B4F] font-bold mb-2">
            Top {Math.min(top.length, candidates.length)}
          </p>
          <div className="max-h-[260px] overflow-y-auto pr-1">
            {segments.map((s, i) => {
              const pct = totalVotes > 0 ? (s.value / totalVotes) * 100 : 0;
              const isLast = i === segments.length - 1;
              const clickable = !!s.candidate;

              return (
                <div key={s.id}>
                  <button
                    type="button"
                    onClick={() => {
                      if (s.candidate) onCandidateClick(s.candidate);
                    }}
                    disabled={!clickable}
                    className={`w-full flex items-center gap-2 py-1.5 text-left rounded transition-colors px-1 -mx-1 ${
                      clickable
                        ? 'hover:bg-[#c9a227]/10 cursor-pointer'
                        : 'cursor-default'
                    }`}
                  >
                    <div
                      className="w-3 h-3 rounded-sm flex-shrink-0 border border-black/10"
                      style={{ background: s.color }}
                    />
                    <span className="text-[11px] text-[#2E1503] truncate flex-1 min-w-0">
                      <span className="text-[#6b4423]/50 mr-1.5">
                        {i + 1}.
                      </span>
                      {s.label}
                    </span>
                    <span className="text-[10px] text-[#6b4423]/70 tabular-nums flex-shrink-0">
                      {pct.toFixed(1)}%
                    </span>
                    <span className="text-[11px] font-bold text-[#2E1503] tabular-nums flex-shrink-0 w-14 text-right">
                      {s.value.toLocaleString()}
                    </span>
                  </button>

                  {/* Faint divider between candidates */}
                  {!isLast && <div className="h-px bg-[#9A7B4F]/15 my-0.5" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Leaderboard ---------------- */

function Leaderboard({
  candidates,
  lastUpdatedId,
  pulseKey,
  onCandidateClick,
}) {
  return (
    <div
      className="rounded-2xl border border-[#c9a227]/30 p-4 sm:p-5 shadow-sm"
      style={{
        background:
          'linear-gradient(135deg, #fffdf7 0%, #faf6ee 60%, #f3ead8 100%)',
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Trophy size={14} className="text-[#c9a227]" />
        <h2 className="text-sm font-bold text-[#2E1503]">Live Leaderboard</h2>
      </div>

      <div className="space-y-1.5">
        <AnimatePresence initial={false}>
          {candidates.map((c, i) => {
            const isUpdated = lastUpdatedId === c.id;
            const isLeader = i === 0;

            return (
              <motion.button
                key={c.id}
                type="button"
                onClick={() => onCandidateClick(c)}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className={`w-full text-left flex items-center gap-3 rounded-lg px-2.5 py-2 border transition-colors ${
                  isUpdated
                    ? 'border-green-500/50 bg-green-50'
                    : 'border-[#c9a227]/25 bg-white/70 hover:bg-[#c9a227]/10'
                }`}
              >
                <span
                  className={`text-[11px] font-bold w-6 text-center flex-shrink-0 ${
                    isLeader ? 'text-[#c9a227]' : 'text-[#6b4423]/45'
                  }`}
                >
                  #{i + 1}
                </span>
                <CandidateAvatar candidate={c} size={28} />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-[#2E1503] truncate flex items-center gap-1.5">
                    {c.full_name || c.username}
                    {isLeader && (
                      <Crown
                        size={11}
                        className="text-[#c9a227] flex-shrink-0"
                      />
                    )}
                  </p>
                  <p className="text-[10px] text-[#6b4423]/55 truncate">
                    {c.country || '—'}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <motion.p
                    key={`${c.id}-${pulseKey}-${c.vote_count}`}
                    initial={
                      isUpdated ? { scale: 1.4, color: '#16a34a' } : false
                    }
                    animate={{ scale: 1, color: '#2E1503' }}
                    transition={{ duration: 0.6 }}
                    className="text-sm font-bold tabular-nums leading-tight"
                  >
                    {(c.vote_count ?? 0).toLocaleString()}
                  </motion.p>
                  <p className="text-[9px] text-[#6b4423]/55">votes</p>
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ---------------- Avatar ---------------- */

function CandidateAvatar({ candidate, size = 24 }) {
  const [errored, setErrored] = useState(false);
  const initial = (candidate?.full_name || candidate?.username || '?')
    .charAt(0)
    .toUpperCase();

  return (
    <div
      className="rounded-full overflow-hidden bg-[#c9a227]/25 border border-[#c9a227]/40 flex-shrink-0 flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {candidate?.photo && !errored ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={candidate.photo}
          alt={candidate.full_name || candidate.username}
          onError={() => setErrored(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      ) : (
        <span
          className="text-[#6b4423] font-bold"
          style={{ fontSize: size * 0.45 }}
        >
          {initial}
        </span>
      )}
    </div>
  );
}