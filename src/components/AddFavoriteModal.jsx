"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Search, Loader2, Heart, Check, User as UserIcon } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import VoteModal from "@/components/VoteModal";

export default function AddFavoriteModal({
  isOpen,
  onClose,
  userId,
  existingCandidateIds = [],
  onAdded,
  onVoted,
}) {
  const supabase = createClient();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [addingId, setAddingId] = useState(null);
  const [addedIds, setAddedIds] = useState([]);
  const [error, setError] = useState("");
  const [voteCandidate, setVoteCandidate] = useState(null);

  const inputRef = useRef(null);
  const requestIdRef = useRef(0);
  const debounceRef = useRef(null);

  // Focus on open
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Reset when closed
  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
      setSearching(false);
      setAddingId(null);
      setAddedIds([]);
      setError("");
      setVoteCandidate(null);
    }
  }, [isOpen]);

  const runSearch = useCallback(
    async (term) => {
      const currentRequest = ++requestIdRef.current;
      const trimmed = term.trim();

      if (trimmed.length < 2) {
        setResults([]);
        setSearching(false);
        return;
      }

      setSearching(true);
      setError("");

      const pattern = `%${trimmed}%`;
      const { data, error: qErr } = await supabase
        .from("candidates")
        .select("id, username, full_name, country, photo, status, vote_count")
        .eq("status", "Approved")
        .or(`full_name.ilike.${pattern},username.ilike.${pattern}`)
        .order("full_name", { ascending: true })
        .limit(20);

      if (currentRequest !== requestIdRef.current) return;

      if (qErr) {
        setError(qErr.message);
        setResults([]);
      } else {
        setResults(data ?? []);
      }
      setSearching(false);
    },
    [supabase]
  );

  useEffect(() => {
    if (!isOpen) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runSearch(query);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, isOpen, runSearch]);

  const handleAdd = async (candidate) => {
    if (addingId) return;
    setError("");
    setAddingId(candidate.id);

    const { error: insertError } = await supabase.from("favorites").insert([
      { user_id: userId, candidate_id: candidate.id },
    ]);

    if (insertError) {
      setError(insertError.message);
      setAddingId(null);
      return;
    }

    setAddedIds((prev) => [...prev, candidate.id]);
    setAddingId(null);
    if (onAdded) await onAdded();
  };

  if (!isOpen) return null;

  const alreadyFavorited = (id) =>
    existingCandidateIds.includes(id) || addedIds.includes(id);

  return (
    <>
      <div
        className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      >
        <div
          className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl p-[3px]"
          style={{
            background:
              "conic-gradient(from 45deg, #7a5c14, #f9e79f, #c9a227, #fff4c2, #8a6a1a, #f5d76e, #7a5c14)",
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="rounded-t-2xl sm:rounded-2xl bg-white overflow-hidden flex flex-col min-h-0">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#9A7B4F]/20 shrink-0">
              <div>
                <h2 className="text-base font-bold text-[#2E1503]">Add Favorite</h2>
                <p className="text-[11px] text-[#6b4423]/70 mt-0.5">
                  Search by name or username
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-[#faf6ee] text-[#6b4423]"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search input */}
            <div className="px-5 pt-4 pb-3 border-b border-[#9A7B4F]/15 shrink-0">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A7B4F]"
                />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type a candidate's name or username…"
                  className="w-full pl-9 pr-9 py-2.5 bg-[#faf6ee] border border-[#9A7B4F]/35 rounded-xl text-sm text-[#2E1503] outline-none focus:border-[#6b4423]"
                />
                {searching && (
                  <Loader2
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A7B4F] animate-spin"
                  />
                )}
              </div>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto px-5 py-4 min-h-0">
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2.5 text-xs text-red-700 mb-3">
                  {error}
                </div>
              )}

              {query.trim().length < 2 && (
                <div className="text-center py-10 text-[#6b4423]/60 text-sm">
                  Type at least 2 characters to search.
                </div>
              )}

              {query.trim().length >= 2 &&
                !searching &&
                results.length === 0 && (
                  <div className="text-center py-10 text-[#6b4423]/60 text-sm">
                    No candidates found for “{query}”.
                  </div>
                )}

              {results.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {results.map((c) => {
                    const added = alreadyFavorited(c.id);
                    const isAdding = addingId === c.id;
                    return (
                      <div
                        key={c.id}
                        className="rounded-xl border border-[#9A7B4F]/25 bg-white overflow-hidden flex flex-col"
                      >
                        {/* Clickable photo → routes to /[username] */}
                        <a
                          href={`/${c.username}`}
                          className="relative block w-full aspect-square bg-[#faf6ee]"
                          aria-label={`View ${c.full_name}`}
                        >
                          {c.photo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={c.photo}
                              alt={c.full_name}
                              className="absolute inset-0 w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <UserIcon size={36} color="#9A7B4F" />
                            </div>
                          )}
                        </a>

                        <div className="p-2.5 flex flex-col gap-1.5 flex-1">
                          {/* Clickable name → routes to /[username] */}
                          <a
                            href={`/${c.username}`}
                            className="block hover:opacity-80 transition"
                          >
                            <p className="text-[#2E1503] text-xs font-semibold truncate">
                              {c.full_name}
                            </p>
                            <p className="text-[#9A7B4F] text-[10px] truncate">
                              {c.country}
                            </p>
                          </a>

                          {/* Action row: Vote (left) · Add (right) */}
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <button
                              type="button"
                              onClick={() => setVoteCandidate(c)}
                              className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-semibold text-white transition hover:brightness-110"
                              style={{
                                background:
                                  "linear-gradient(135deg, #9A7B4F 0%, #6b4423 100%)",
                              }}
                              title={`Vote for ${c.full_name}`}
                            >
                              <Heart size={11} />
                              Vote
                            </button>

                            <button
                              type="button"
                              onClick={() => !added && handleAdd(c)}
                              disabled={added || isAdding}
                              className={`flex-1 inline-flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-semibold transition ${
                                added
                                  ? "bg-green-50 text-green-700 border border-green-200 cursor-default"
                                  : "text-white hover:brightness-110"
                              }`}
                              style={
                                added
                                  ? undefined
                                  : {
                                      background:
                                        "linear-gradient(135deg, #6b4423 0%, #3a1f0a 100%)",
                                    }
                              }
                              title={
                                added
                                  ? "Already in your favorites"
                                  : `Add ${c.full_name} to favorites`
                              }
                            >
                              {added ? (
                                <>
                                  <Check size={11} /> Added
                                </>
                              ) : isAdding ? (
                                <>
                                  <Loader2
                                    size={11}
                                    className="animate-spin"
                                  />{" "}
                                  …
                                </>
                              ) : (
                                <>
                                  <Heart size={11} /> Fav
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Nested VoteModal — opens above the favorites modal */}
      <VoteModal
        isOpen={!!voteCandidate}
        onClose={() => setVoteCandidate(null)}
        candidate={voteCandidate}
        onVoteSuccess={(votes) => {
          // Update the local vote count for the card that just received a vote
          if (!voteCandidate) return;
          setResults((prev) =>
            prev.map((r) =>
              r.id === voteCandidate.id
                ? { ...r, vote_count: (r.vote_count ?? 0) + votes }
                : r
            )
          );
          if (onVoted) onVoted(voteCandidate, votes);
        }}
      />
    </>
  );
}