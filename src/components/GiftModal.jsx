'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Loader,
  Check,
  AlertCircle,
  Gift,
  Heart,
  Crown,
  Sparkles,
  Gem,
  Trophy,
  Flower2,
  Star,
  Award,
  Wallet,
  CreditCard,
} from 'lucide-react';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';
import { useNetworkError, isNetworkError } from '@/contexts/NetworkErrorContext';
import { normalizePaymentMethod } from '@/lib/paymentMethods';

// USD → NGN conversion — must match VoteModal, FundWalletModal, and wallet-fund edge function
const USD_TO_NGN = 1500;

const FLW_PUBLIC_KEY = process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY;

/**
 * Regal gift catalogue — every item reads like a royal court title.
 * Prices are in USD. Starting at $20.
 * 12 gifts total, spanning $20 → $1000.
 */
const GIFTS = [
  {
    id: 'rose',
    name: 'Royal Rose',
    emoji: '🌹',
    amount: 20,
    accent: '#f472b6',
    bg: 'rgba(244, 114, 182, 0.10)',
    border: 'rgba(244, 114, 182, 0.35)',
    icon: Flower2,
  },
  {
    id: 'hot_kisses',
    name: 'Hot Kisses',
    emoji: '💋',
    amount: 30,
    accent: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.10)',
    border: 'rgba(239, 68, 68, 0.35)',
    icon: Heart,
  },
  {
    id: 'heart_of_gold',
    name: 'Heart of Gold',
    emoji: '💖',
    amount: 50,
    accent: '#e879f9',
    bg: 'rgba(232, 121, 249, 0.10)',
    border: 'rgba(232, 121, 249, 0.35)',
    icon: Heart,
  },
  {
    id: 'gold_crown',
    name: 'Gold Crown',
    emoji: '👑',
    amount: 75,
    accent: '#fbbf24',
    bg: 'rgba(251, 191, 36, 0.10)',
    border: 'rgba(251, 191, 36, 0.35)',
    icon: Crown,
  },
  {
    id: 'sapphire_gem',
    name: 'Sapphire Gem',
    emoji: '💎',
    amount: 100,
    accent: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.10)',
    border: 'rgba(59, 130, 246, 0.35)',
    icon: Gem,
  },
  {
    id: 'golden_throne',
    name: 'Golden Throne',
    emoji: '🪑',
    amount: 150,
    accent: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.10)',
    border: 'rgba(245, 158, 11, 0.35)',
    icon: Crown,
  },
  {
    id: 'royal_scepter',
    name: 'Royal Scepter',
    emoji: '🪄',
    amount: 250,
    accent: '#a855f7',
    bg: 'rgba(168, 85, 247, 0.10)',
    border: 'rgba(168, 85, 247, 0.35)',
    icon: Sparkles,
  },
  {
    id: 'royal_ruby',
    name: 'Royal Ruby',
    emoji: '❤️‍🔥',
    amount: 300,
    accent: '#dc2626',
    bg: 'rgba(220, 38, 38, 0.10)',
    border: 'rgba(220, 38, 38, 0.35)',
    icon: Gem,
  },
  {
    id: 'queen_dragon',
    name: 'Queen Dragon',
    emoji: '🐉',
    amount: 400,
    accent: '#10b981',
    bg: 'rgba(16, 185, 129, 0.10)',
    border: 'rgba(16, 185, 129, 0.35)',
    icon: Trophy,
  },
  {
    id: 'crystal_chalice',
    name: 'Crystal Chalice',
    emoji: '🏆',
    amount: 500,
    accent: '#06b6d4',
    bg: 'rgba(6, 182, 212, 0.10)',
    border: 'rgba(6, 182, 212, 0.35)',
    icon: Trophy,
  },
  {
    id: 'eternal_crown',
    name: 'Eternal Crown',
    emoji: '👸',
    amount: 700,
    accent: '#fbbf24',
    bg: 'rgba(251, 191, 36, 0.10)',
    border: 'rgba(251, 191, 36, 0.35)',
    icon: Award,
  },
  {
    id: 'star_of_court',
    name: 'Star of the Court',
    emoji: '⭐',
    amount: 1000,
    accent: '#facc15',
    bg: 'rgba(250, 204, 21, 0.10)',
    border: 'rgba(250, 204, 21, 0.35)',
    icon: Star,
  },
];

