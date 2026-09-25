"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Trophy } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function TrophyList({ candidateId }) {
  const [trophies, setTrophies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchTrophies() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("trophies")
        .select("*")
        .eq("candidate_id", candidateId)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (error) {
        setError(error.message);
      } else {
        setTrophies(data ?? []);
      }
      setLoading(false);
    }

    if (candidateId) fetchTrophies();

    return () => {
      cancelled = true;
    };
  }, [candidateId]);

  if (loading) {
    return (
      <div className="text-center text-[#9A7B4F] py-12 text-sm">
        Loading achievements…
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-12 text-sm">
        Failed to load achievements: {error}
      </div>
    );
  }

  if (trophies.length === 0) {
    return (
      <div className="text-center py-12">
        <div
          className="
            inline-flex items-center justify-center w-16 h-16 rounded-full mb-4
            p-[2px]
            bg-[conic-gradient(from_45deg,#7a5c14,#f9e79f,#c9a227,#fff4c2,#8a6a1a,#f5d76e,#7a5c14)]
          "
        >
          <div className="flex items-center justify-center w-full h-full rounded-full bg-white">
            <Trophy className="w-7 h-7 text-[#9A7B4F]" />
          </div>
        </div>
        <p className="text-neutral-500 text-sm">
          Achievements record loading...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {trophies.map((t) => (
        <div
          key={t.id}
          className="
            relative rounded-xl p-[2px]
            bg-[conic-gradient(from_45deg,#7a5c14,#f9e79f,#c9a227,#fff4c2,#8a6a1a,#f5d76e,#7a5c14)]
            shadow-[0_4px_16px_rgba(0,0,0,0.08)]
          "
        >
          <div className="rounded-xl bg-white overflow-hidden">
            <div className="flex flex-row items-stretch">
              {/* Image — same side-by-side layout on all screens */}
              {t.image_url && (
                <div className="relative w-24 sm:w-32 md:w-40 lg:w-48 shrink-0 aspect-square bg-[#faf6ee]">
                  <Image
                    src={t.image_url}
                    alt={t.title}
                    fill
                    sizes="(max-width: 640px) 96px, (max-width: 768px) 128px, (max-width: 1024px) 160px, 192px"
                    className="object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0 p-3 sm:p-4 md:p-5">
                <div className="flex items-start gap-2 sm:gap-3">
                  {/* Trophy badge */}
                  <div
                    className="
                      shrink-0 inline-flex items-center justify-center
                      w-8 h-8 sm:w-10 sm:h-10 rounded-full p-[2px]
                      bg-[conic-gradient(from_45deg,#7a5c14,#f9e79f,#c9a227,#fff4c2,#8a6a1a,#f5d76e,#7a5c14)]
                    "
                  >
                    <div className="flex items-center justify-center w-full h-full rounded-full bg-[#2E1503]">
                      <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3
                      className="
                        text-sm sm:text-base md:text-lg font-bold leading-tight
                        bg-[linear-gradient(135deg,#7a5c14,#c9a227,#f5d76e,#8a6a1a)]
                        bg-clip-text text-transparent
                      "
                    >
                      {t.title}
                    </h3>

                    {t.description && (
                      <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-neutral-700 leading-relaxed whitespace-pre-line">
                        {t.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}