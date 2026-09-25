"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  LogOut,
  Shield,
  Mail,
  ShieldCheck,
  Settings,
  Plus,
  Heart,
  Trash2,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import EditProfileModal from "@/components/EditProfileModal";
import AddFavoriteModal from "@/components/AddFavoriteModal";
import VoteModal from "@/components/VoteModal";

export default function Dashboard() {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  // Vote modal state
  const [voteCandidate, setVoteCandidate] = useState(null);
  const [voteOpen, setVoteOpen] = useState(false);

  const loadProfile = useCallback(async () => {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user) {
      router.push("/auth/login");
      return null;
    }
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", authData.user.id)
      .single();
    if (error) {
      setError(error.message);
      return null;
    }
    setProfile(data);
    return data;
  }, [router, supabase]);

  const loadFavorites = useCallback(
    async (userId) => {
      const { data, error } = await supabase
        .from("favorites")
        .select(
          `
          id,
          created_at,
          candidate:candidates (
            id,
            username,
            full_name,
            country,
            photo,
            status,
            vote_count
          )
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Favorites error:", error.message);
        return;
      }
      setFavorites(data ?? []);
    },
    [supabase]
  );

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      setLoading(true);
      const p = await loadProfile();
      if (cancelled) return;
      if (p) await loadFavorites(p.id);
      if (!cancelled) setLoading(false);
    }
    boot();
    return () => {
      cancelled = true;
    };
  }, [loadProfile, loadFavorites]);

  useEffect(() => {
    setAvatarError(false);
  }, [profile?.avatar_url]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  const handleRemoveFavorite = async (favoriteId) => {
    const prev = favorites;
    setFavorites((f) => f.filter((x) => x.id !== favoriteId));
    const { error } = await supabase.from("favorites").delete().eq("id", favoriteId);
    if (error) {
      console.error("Remove favorite failed:", error.message);
      setFavorites(prev);
    }
  };

  const handleFavoriteAdded = async () => {
    if (profile) await loadFavorites(profile.id);
  };

  const handleProfileUpdated = async () => {
    await loadProfile();
  };

  const openVoteModal = (candidate) => {
    setVoteCandidate(candidate);
    setVoteOpen(true);
  };

  const handleVoteSuccess = (votes) => {
    if (!voteCandidate) return;
    setFavorites((prev) =>
      prev.map((fav) =>
        fav.candidate?.id === voteCandidate.id
          ? {
              ...fav,
              candidate: {
                ...fav.candidate,
                vote_count: (fav.candidate.vote_count ?? 0) + votes,
              },
            }
          : fav
      )
    );
  };

  if (loading) {
    return (
      <section className="min-h-screen bg-[#faf6ee] flex items-center justify-center px-4">
        <p className="text-[#6b4423] text-sm">Loading dashboard…</p>
      </section>
    );
  }

  if (error || !profile) {
    return (
      <section className="min-h-screen bg-[#faf6ee] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-6 max-w-sm text-center text-red-600 text-sm shadow">
          {error || "Profile not found."}
        </div>
      </section>
    );
  }

  const roleColors = {
    admin: { bg: "#6b4423", text: "white", label: "Admin" },
    candidate: { bg: "#9A7B4F", text: "white", label: "Candidate" },
    user: { bg: "#faf6ee", text: "#6b4423", label: "User" },
  };
  const badge = roleColors[profile.role] || roleColors.user;

  const initials =
    profile.first_name && profile.last_name
      ? `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
      : profile.email?.[0]?.toUpperCase() || "?";

  return (
    <section
      className="min-h-screen"
      style={{
        background: "linear-gradient(to bottom, #faf6ee, #f3ead8)",
        paddingBottom: "96px",
      }}
    >
      <div
        style={{
          background: "linear-gradient(90deg, #2E1503, #362511)",
          padding: "16px 16px 80px",
        }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "#f8f7f3",
              margin: 0,
            }}
          >
            My Dashboard
          </h1>
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "12px",
              color: "#ffffff",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-16">
        <div className="bg-white rounded-2xl shadow-xl border border-[#9A7B4F]/20 p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div
              style={{
                position: "relative",
                width: "112px",
                height: "112px",
                flexShrink: 0,
                borderRadius: "9999px",
                padding: "3px",
                background:
                  "conic-gradient(from 45deg, #7a5c14, #f9e79f, #c9a227, #fff4c2, #8a6a1a, #f5d76e, #7a5c14)",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  borderRadius: "9999px",
                  overflow: "hidden",
                  background: "#faf6ee",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {profile.avatar_url && !avatarError ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatar_url}
                    alt={`${profile.first_name} ${profile.last_name}`}
                    onError={() => setAvatarError(true)}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                ) : (
                  <span
                    style={{
                      color: "#9A7B4F",
                      fontSize: "28px",
                      fontWeight: 700,
                      lineHeight: 1,
                    }}
                  >
                    {initials}
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-[#2E1503]">
                {profile.first_name} {profile.last_name}
              </h2>

              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 mt-2 rounded-full text-[10px] font-bold uppercase tracking-wide"
                style={{
                  background: badge.bg,
                  color: badge.text,
                  border: "1px solid rgba(154,123,79,0.4)",
                }}
              >
                {profile.role === "admin" ? (
                  <ShieldCheck size={11} />
                ) : (
                  <Shield size={11} />
                )}
                {badge.label}
              </div>

              <div className="flex items-center justify-center md:justify-start gap-2 mt-3 text-[#6b4423] text-sm">
                <Mail size={14} />
                <span>{profile.email}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full md:w-auto">
              <button
                onClick={() => setEditOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-[#9A7B4F] text-[#6b4423] hover:bg-[#faf6ee] transition text-sm font-semibold"
              >
                <Settings size={14} />
                Edit Profile
              </button>

              {profile.role === "admin" && (
                <Link
                  href="/admin"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold"
                  style={{
                    background:
                      "linear-gradient(135deg, #9A7B4F 0%, #6b4423 100%)",
                  }}
                >
                  <ShieldCheck size={14} />
                  Admin Panel
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Favorites */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-[#2E1503]">My Favorites</h3>
              <p className="text-xs text-[#6b4423]/70 mt-0.5">
                {favorites.length} candidate{favorites.length === 1 ? "" : "s"} saved
              </p>
            </div>
            <button
              onClick={() => setAddOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold shadow-md hover:brightness-110 transition"
              style={{
                background: "linear-gradient(135deg, #9A7B4F 0%, #6b4423 100%)",
              }}
            >
              <Plus size={14} />
              Add Favorite
            </button>
          </div>

          {favorites.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#9A7B4F]/20 p-10 text-center">
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 p-[2px]"
                style={{
                  background:
                    "conic-gradient(from 45deg, #7a5c14, #f9e79f, #c9a227, #fff4c2, #8a6a1a, #f5d76e, #7a5c14)",
                }}
              >
                <div className="flex items-center justify-center w-full h-full rounded-full bg-white">
                  <Heart size={26} color="#9A7B4F" />
                </div>
              </div>
              <p className="text-sm text-[#6b4423] font-medium">
                No favorites yet
              </p>
              <p className="text-xs text-[#6b4423]/60 mt-1">
                Search for a candidate and add her to your favorites.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {favorites.map((fav) => (
                <FavoriteCard
                  key={fav.id}
                  favorite={fav}
                  onRemove={() => handleRemoveFavorite(fav.id)}
                  onVote={() => openVoteModal(fav.candidate)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <EditProfileModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        profile={profile}
        onUpdated={handleProfileUpdated}
      />

      <AddFavoriteModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        userId={profile.id}
        existingCandidateIds={favorites
          .map((f) => f.candidate?.id)
          .filter(Boolean)}
        onAdded={handleFavoriteAdded}
      />

      {/* Vote modal */}
      <VoteModal
        isOpen={voteOpen}
        onClose={() => setVoteOpen(false)}
        candidate={voteCandidate}
        onVoteSuccess={handleVoteSuccess}
      />
    </section>
  );
}

function FavoriteCard({ favorite, onRemove, onVote }) {
  const c = favorite.candidate;
  if (!c) return null;

  return (
    <div
      className="relative rounded-2xl p-[2px] group"
      style={{
        background:
          "conic-gradient(from 45deg, #7a5c14, #f9e79f, #c9a227, #fff4c2, #8a6a1a, #f5d76e, #7a5c14)",
      }}
    >
      <div className="rounded-2xl bg-white overflow-hidden flex flex-col">
        {/* Clickable top — navigates to /[username] */}
        <Link href={`/${c.username}`} className="block">
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "1 / 1",
              background: "#faf6ee",
            }}
          >
            {c.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={c.photo}
                alt={c.full_name}
                loading="lazy"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <UserIcon size={40} color="#9A7B4F" />
              </div>
            )}
          </div>
          <div className="px-3 py-2.5 bg-black">
            <p className="text-white text-sm font-semibold truncate">
              {c.full_name}
            </p>
            <p className="text-yellow-400 text-xs truncate">{c.country}</p>
          </div>
        </Link>

        {/* Vote button — under the card */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onVote();
          }}
          className="w-full inline-flex items-center justify-center gap-1.5 py-2 text-[11px] font-bold text-white transition hover:brightness-110"
          style={{
            background: "linear-gradient(135deg, #9A7B4F 0%, #6b4423 100%)",
          }}
        >
          <Heart size={12} fill="currentColor" />
          Vote
        </button>

        {/* Remove button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
          aria-label="Remove from favorites"
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition z-10"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}