export default function GiftModal({
  isOpen,
  onClose,
  candidate,
  onGiftSuccess,
  onGiftError,
}) {
  const supabase = createClient();
  const { reportNetworkError } = useNetworkError();

  const [selectedGift, setSelectedGift] = useState(null);
  const [guestInfo, setGuestInfo] = useState({ email: '', name: '' });
  const [currentUser, setCurrentUser] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState('selection');
  const [paymentMethod, setPaymentMethod] = useState(null); // "wallet" | "card"
  const [error, setError] = useState('');
  const [flutterwaveLoaded, setFlutterwaveLoaded] = useState(false);

  // Wallet
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletLoading, setWalletLoading] = useState(true);

  const [paymentError, setPaymentError] = useState({
    show: false,
    message: '',
    suggestion: '',
  });

  // ----- Auth + wallet balance -----
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    (async () => {
      try {
        const { data, error: authError } = await supabase.auth.getUser();
        if (cancelled) return;

        if (authError && isNetworkError(authError)) {
          reportNetworkError();
          setCurrentUser(null);
          return;
        }

        const user = data?.user ?? null;
        setCurrentUser(user);

        if (user?.id) {
          setWalletLoading(true);
          const { data: wallet } = await supabase
            .from('wallets')
            .select('balance')
            .eq('user_id', user.id)
            .maybeSingle();

          if (!cancelled) {
            setWalletBalance(Number(wallet?.balance ?? 0));
            setWalletLoading(false);
          }
        } else {
          setWalletLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          if (isNetworkError(err)) reportNetworkError();
          setWalletLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, supabase, reportNetworkError]);

  // ----- Load Flutterwave script -----
  useEffect(() => {
    if (!isOpen || flutterwaveLoaded) return;
    if (window.FlutterwaveCheckout) {
      setFlutterwaveLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.flutterwave.com/v3.js';
    script.async = true;
    script.onload = () => {
      if (window.FlutterwaveCheckout) setFlutterwaveLoaded(true);
    };
    document.head.appendChild(script);
  }, [isOpen, flutterwaveLoaded]);

  // ----- Reset on close -----
  useEffect(() => {
    if (!isOpen) {
      setSelectedGift(null);
      setGuestInfo({ email: '', name: '' });
      setProcessing(false);
      setPaymentStep('selection');
      setPaymentMethod(null);
      setError('');
      setPaymentError({ show: false, message: '', suggestion: '' });
    }
  }, [isOpen]);

  // ----- Payment method hover helpers -----
  const HOVER_BG =
    'linear-gradient(135deg, #15803d 0%, #16a34a 50%, #22c55e 100%)';
  const HOVER_BORDER = 'rgba(34, 197, 94, 0.85)';
  const SELECTED_BG = 'rgba(201, 162, 39, 0.18)';
  const SELECTED_BORDER = '#c9a227';

  const walletScheme = {
    base: 'linear-gradient(135deg, #6b4423 0%, #9A7B4F 50%, #c9a227 100%)',
    border: 'rgba(154, 123, 79, 0.7)',
  };
  const cardScheme = {
    base: 'linear-gradient(135deg, #ea580c 0%, #f97316 50%, #fb923c 100%)',
    border: 'rgba(249, 115, 22, 0.7)',
  };

  const getMethodStyle = (key, isSelected) => {
    const scheme = key === 'wallet' ? walletScheme : cardScheme;
    return {
      background: isSelected ? SELECTED_BG : scheme.base,
      borderColor: isSelected ? SELECTED_BORDER : scheme.border,
      boxShadow: isSelected
        ? '0 0 0 1px rgba(201, 162, 39, 0.5), 0 4px 12px rgba(0,0,0,0.3)'
        : '0 2px 6px rgba(0,0,0,0.25)',
    };
  };

  const handleMethodHoverEnter = (e, isSelected) => {
    if (isSelected) return;
    e.currentTarget.style.background = HOVER_BG;
    e.currentTarget.style.borderColor = HOVER_BORDER;
    e.currentTarget.style.boxShadow =
      '0 4px 14px rgba(22, 163, 74, 0.35)';
  };

  const handleMethodHoverLeave = (e, key, isSelected) => {
    const scheme = key === 'wallet' ? walletScheme : cardScheme;
    if (isSelected) {
      e.currentTarget.style.background = SELECTED_BG;
      e.currentTarget.style.borderColor = SELECTED_BORDER;
      e.currentTarget.style.boxShadow =
        '0 0 0 1px rgba(201, 162, 39, 0.5), 0 4px 12px rgba(0,0,0,0.3)';
    } else {
      e.currentTarget.style.background = scheme.base;
      e.currentTarget.style.borderColor = scheme.border;
      e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.25)';
    }
  };

  // ----- Wallet payment -----
  const processWalletPayment = async () => {
    const amount = selectedGift.amount;

    if (walletBalance < amount) {
      setError(
        `Insufficient wallet balance. You have $${walletBalance.toFixed(
          2
        )}, need $${amount.toFixed(2)}.`
      );
      setProcessing(false);
      setPaymentStep('selection');
      return;
    }

    const reference = `GIFT_WALLET_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 10)}`;

    try {
      const { data: spendResult, error: spendError } = await supabase.rpc(
        'spend_wallet',
        {
          p_user_id: currentUser.id,
          p_amount: amount,
          p_reference: reference,
          p_metadata: {
            candidate_id: candidate.id,
            gift_id: selectedGift.id,
            gift_name: selectedGift.name,
          },
        }
      );

      if (spendError) throw spendError;
      if (!spendResult?.success) {
        throw new Error(spendResult?.error || 'Failed to debit wallet');
      }

      await handleGiftSuccess({
        reference,
        paymentId: reference,
        provider: 'wallet',
        method: 'wallet',
        amount,
        email: currentUser.email,
        name: currentUser.user_metadata?.full_name || 'Member',
      });
    } catch (err) {
      console.error('Gift wallet payment failed:', err);
      if (isNetworkError(err)) {
        reportNetworkError();
        setPaymentStep('selection');
        setProcessing(false);
        if (onGiftError) onGiftError(err?.message || 'Network error');
        return;
      }
      setError(err?.message || 'Wallet payment failed.');
      setPaymentStep('selection');
      setProcessing(false);
    }
  };

  // ----- Flutterwave (Card) payment -----
  const processCardPayment = () => {
    if (!window.FlutterwaveCheckout) {
      setError('Card payment system not loaded. Please try again.');
      setProcessing(false);
      setPaymentStep('selection');
      return;
    }

    const email = currentUser?.email || guestInfo.email;
    const name =
      currentUser?.user_metadata?.full_name || guestInfo.name || 'Supporter';

    if (!email) {
      setError('Email is required.');
      setProcessing(false);
      setPaymentStep('selection');
      return;
    }

    const totalNGN = Math.round(selectedGift.amount * USD_TO_NGN);
    const reference = `GIFT_FLW_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 10)}`;

    try {
      window.FlutterwaveCheckout({
        public_key: FLW_PUBLIC_KEY,
        tx_ref: reference,
        amount: totalNGN,
        currency: 'NGN',
        payment_options: 'card',
        customer: { email, name },
        customizations: {
          title: 'Classic Queen — Send a Gift',
          description: `${selectedGift.name} for ${
            candidate?.full_name || candidate?.username
          }`,
          logo: '/cqi.png',
        },
        callback: (response) => {
          const normalized = normalizePaymentMethod(
            response.payment_type,
            'card'
          );
          handleGiftSuccess({
            reference: response.tx_ref || reference,
            paymentId: response.transaction_id,
            provider: 'flutterwave',
            method: normalized,
            rawMethod: response.payment_type || null,
            rawResponse: response,
            amount: selectedGift.amount,
            email,
            name,
          });
        },
        onclose: () => {
          setProcessing(false);
          setPaymentStep('selection');
          setError('Payment cancelled.');
        },
      });
    } catch (err) {
      console.error('Flutterwave init failed:', err);
      setError('Failed to initialize card payment.');
      setProcessing(false);
      setPaymentStep('selection');
    }
  };

  // ----- Shared success handler -----
  const handleGiftSuccess = async ({
    reference,
    paymentId,
    provider,
    method,
    rawMethod,
    rawResponse,
    amount,
    email,
    name,
  }) => {
    try {
      const totalNGN = Math.round(amount * USD_TO_NGN);

      const row = {
        user_id: currentUser?.id ?? null,
        guest_email: currentUser ? null : email,
        guest_name: currentUser ? null : name,
        candidate_id: candidate.id,
        gift_type: selectedGift.id,
        gift_name: selectedGift.name,
        gift_emoji: selectedGift.emoji,
        amount,
        currency: 'USD',
        payment_method: method,
        payment_provider: provider,
        payment_id: String(paymentId),
        reference,
        status: 'completed',
        metadata: {
          amount_usd: amount,
          amount_ngn_charged: totalNGN,
          usd_to_ngn_rate: USD_TO_NGN,
          raw_payment_method: rawMethod,
          raw_gateway_response: rawResponse,
        },
      };

      const { error: insertError } = await supabase
        .from('gift_transactions')
        .insert(row);

      if (insertError) throw insertError;

      setPaymentStep('success');
      setProcessing(false);

      if (onGiftSuccess) {
        onGiftSuccess(selectedGift, `$${amount.toFixed(2)}`);
      }

      setTimeout(() => {
        handleClose();
      }, 2800);
    } catch (err) {
      console.error('Gift insert failed:', err);
      if (isNetworkError(err)) {
        reportNetworkError();
        setPaymentStep('selection');
        setProcessing(false);
        if (onGiftError) onGiftError(err?.message || 'Network error');
        return;
      }
      setError('Payment verified but gift could not be saved: ' + err.message);
      setPaymentStep('selection');
      setProcessing(false);
      if (onGiftError) onGiftError(err.message);
    }
  };

  // ----- Entry point -----
  const handleProceed = () => {
    if (!selectedGift) {
      setError('Please select a gift.');
      return;
    }
    if (!paymentMethod) {
      setError('Please choose a payment method.');
      return;
    }
    if (paymentMethod !== 'wallet' && !currentUser && !guestInfo.email) {
      setError('Please enter your email address.');
      return;
    }
    if (paymentMethod === 'wallet' && !currentUser) {
      setError('Please sign in to use your wallet.');
      return;
    }

    setError('');
    setProcessing(true);
    setPaymentStep('processing');

    if (paymentMethod === 'wallet') {
      processWalletPayment();
    } else if (paymentMethod === 'card') {
      if (!flutterwaveLoaded) {
        setError('Payment system is loading. Please wait…');
        setProcessing(false);
        setPaymentStep('selection');
        return;
      }
      processCardPayment();
    }
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const resetModal = () => {
    setSelectedGift(null);
    setGuestInfo({ email: '', name: '' });
    setError('');
    setPaymentStep('selection');
    setPaymentMethod(null);
    setProcessing(false);
    setPaymentError({ show: false, message: '', suggestion: '' });
  };

  const totalUSD = selectedGift?.amount ?? 0;
  const totalNGN = selectedGift ? selectedGift.amount * USD_TO_NGN : 0;
  const walletEnough = walletBalance >= totalUSD;

  // ---------- Render ----------
  let view;
  if (paymentStep === 'success') view = 'success';
  else if (paymentStep === 'processing') view = 'processing';
  else view = 'form';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[95] flex items-start justify-center p-3 pt-14 pb-16 overflow-y-auto bg-black/80 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-gradient-to-b from-[#1a0d02] to-black rounded-xl border border-[#c9a227]/30 overflow-hidden my-auto"
            style={{
              maxWidth: '440px',
              maxHeight: 'min(88vh, 760px)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div
              className="p-3 border-b border-[#c9a227]/30 flex items-center justify-between sticky top-0 z-10 flex-shrink-0"
              style={{ background: 'linear-gradient(90deg, #6b4423, #9A7B4F)' }}
            >
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 min-w-0">
                <Gift className="w-4 h-4 text-[#f5d76e]" />
                <span className="truncate">
                  Send a Gift to {candidate?.full_name || candidate?.username}
                </span>
              </h2>

              <div className="flex items-center gap-2 flex-shrink-0">
                <div
                  className="rounded-full overflow-hidden flex-shrink-0"
                  style={{
                    width: 36,
                    height: 36,
                    padding: '2px',
                    background:
                      'conic-gradient(from 45deg, #7a5c14, #f9e79f, #c9a227, #fff4c2, #8a6a1a, #f5d76e, #7a5c14)',
                  }}
                >
                  <div className="relative w-full h-full rounded-full overflow-hidden bg-black">
                    {candidate?.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={candidate.photo}
                        alt={candidate.full_name}
                        style={{
                          position: 'absolute',
                          inset: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center text-[#f5d76e] text-[10px] font-bold">
                        {(candidate?.full_name || 'CQ').charAt(0)}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleClose}
                  className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {view === 'success' && (
                <div className="p-6 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3"
                  >
                    <Check className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    Gift Sent Successfully!
                  </h3>
                  <p className="text-white/60 text-xs mb-3">
                    You sent {selectedGift?.emoji} {selectedGift?.name} to{' '}
                    {candidate?.full_name || `@${candidate?.username}`}
                  </p>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-[#f5d76e] font-semibold text-base">
                      Total: ${totalUSD.toFixed(2)}
                    </p>
                  </div>
                </div>
              )}

              {view === 'processing' && (
                <div className="p-10 text-center">
                  <Loader className="w-8 h-8 text-[#c9a227] animate-spin mx-auto mb-3" />
                  <p className="text-white text-sm font-medium">
                    Verifying payment…
                  </p>
                  <p className="text-white/40 text-xs mt-1">
                    Please do not close this window.
                  </p>
                </div>
              )}

              {view === 'form' && (
                <>
                  {/* Gift grid */}
                  <div className="p-3 border-b border-[#c9a227]/20">
                    <label className="block text-xs font-medium text-white/80 mb-2">
                      Choose a gift for{' '}
                      {candidate?.full_name || `@${candidate?.username}`}
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {GIFTS.map((gift) => {
                        const isSelected = selectedGift?.id === gift.id;
                        return (
                          <button
                            key={gift.id}
                            type="button"
                            onClick={() => {
                              setSelectedGift(gift);
                              setError('');
                            }}
                            className="p-2 rounded-lg border text-center transition-all relative"
                            style={{
                              background: isSelected
                                ? 'rgba(245, 215, 110, 0.15)'
                                : gift.bg,
                              borderColor: isSelected ? '#c9a227' : gift.border,
                              boxShadow: isSelected
                                ? '0 0 0 1px rgba(201, 162, 39, 0.5), 0 4px 12px rgba(0,0,0,0.3)'
                                : '0 2px 6px rgba(0,0,0,0.2)',
                            }}
                          >
                            <div className="text-xl mb-0.5 leading-none">
                              {gift.emoji}
                            </div>
                            <div className="text-[10px] font-semibold text-white leading-tight">
                              {gift.name}
                            </div>
                            <div
                              className="text-[9px] font-bold mt-0.5"
                              style={{ color: gift.accent }}
                            >
                              ${gift.amount}
                            </div>
                            {isSelected && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#c9a227] flex items-center justify-center">
                                <Check size={9} className="text-black" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Selected summary */}
                  {selectedGift && (
                    <div className="p-3 border-b border-[#c9a227]/20">
                      <div
                        className="rounded-lg p-3 border"
                        style={{
                          background: selectedGift.bg,
                          borderColor: selectedGift.border,
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">
                            {selectedGift.emoji}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">
                              {selectedGift.name}
                            </p>
                            <p className="text-xs text-white/60">
                              Amount: ${selectedGift.amount}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Guest info */}
                  {selectedGift && !currentUser && (
                    <div className="p-3 border-b border-[#c9a227]/20 space-y-2">
                      <label className="block text-xs font-medium text-white/80">
                        Your Information
                      </label>
                      <input
                        type="email"
                        placeholder="Email address *"
                        value={guestInfo.email}
                        onChange={(e) =>
                          setGuestInfo({ ...guestInfo, email: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-white/5 border border-[#c9a227]/30 rounded-lg text-xs text-white placeholder-white/40 focus:border-[#c9a227] focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Your name (optional)"
                        value={guestInfo.name}
                        onChange={(e) =>
                          setGuestInfo({ ...guestInfo, name: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-white/5 border border-[#c9a227]/30 rounded-lg text-xs text-white placeholder-white/40 focus:border-[#c9a227] focus:outline-none"
                      />
                    </div>
                  )}

                  {/* Payment method selector */}
                  {selectedGift && (
                    <div className="p-3 border-b border-[#c9a227]/20">
                      <label className="block text-xs font-medium text-white/80 mb-2">
                        Choose payment method
                      </label>

                      <div className="grid grid-cols-2 gap-1.5">
                        {/* Wallet */}
                        <button
                          type="button"
                          onClick={() => {
                            if (!currentUser) {
                              setError('Please sign in to use your wallet.');
                              return;
                            }
                            setPaymentMethod('wallet');
                            setError('');
                          }}
                          onMouseEnter={(e) =>
                            handleMethodHoverEnter(e, paymentMethod === 'wallet')
                          }
                          onMouseLeave={(e) =>
                            handleMethodHoverLeave(
                              e,
                              'wallet',
                              paymentMethod === 'wallet'
                            )
                          }
                          className="p-2 rounded-lg border text-left transition-all duration-200 cursor-pointer"
                          style={getMethodStyle(
                            'wallet',
                            paymentMethod === 'wallet'
                          )}
                        >
                          <Wallet
                            size={14}
                            className={`mb-1 ${
                              paymentMethod === 'wallet'
                                ? 'text-[#c9a227]'
                                : 'text-white'
                            }`}
                          />
                          <span className="block text-[11px] font-bold text-white leading-tight">
                            Wallet
                          </span>
                          <span className="block text-[9px] text-white/75 mt-0.5 leading-tight">
                            {!currentUser
                              ? 'Sign in required'
                              : walletLoading
                              ? '…'
                              : `$${walletBalance.toFixed(2)}`}
                          </span>
                        </button>

                        {/* Card (Flutterwave) */}
                        <button
                          type="button"
                          onClick={() => {
                            setPaymentMethod('card');
                            setError('');
                          }}
                          onMouseEnter={(e) =>
                            handleMethodHoverEnter(e, paymentMethod === 'card')
                          }
                          onMouseLeave={(e) =>
                            handleMethodHoverLeave(
                              e,
                              'card',
                              paymentMethod === 'card'
                            )
                          }
                          className="p-2 rounded-lg border text-left transition-all duration-200 cursor-pointer"
                          style={getMethodStyle(
                            'card',
                            paymentMethod === 'card'
                          )}
                        >
                          <CreditCard
                            size={14}
                            className={`mb-1 ${
                              paymentMethod === 'card'
                                ? 'text-[#c9a227]'
                                : 'text-white'
                            }`}
                          />
                          <span className="block text-[11px] font-bold text-white leading-tight">
                            Card
                          </span>
                          <span className="block text-[9px] text-white/75 mt-0.5 leading-tight">
                            Any currency
                          </span>
                        </button>
                      </div>

                      {paymentMethod === 'wallet' && currentUser && (
                        <div className="mt-2 rounded-lg border border-[#c9a227]/30 bg-[#c9a227]/8 px-2.5 py-2">
                          <p className="text-[10px] text-white/75 leading-snug">
                            <span className="font-semibold text-[#c9a227]">
                              ${totalUSD.toFixed(2)}
                            </span>{' '}
                            will be deducted from your Classic Queen wallet.
                          </p>
                        </div>
                      )}

                      {paymentMethod === 'wallet' &&
                        !walletEnough &&
                        currentUser && (
                          <p className="text-[10px] text-red-400 mt-2 text-center">
                            Insufficient balance — fund your wallet from the
                            dashboard.
                          </p>
                        )}

                      {paymentMethod === 'card' && (
                        <div className="mt-2 rounded-lg border border-[#f97316]/30 bg-[#f97316]/8 px-2.5 py-2">
                          <p className="text-[10px] text-white/75 leading-snug">
                            Secured card payment, powered by{' '}
                            <span className="font-semibold text-white/90">
                              Flutterwave
                            </span>
                            .
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Error */}
                  {error && (
                    <div className="px-3 py-2">
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                        <p className="text-xs text-red-400">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Pay button */}
                  <div className="p-3">
                    <button
                      onClick={handleProceed}
                      disabled={
                        processing ||
                        !selectedGift ||
                        !paymentMethod ||
                        (paymentMethod === 'wallet' && !walletEnough) ||
                        (paymentMethod === 'card' &&
                          !currentUser &&
                          !guestInfo.email)
                      }
                      className="w-full py-3 rounded-lg text-sm font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 flex items-center justify-center gap-2 text-white"
                      style={{
                        background:
                          'linear-gradient(135deg, #9A7B4F 0%, #6b4423 100%)',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
                      }}
                      onMouseEnter={(e) => {
                        if (!processing && selectedGift && paymentMethod) {
                          e.currentTarget.style.background =
                            'linear-gradient(135deg, #16a34a 0%, #15803d 100%)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          'linear-gradient(135deg, #9A7B4F 0%, #6b4423 100%)';
                      }}
                    >
                      {processing ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Processing…
                        </>
                      ) : selectedGift ? (
                        `Send Gift · $${totalUSD.toFixed(2)}`
                      ) : (
                        'Select a Gift'
                      )}
                    </button>

                    {paymentMethod === 'card' && totalNGN > 0 && (
                      <p className="text-[10px] text-white/40 text-center mt-2">
                        Charged as ₦{totalNGN.toLocaleString()} to your card
                      </p>
                    )}

                    <p className="text-[10px] text-white/40 text-center mt-2">
                      By proceeding, you agree to our Terms of Service
                    </p>
                  </div>
                </>
              )}
            </div>
          </motion.div>

          {/* Payment error popup */}
          <AnimatePresence>
            {paymentError.show && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                onClick={() =>
                  setPaymentError({ ...paymentError, show: false })
                }
              >
                <motion.div
                  initial={{ scale: 0.95, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-gradient-to-b from-[#1a0d02] to-black rounded-xl border border-[#c9a227]/30 p-6 max-w-md w-full"
                >
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-8 h-8 text-red-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white text-center mb-2">
                    Payment Failed
                  </h3>
                  <p className="text-white/80 text-center mb-4">
                    {paymentError.message}
                  </p>
                  <div className="bg-white/5 border border-[#c9a227]/20 rounded-lg p-3 mb-6">
                    <p className="text-sm text-white/60 text-center">
                      💡 {paymentError.suggestion}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setPaymentError({ ...paymentError, show: false })
                    }
                    className="w-full py-3 text-white rounded-lg font-semibold hover:brightness-110 transition-all"
                    style={{
                      background:
                        'linear-gradient(135deg, #9A7B4F 0%, #6b4423 100%)',
                    }}
                  >
                    Try Again
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}