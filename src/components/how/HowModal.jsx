'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Gift, Wallet, Star } from 'lucide-react';
import HowToVote from './HowToVote';
import HowToGift from './HowToGift';
import HowToFundWallet from './HowToFundWallet';
import HowToAddFavorite from './HowToAddFavorite';

const GUIDES = {
  vote: {
    title: 'How to Vote',
    subtitle: 'Cast your vote in a few taps',
    icon: Heart,
    Component: HowToVote,
  },
  gift: {
    title: 'How to Send a Gift',
    subtitle: 'Support your favorite candidate',
    icon: Gift,
    Component: HowToGift,
  },
  fund: {
    title: 'How to Buy Points',
    subtitle: 'Top up your wallet balance',
    icon: Wallet,
    Component: HowToFundWallet,
  },
  favorite: {
    title: 'How to Add a Favorite',
    subtitle: 'Keep your candidates close',
    icon: Star,
    Component: HowToAddFavorite,
  },
};

export default function HowModal({ isOpen, onClose, guide }) {
  const config = guide ? GUIDES[guide] : null;

  return (
    <AnimatePresence>
      {isOpen && config && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-gradient-to-b from-[#1a0d02] to-black rounded-2xl border border-[#c9a227]/30 overflow-hidden"
            style={{
              maxWidth: '440px',
              maxHeight: 'min(88vh, 760px)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div
              className="p-4 border-b border-[#c9a227]/25 flex items-center justify-between flex-shrink-0"
              style={{
                background: 'linear-gradient(90deg, #6b4423, #9A7B4F)',
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-black/25 border border-white/20 flex items-center justify-center flex-shrink-0">
                  <config.icon size={16} className="text-[#f5d76e]" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-white truncate leading-tight">
                    {config.title}
                  </h2>
                  <p className="text-[10px] text-white/70 truncate">
                    {config.subtitle}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors flex-shrink-0"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto min-h-0 p-4">
              <config.Component />
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-[#c9a227]/25 bg-black/40 flex-shrink-0">
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-lg text-white text-sm font-bold transition hover:brightness-110"
                style={{
                  background:
                    'linear-gradient(135deg, #9A7B4F 0%, #6b4423 100%)',
                }}
              >
                Got it
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}