'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Copy,
  Check,
  MessageCircle,
  Facebook,
  Instagram,
  HelpCircle,
  ArrowRight,
  Loader,
  User as UserIcon,
  ChevronLeft,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import VoteModal from '@/components/VoteModal';

export default function VoteProfileClient() {
  const params = useParams();
  const username = params.username;
  const supabase = createClient();

  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [showVoteModal, setShowVoteModal] = useState(false);
  const [showHowToVote, setShowHowToVote] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchCandidate = async () => {
      if (!username) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('candidates')
          .select(
            'id, username, full_name, country, photo, vote_count, about, status'
          )
          .eq('username', username)
          .eq('status', 'Approved')
          .maybeSingle();

        if (error || !data) {
          setNotFound(true);
          setCandidate(null);
          return;
        }
        setCandidate(data);
      } catch (err) {
        console.error('Error fetching candidate:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidate();
  }, [username, supabase]);

  // ============================================================
  // Share helpers
  // ============================================================
  const getShareUrl = () => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/${username}/voteprofile`;
  };

  const getShareMessage = () => {
    const name =
      candidate?.full_name?.toUpperCase() ||
      (candidate?.username || '').toUpperCase() ||
      'ME';
    const country = candidate?.country ? `, representing ${candidate.country}` : '';
    return `Hello, I am participating in the Classic Queen International 2026 pageant${country}.
Please help vote for me — I need your votes to qualify.

HOW TO VOTE:
1. Click this link to vote: ${getShareUrl()}
2. Click on the VOTE button
3. Each vote is $1 — cast as many as you can to support me

I deeply appreciate your support and hope it helps me emerge as Classic Queen International 2026.`;
  };

  const handleCopyLink = async () => {
    try {
      const fullText = `${getShareMessage()}\n\n${getShareUrl()}`;
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleShareWhatsApp = () => {
    const fullText = `${getShareMessage()}\n\n${getShareUrl()}`;
    const text = encodeURIComponent(fullText);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(getShareUrl());
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      '_blank'
    );
  };

  const handleShareInstagram = async () => {
    try {
      const fullText = `${getShareMessage()}\n\n${getShareUrl()}`;
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Instagram share (copy) failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2E1503] via-[#1a0d02] to-black flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-10 h-10 text-[#c9a227] animate-spin mx-auto mb-3" />
          <p className="text-white/60 text-sm">Loading candidate…</p>
        </div>
      </div>
    );
  }

  if (notFound || !candidate) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2E1503] via-[#1a0d02] to-black flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-[#c9a227]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-10 h-10 text-[#c9a227]" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Candidate Not Found
          </h1>
          <p className="text-white/60 text-sm mb-6">
            We couldn&apos;t find the candidate you&apos;re trying to vote for.
          </p>
          <Link
            href="/candidates"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#9A7B4F] to-[#6b4423] text-white rounded-xl font-semibold text-sm hover:brightness-110 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            Browse Candidates
          </Link>
        </div>
      </div>
    );
  }

  const displayName =
    (candidate.full_name || candidate.username || '').toUpperCase();

  // ---- Profile card ---- (reduced ~20%)
  const ProfileCard = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-gradient-to-b from-white/5 to-black/40 rounded-2xl border border-[#c9a227]/20 overflow-hidden w-full max-w-[320px] mx-auto"
    >
      {/* Title — lightened so it reads on dark brown */}
      <div className="px-3.5 pt-3.5 pb-2 text-center">
        <h1 className="text-base md:text-lg font-extrabold tracking-wide flex items-baseline justify-center gap-1.5 flex-wrap">
          <span className="text-white/95">VOTE</span>
          <span className="bg-[linear-gradient(135deg,#f5d76e,#e6b84a,#c9a227,#f5d76e,#9A7B4F)] bg-clip-text text-transparent">
            {displayName}
          </span>
        </h1>
      </div>

      {/* Profile photo — 3 : 3.5 aspect */}
      <div className="px-3.5">
        <div className="relative w-full aspect-[3/3.5] rounded-2xl overflow-hidden bg-black border border-[#c9a227]/25">
          {candidate.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={candidate.photo}
              alt={candidate.full_name || candidate.username || 'Candidate'}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#9A7B4F]/20 to-[#6b4423]/10">
              <UserIcon className="w-16 h-16 text-white/30" />
            </div>
          )}
        </div>
      </div>

      {/* Action button */}
      <div className="p-3.5">
        <button
          onClick={() => setShowVoteModal(true)}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-[#9A7B4F] to-[#6b4423] text-white font-bold text-[13px] shadow-lg hover:brightness-110 transition-all duration-300 hover:-translate-y-0.5"
        >
          <Heart className="w-3.5 h-3.5 fill-current" />
          Click to Vote
        </button>
      </div>
    </motion.div>
  );

  // ---- Share bar (desktop — stacked) ----
  const ShareBarDesktop = (
    <div className="bg-white/5 rounded-2xl border border-[#c9a227]/20 p-3">
      <p className="text-[10px] uppercase tracking-wider text-white/40 mb-2 px-1">
        Share
      </p>
      <div className="space-y-2">
        <button
          onClick={handleCopyLink}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-400" />
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy Link</span>
            </>
          )}
        </button>

        <button
          onClick={handleShareWhatsApp}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-green-500/15 hover:bg-green-500/25 border border-green-500/30 text-green-400 text-xs font-medium transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>WhatsApp</span>
        </button>

        <button
          onClick={handleShareFacebook}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-400 text-xs font-medium transition-colors"
        >
          <Facebook className="w-4 h-4" />
          <span>Facebook</span>
        </button>

        <button
          onClick={handleShareInstagram}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 text-pink-400 text-xs font-medium transition-colors"
        >
          <Instagram className="w-4 h-4" />
          <span>Instagram</span>
        </button>
      </div>
    </div>
  );

  // ---- Share bar (mobile — horizontal) ----
  const ShareBarMobile = (
    <div className="w-full border-y border-[#c9a227]/15 bg-black/60 backdrop-blur-sm">
      <div className="max-w-3xl mx-auto px-3 py-2.5">
        <div className="flex items-center justify-between gap-1.5">
          <button
            onClick={handleCopyLink}
            className="flex-1 flex items-center justify-center gap-1 py-2 px-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-medium transition-colors min-w-0"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-green-400 flex-shrink-0" />
                <span className="truncate text-green-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">Copy</span>
              </>
            )}
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="flex-1 flex items-center justify-center gap-1 py-2 px-1 rounded-lg bg-green-500/15 hover:bg-green-500/25 border border-green-500/30 text-green-400 text-[10px] font-medium transition-colors min-w-0"
          >
            <MessageCircle className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">WhatsApp</span>
          </button>

          <button
            onClick={handleShareFacebook}
            className="flex-1 flex items-center justify-center gap-1 py-2 px-1 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-400 text-[10px] font-medium transition-colors min-w-0"
          >
            <Facebook className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">Facebook</span>
          </button>

          <button
            onClick={handleShareInstagram}
            className="flex-1 flex items-center justify-center gap-1 py-2 px-1 rounded-lg bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 text-pink-400 text-[10px] font-medium transition-colors min-w-0"
          >
            <Instagram className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">Instagram</span>
          </button>
        </div>
      </div>
    </div>
  );

  // ---- How-to-vote card ----
  const HowToVoteCard = (
    <div className="bg-gradient-to-br from-[#9A7B4F]/10 to-[#c9a227]/5 rounded-2xl border border-[#c9a227]/25 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-[#c9a227]/20 flex items-center justify-center flex-shrink-0">
          <HelpCircle className="w-5 h-5 text-[#c9a227]" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm md:text-base font-bold text-white mb-1 leading-snug">
            Want to see how to vote for your favorite?
          </h3>
          <p className="text-xs text-white/60 mb-3 leading-relaxed">
            A quick guide on how to cast your vote for {displayName}.
          </p>
          <button
            onClick={() => setShowHowToVote(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-[#9A7B4F] to-[#6b4423] text-white text-xs font-bold hover:brightness-110 transition"
          >
            Click Here
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  // ---- How-to-vote modal (with candidate photo in header) ----
  const HowToVoteModal = (
    <AnimatePresence>
      {showHowToVote && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowHowToVote(false)}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-gradient-to-b from-[#1a0d02] to-black rounded-2xl border border-[#c9a227]/30 overflow-hidden"
          >
            {/* Header with candidate photo */}
            <div className="px-5 py-4 border-b border-[#c9a227]/20 bg-gradient-to-r from-[#6b4423] to-[#9A7B4F] flex items-center gap-3">
              {/* Candidate photo in gold ring */}
              <div
                className="rounded-full overflow-hidden flex-shrink-0"
                style={{
                  width: '48px',
                  height: '48px',
                  padding: '2px',
                  background:
                    'conic-gradient(from 45deg, #7a5c14, #f9e79f, #c9a227, #fff4c2, #8a6a1a, #f5d76e, #7a5c14)',
                }}
              >
                <div className="relative w-full h-full rounded-full overflow-hidden bg-black">
                  {candidate.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={candidate.photo}
                      alt={candidate.full_name || candidate.username || 'Candidate'}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/60 text-xs font-bold">
                      {displayName.charAt(0)}
                    </div>
                  )}
                </div>
              </div>

              {/* Text */}
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-bold text-white truncate">
                  How to Vote
                </h2>
                <p className="text-[11px] text-white/70 truncate">
                  for {displayName}
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#c9a227] text-black text-xs font-bold flex items-center justify-center flex-shrink-0">
                  1
                </div>
                <p className="text-sm text-white/80 leading-relaxed pt-0.5">
                  Click the <strong className="text-white">Click to Vote</strong>{' '}
                  button on {displayName}&apos;s profile.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#c9a227] text-black text-xs font-bold flex items-center justify-center flex-shrink-0">
                  2
                </div>
                <p className="text-sm text-white/80 leading-relaxed pt-0.5">
                  Choose how many votes you want to cast. Each vote is{' '}
                  <strong className="text-white">$1</strong>.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#c9a227] text-black text-xs font-bold flex items-center justify-center flex-shrink-0">
                  3
                </div>
                <p className="text-sm text-white/80 leading-relaxed pt-0.5">
                  Enter your email, complete the payment, and your votes count
                  immediately.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#c9a227] text-black text-xs font-bold flex items-center justify-center flex-shrink-0">
                  4
                </div>
                <p className="text-sm text-white/80 leading-relaxed pt-0.5">
                  Share {displayName}&apos;s profile with friends and family to
                  multiply support.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowHowToVote(false);
                  setShowVoteModal(true);
                }}
                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-[#9A7B4F] to-[#6b4423] text-white text-sm font-bold hover:brightness-110 transition flex items-center justify-center gap-2"
              >
                <Heart className="w-4 h-4 fill-current" />
                Click to Vote
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2E1503] via-[#1a0d02] to-black">
      {/* ===================== DESKTOP ===================== */}
      <div className="hidden md:block">
        <div className="container mx-auto px-6 pt-8 pb-10 max-w-5xl">
          <div className="grid grid-cols-2 gap-6 items-start">
            <div>{ProfileCard}</div>

            <div className="space-y-4">
              {ShareBarDesktop}
              {HowToVoteCard}
            </div>
          </div>
        </div>
      </div>

      {/* ===================== MOBILE ===================== */}
      <div className="md:hidden pb-12">
        <div className="container mx-auto px-4 pt-4 pb-2">{ProfileCard}</div>

        <div className="mt-3">{ShareBarMobile}</div>

        <div className="container mx-auto px-4 py-4">{HowToVoteCard}</div>
      </div>

      {/* ===== Vote modal ===== */}
      <VoteModal
        isOpen={showVoteModal}
        onClose={() => setShowVoteModal(false)}
        candidate={candidate}
        onVoteSuccess={() => {}}
      />

      {/* ===== How-to-vote modal ===== */}
      {HowToVoteModal}
    </div>
  );
}