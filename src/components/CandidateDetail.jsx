"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Heart,
  Trophy,
  LayoutGrid,
  List,
  Volume2,
  VolumeX,
  Maximize2,
  Share2,
} from "lucide-react";
import TrophyList from "@/components/TrophyList";
import VoteModal from "@/components/VoteModal";
import { createClient } from "@/utils/supabase/client";

export default function CandidateDetail({ candidate }) {
  const supabase = createClient();
  const router = useRouter();
  const [tab, setTab] = useState("gallery");
  const [galleryView, setGalleryView] = useState("grid");
  const [isHovered, setIsHovered] = useState(false);
  const [voteOpen, setVoteOpen] = useState(false);
  const [displayedVoteCount, setDisplayedVoteCount] = useState(
    candidate.vote_count ?? 0
  );

  const toggleGalleryView = () =>
    setGalleryView((v) => (v === "grid" ? "list" : "grid"));

  const handleVoteSuccess = (votes) => {
    setDisplayedVoteCount((prev) => prev + votes);
  };

  const handleShareClick = () => {
    router.push(`/${candidate.username}/voteprofile`);
  };

  // Live vote count updates
  useEffect(() => {
    if (!candidate?.id) return;

    const channel = supabase
      .channel(`candidate-votes-${candidate.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "candidates",
          filter: `id=eq.${candidate.id}`,
        },
        (payload) => {
          const updated = payload.new;
          if (updated && updated.vote_count != null) {
            setDisplayedVoteCount(updated.vote_count);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [candidate?.id, supabase]);

  const hasDesktopHero = !!candidate.desktop_hero;
  const hasMobileHero = !!candidate.mobile_hero;

  return (
    <main className="min-h-screen bg-white -mt-2">
      {/* ============ HERO ============ */}
      <section className="relative w-full">
        <div
          className="relative hidden sm:block w-full overflow-hidden"
          style={{ height: "240px" }}
        >
          {hasDesktopHero ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={candidate.desktop_hero}
              alt={`${candidate.full_name} hero`}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
                display: "block",
              }}
            />
          ) : (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to bottom, #2E1503, #362511)",
              }}
            />
          )}
        </div>

        <div
          className="relative block sm:hidden w-full overflow-hidden"
          style={{ height: "220px" }}
        >
          {hasMobileHero ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={candidate.mobile_hero}
              alt={`${candidate.full_name} hero`}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
                display: "block",
              }}
            />
          ) : (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to bottom, #2E1503, #362511)",
              }}
            />
          )}
        </div>

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, rgba(46,21,3,0.82) 0%, rgba(107,68,35,0.68) 50%, rgba(10,7,3,0.88) 100%)",
            backdropFilter: "blur(3px)",
            WebkitBackdropFilter: "blur(3px)",
          }}
        />

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            style={{
              position: "relative",
              height: "calc(100% - 8px)",
              aspectRatio: "1 / 1",
              borderRadius: "9999px",
              padding: "3px",
              background:
                "conic-gradient(from 45deg, #7a5c14, #f9e79f, #c9a227, #fff4c2, #8a6a1a, #f5d76e, #7a5c14)",
              boxShadow: "0 8px 30px rgba(0,0,0,0.35)",
              pointerEvents: "auto",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                borderRadius: "9999px",
                overflow: "hidden",
                background: "#ffffff",
              }}
            >
              {candidate.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={candidate.photo}
                  alt={candidate.full_name}
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
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#9A7B4F",
                    fontSize: "32px",
                    fontWeight: 700,
                  }}
                >
                  {(candidate.full_name || "?")[0]?.toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============ ACTION BAR ============ */}
      <section
        className="
          w-full
          border-y border-[#9A7B4F]
          bg-[linear-gradient(135deg,#2E1503_0%,#362511_60%,#0a0703_100%)]
        "
      >
        <div className="mx-auto max-w-5xl flex items-center justify-center gap-8 sm:gap-12 px-3 sm:px-6 py-1.5 sm:py-2">
          <div className="relative shrink-0">
            <motion.div
              className="absolute inset-0 rounded-xl"
              style={{
                background: `linear-gradient(135deg, #6b4423, #9A7B4F)`,
                boxShadow: `0 0 15px rgba(154,123,79,0.35)`,
              }}
              animate={
                !isHovered
                  ? {
                      scale: [1, 1.15, 1.3, 1.15, 1],
                      opacity: [0.5, 0.3, 0.1, 0.3, 0.5],
                    }
                  : { scale: 1, opacity: 0 }
              }
              transition={
                !isHovered
                  ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  : { duration: 0.3 }
              }
            />
            <motion.div
              className="absolute inset-0 rounded-xl"
              style={{
                background: `linear-gradient(135deg, #9A7B4F, #6b4423)`,
                boxShadow: `0 0 20px rgba(154,123,79,0.25)`,
              }}
              animate={
                !isHovered
                  ? {
                      scale: [1, 1.2, 1.4, 1.2, 1],
                      opacity: [0.35, 0.2, 0.05, 0.2, 0.35],
                    }
                  : { scale: 1, opacity: 0 }
              }
              transition={
                !isHovered
                  ? {
                      duration: 2.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.3,
                    }
                  : { duration: 0.3 }
              }
            />
            <motion.div
              className="absolute inset-0 rounded-xl"
              style={{
                background: `linear-gradient(135deg, #362511, #9A7B4F)`,
                boxShadow: `0 0 25px rgba(154,123,79,0.2)`,
              }}
              animate={
                !isHovered
                  ? {
                      scale: [1, 1.25, 1.5, 1.25, 1],
                      opacity: [0.25, 0.15, 0.03, 0.15, 0.25],
                    }
                  : { scale: 1, opacity: 0 }
              }
              transition={
                !isHovered
                  ? {
                      duration: 2.4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.6,
                    }
                  : { duration: 0.3 }
              }
            />

            <motion.button
              onClick={() => setVoteOpen(true)}
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
              whileTap={{ scale: 0.95 }}
              className="
                relative inline-flex items-center justify-center gap-1.5 sm:gap-2
                px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl
                transition-all hover:scale-105 shadow-lg overflow-hidden z-10
              "
              style={{
                background: `linear-gradient(135deg, #9A7B4F, #6b4423)`,
              }}
            >
              <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white fill-current drop-shadow relative z-10" />
              <span className="text-[11px] sm:text-sm font-bold text-white whitespace-nowrap relative z-10">
                Click Here to Vote
              </span>
            </motion.button>
          </div>

          <div className="flex items-center px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl border border-[#9A7B4F] bg-black/40 shrink-0">
            <span className="text-sm sm:text-base font-bold tabular-nums text-yellow-400 whitespace-nowrap">
              Vote: {displayedVoteCount}
            </span>
          </div>
        </div>
      </section>

      {/* Name + Country */}
      <div className="mt-4 text-center flex items-baseline justify-center gap-2 flex-wrap">
        <h1 className="text-2xl sm:text-3xl font-bold bg-[linear-gradient(135deg,#2E1503,#6b4423,#9A7B4F)] bg-clip-text text-transparent">
          {candidate.full_name}
        </h1>
        {candidate.country && (
          <span className="text-xs sm:text-sm font-medium text-[#9A7B4F]">
            {candidate.country}
          </span>
        )}
      </div>

      {/* ============ GALLERY / ABOUT / TROPHY / SHARE TOGGLE ============ */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-6 pb-3">
        <div className="flex items-center justify-between mb-6">
          <div className="inline-flex rounded-lg border border-[#9A7B4F] overflow-hidden">
            <button
              onClick={() => setTab("gallery")}
              aria-pressed={tab === "gallery"}
              className={`
                px-4 sm:px-5 py-2 text-sm font-semibold transition
                ${
                  tab === "gallery"
                    ? "bg-[#6b4423] text-white"
                    : "bg-transparent text-[#9A7B4F]"
                }
              `}
            >
              Gallery
            </button>
            <button
              onClick={() => setTab("about")}
              aria-pressed={tab === "about"}
              className={`
                px-4 sm:px-5 py-2 text-sm font-semibold transition border-x border-[#9A7B4F]
                ${
                  tab === "about"
                    ? "bg-[#6b4423] text-white"
                    : "bg-transparent text-[#9A7B4F]"
                }
              `}
            >
              About
            </button>
            <button
              onClick={() => setTab("trophy")}
              aria-pressed={tab === "trophy"}
              className={`
                inline-flex items-center gap-1.5
                px-4 sm:px-5 py-2 text-sm font-semibold transition
                ${
                  tab === "trophy"
                    ? "bg-[#6b4423] text-white"
                    : "bg-transparent text-[#9A7B4F]"
                }
              `}
            >
              <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Trophy</span>
            </button>
            <button
              onClick={handleShareClick}
              className="
                inline-flex items-center gap-1.5
                px-4 sm:px-5 py-2 text-sm font-semibold transition border-l border-[#9A7B4F]
                bg-transparent text-[#9A7B4F]
                hover:bg-[#6b4423] hover:text-white
              "
            >
              <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Share</span>
            </button>
          </div>

          {tab === "gallery" && (
            <button
              onClick={toggleGalleryView}
              aria-label={
                galleryView === "grid"
                  ? "Switch to list view"
                  : "Switch to grid view"
              }
              className="
                inline-flex items-center justify-center
                w-10 h-10 rounded-lg
                border border-[#9A7B4F] bg-transparent
                text-[#9A7B4F]
                hover:bg-[#6b4423] hover:text-white
                transition
              "
            >
              {galleryView === "grid" ? (
                <List className="w-5 h-5" />
              ) : (
                <LayoutGrid className="w-5 h-5" />
              )}
            </button>
          )}
        </div>

        {tab === "gallery" && (
          <GallerySection
            gallery={candidate.gallery}
            video={candidate.video}
            name={candidate.full_name}
            view={galleryView}
          />
        )}

        {tab === "about" && (
          <div className="max-w-3xl mx-auto text-neutral-700 leading-relaxed whitespace-pre-line">
            {candidate.about || "No bio available yet."}
          </div>
        )}

        {tab === "trophy" && <TrophyList candidateId={candidate.id} />}
      </section>

      <VoteModal
        isOpen={voteOpen}
        onClose={() => setVoteOpen(false)}
        candidate={candidate}
        onVoteSuccess={handleVoteSuccess}
      />
    </main>
  );
}

/* ============================================================
   Gallery Section
   ============================================================ */

function GallerySection({ gallery, video, name, view }) {
  const images = Array.isArray(gallery)
    ? [...gallery].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    : [];

  const videoItem = pickVideo(video);

  if (view === "list") {
    if (images.length === 0) {
      return (
        <p className="text-center text-neutral-500">No gallery images yet.</p>
      );
    }
    return (
      <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
        {images.map((img, i) => (
          <ImageCard
            key={`${img.url}-${i}`}
            url={img.url}
            name={name}
            index={i}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="lg:w-1/2 w-full">
        <ImageScroller images={images} name={name} />
      </div>
      <div className="lg:w-1/2 w-full">
        <VideoPane video={videoItem} name={name} />
      </div>
    </div>
  );
}

/* ---------------- Image Scroller ---------------- */

function ImageScroller({ images, name }) {
  const scrollRef = useRef(null);
  const frameRef = useRef(null);
  const positionRef = useRef(0);
  const pausedRef = useRef(false);
  const cardWidth = 280 + 16;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || images.length === 0) return;

    const speed = 0.4;
    const wrapAt = images.length * cardWidth;

    const tick = () => {
      if (!pausedRef.current) {
        positionRef.current += speed;

        if (positionRef.current >= wrapAt) {
          positionRef.current -= wrapAt;
        }
        el.scrollLeft = positionRef.current;
      }
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [images.length]);

  if (images.length === 0) {
    return (
      <div className="rounded-2xl border border-[#9A7B4F]/30 bg-[#faf6ee] h-[240px] sm:h-[300px] flex items-center justify-center text-neutral-500 text-sm">
        No gallery images yet.
      </div>
    );
  }

  const looped = [...images, ...images, ...images];

  const handleEnter = () => {
    pausedRef.current = true;
  };
  const handleLeave = () => {
    pausedRef.current = false;
  };

  return (
    <div className="h-[240px] sm:h-[300px]">
      <div
        ref={scrollRef}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onTouchStart={handleEnter}
        onTouchEnd={handleLeave}
        className="relative h-full flex gap-4 overflow-x-hidden"
        style={{
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
      >
        {looped.map((img, i) => (
          <div
            key={`${img.url}-${i}`}
            className="relative h-full w-[220px] sm:w-[280px] flex-shrink-0 rounded-xl p-[2px]"
            style={{
              background:
                "conic-gradient(from 45deg,#7a5c14,#f9e79f,#c9a227,#fff4c2,#8a6a1a,#f5d76e,#7a5c14)",
            }}
          >
            <div className="relative w-full h-full rounded-xl overflow-hidden bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={`${name} gallery ${(i % images.length) + 1}`}
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
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

/* ---------------- Video source parsing ---------------- */

function pickVideo(video) {
  if (!video) return null;
  if (Array.isArray(video)) return video[0] || null;
  if (typeof video === "string") return { url: video };
  if (typeof video === "object" && video.url) return video;
  return null;
}

function getYouTubeId(url) {
  if (!url || typeof url !== "string") return null;

  const patterns = [
    /youtube\.com\/watch\?(?:.*&)?v=([A-Za-z0-9_-]{6,})/,
    /youtu\.be\/([A-Za-z0-9_-]{6,})/,
    /youtube(?:-nocookie)?\.com\/embed\/([A-Za-z0-9_-]{6,})/,
    /youtube\.com\/v\/([A-Za-z0-9_-]{6,})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{6,})/,
    /youtube\.com\/live\/([A-Za-z0-9_-]{6,})/,
  ];

  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }

  if (/^[A-Za-z0-9_-]{11}$/.test(url.trim())) {
    return url.trim();
  }

  return null;
}

/* ---------------- Video Pane ---------------- */

function VideoPane({ video, name }) {
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.2);
  const [showVolume, setShowVolume] = useState(false);
  const [progress, setProgress] = useState(0);
  const volumeHideTimer = useRef(null);

  const youtubeId = video?.url ? getYouTubeId(video.url) : null;

  useEffect(() => {
    if (youtubeId) return;
    const v = videoRef.current;
    if (!v || !video?.url) return;

    v.volume = 0.2;
    v.muted = false;
    setIsMuted(false);

    const attempt = v.play();
    if (attempt && typeof attempt.then === "function") {
      attempt.catch(() => {
        v.muted = true;
        setIsMuted(true);
        v.play().catch(() => {});
      });
    }
  }, [video?.url, youtubeId]);

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
    flashVolume();
  };

  const onVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      if (val > 0 && videoRef.current.muted) {
        videoRef.current.muted = false;
        setIsMuted(false);
      }
    }
    flashVolume();
  };

  const flashVolume = () => {
    setShowVolume(true);
    if (volumeHideTimer.current) clearTimeout(volumeHideTimer.current);
    volumeHideTimer.current = setTimeout(() => setShowVolume(false), 2000);
  };

  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setProgress((v.currentTime / v.duration) * 100);
  };

  const goFullscreen = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.requestFullscreen) v.requestFullscreen();
  };

  if (!video?.url) {
    return (
      <div className="rounded-2xl border border-[#9A7B4F]/30 bg-[#faf6ee] h-[300px] flex flex-col items-center justify-center text-center">
        <p className="text-sm text-[#6b4423] font-medium">No video yet</p>
        <p className="text-xs text-[#6b4423]/60 mt-1">
          A profile video will appear here.
        </p>
      </div>
    );
  }

  if (youtubeId) {
    const embedUrl = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=0&rel=0&modestbranding=1&playsinline=1`;
    return (
      <div className="h-[300px]">
        <div className="relative h-full w-full rounded-2xl overflow-hidden bg-black">
          <iframe
            src={embedUrl}
            title={name ? `${name} video` : "Candidate video"}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            frameBorder="0"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-[300px]">
      <div className="relative h-full w-full rounded-2xl overflow-hidden bg-black">
        <video
          ref={videoRef}
          src={video.url}
          autoPlay
          loop
          playsInline
          preload="metadata"
          onTimeUpdate={onTimeUpdate}
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/25">
          <div
            className="h-full bg-[#c9a227] transition-[width] duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="absolute bottom-3 right-3 flex items-center gap-2 z-10">
          {showVolume && (
            <div className="bg-black/70 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={onVolumeChange}
                className="w-16 h-1 bg-white/30 rounded-full appearance-none cursor-pointer accent-[#c9a227]"
              />
            </div>
          )}

          <button
            type="button"
            onClick={toggleMute}
            className="bg-black/70 backdrop-blur-sm rounded-full p-1.5 hover:bg-black/90 transition-colors"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-white" />
            ) : (
              <Volume2 className="w-4 h-4 text-white" />
            )}
          </button>

          <button
            type="button"
            onClick={goFullscreen}
            className="bg-black/70 backdrop-blur-sm rounded-full p-1.5 hover:bg-black/90 transition-colors"
            title="Fullscreen"
          >
            <Maximize2 className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- List-view image card ---------------- */

function ImageCard({ url, name, index }) {
  return (
    <div
      className="relative rounded-xl p-[2px]"
      style={{
        background:
          "conic-gradient(from 45deg,#7a5c14,#f9e79f,#c9a227,#fff4c2,#8a6a1a,#f5d76e,#7a5c14)",
      }}
    >
      <div className="relative w-full rounded-xl overflow-hidden bg-white">
        <Image
          src={url}
          alt={`${name} gallery ${index + 1}`}
          width={900}
          height={1200}
          sizes="(max-width: 768px) 100vw, 480px"
          className="w-full h-auto block"
        />
      </div>
    </div>
  );
}