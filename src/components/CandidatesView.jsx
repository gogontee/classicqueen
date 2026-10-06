"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import CandidateCard from "./CandidateCard";
import VoteModal from "./VoteModal";
import VoteCountdown from "./VoteCountdown";
import { createClient } from "@/utils/supabase/client";

export default function CandidatesView({ candidates: initialCandidates }) {
  const supabase = createClient();
  const [view, setView] = useState("grid");
  const [candidates, setCandidates] = useState(initialCandidates || []);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [voteOpen, setVoteOpen] = useState(false);

  // Live updates from Supabase Realtime
  useEffect(() => {
    const channel = supabase
      .channel("candidates-votes-live")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "candidates",
        },
        (payload) => {
          const updated = payload.new;
          if (!updated?.id) return;

          setCandidates((prev) =>
            prev.map((c) =>
              c.id === updated.id
                ? { ...c, vote_count: updated.vote_count ?? c.vote_count }
                : c
            )
          );

          setSelectedCandidate((prev) =>
            prev && prev.id === updated.id
              ? { ...prev, vote_count: updated.vote_count ?? prev.vote_count }
              : prev
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleVoteClick = (candidate) => {
    setSelectedCandidate(candidate);
    setVoteOpen(true);
  };

  const handleVoteSuccess = (votes) => {
    if (!selectedCandidate) return;
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === selectedCandidate.id
          ? { ...c, vote_count: (c.vote_count ?? 0) + votes }
          : c
      )
    );
  };

  return (
    <div>
      {/* Top row — countdown on the left, grid/list toggle on the right (mobile only) */}
      <div className="flex items-center justify-between gap-3 mb-4 min-h-[36px]">
        <VoteCountdown variant="pill" />

        <div className="inline-flex rounded-lg border border-[#9A7B4F] overflow-hidden flex-shrink-0 sm:hidden">
          <button
            onClick={() => setView("grid")}
            aria-pressed={view === "grid"}
            className={`
              px-3 py-1.5 text-xs font-semibold transition
              ${
                view === "grid"
                  ? "bg-[#6b4423] text-white"
                  : "bg-transparent text-[#9A7B4F]"
              }
            `}
          >
            Grid
          </button>
          <button
            onClick={() => setView("list")}
            aria-pressed={view === "list"}
            className={`
              px-3 py-1.5 text-xs font-semibold transition
              ${
                view === "list"
                  ? "bg-[#6b4423] text-white"
                  : "bg-transparent text-[#9A7B4F]"
              }
            `}
          >
            List
          </button>
        </div>
      </div>

      {/* Candidates grid / list */}
      <div
        className={
          view === "grid"
            ? "grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
            : "flex flex-col items-center gap-4 sm:gap-6"
        }
      >
        {candidates.map((candidate) => (
          <div
            key={candidate.id}
            className={view === "list" ? "w-full max-w-xs" : ""}
          >
            <Link
              href={`/${candidate.username}`}
              className="block group"
              aria-label={`View ${candidate.full_name || candidate.username} profile`}
            >
              <CandidateCard
                candidate={candidate}
                onVoteClick={() => handleVoteClick(candidate)}
              />
            </Link>
          </div>
        ))}
      </div>

      <VoteModal
        isOpen={voteOpen}
        onClose={() => setVoteOpen(false)}
        candidate={selectedCandidate}
        onVoteSuccess={handleVoteSuccess}
      />
    </div>
  );
}