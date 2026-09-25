"use client";

import Image from "next/image";

export default function CandidateCard({ candidate, onVoteClick }) {
  const handleVote = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onVoteClick) onVoteClick();
  };

  return (
    <div
      className="
        relative rounded-2xl p-[3px]
        bg-[conic-gradient(from_45deg,#7a5c14,#f9e79f,#c9a227,#fff4c2,#8a6a1a,#f5d76e,#7a5c14)]
        shadow-[0_4px_20px_rgba(0,0,0,0.15)]
        transition-transform duration-300 ease-out
        group-hover:scale-105
      "
    >
      <div className="rounded-2xl bg-black overflow-hidden">
        {/* Photo — 5:6 ratio, no cropping */}
        <div className="relative w-full aspect-[5/6] bg-gray-100 overflow-hidden">
          <Image
            src={candidate.photo}
            alt={candidate.full_name || candidate.username}
            fill
            sizes="(max-width: 768px) 100vw, 300px"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          />
        </div>

        {/* Divider line */}
        <div className="h-px w-full bg-[#9A7B4F]" />

        {/* Name + vote row */}
        <div
          className="
            px-3 py-2
            bg-[linear-gradient(135deg,#2E1503_50%,#362511_60%,#0a0703_100%)]
          "
        >
          <h3 className="text-center text-sm font-semibold text-white truncate">
            {candidate.full_name || candidate.username}
          </h3>

          <div className="mt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleVote}
              className="
                px-4 py-1.5 rounded-md text-sm font-semibold text-white
                bg-[#6b4423]
                border border-[#9A7B4F]
                transition-all duration-300
                hover:bg-green-600 hover:border-green-600 hover:brightness-110
                active:scale-95
              "
            >
              Vote
            </button>

            <span className="text-base font-bold tabular-nums text-yellow-400">
              {candidate.vote_count ?? 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}