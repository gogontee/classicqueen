"use client";

import { useState } from "react";
import { Wallet, Plus, ListOrdered, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FundWalletModal from "./FundWalletModal";
import TransactionList from "./TransactionList";
import { formatPoints } from "@/lib/points";

export default function WalletCard({
  balance,
  userId,
  email,
  name,
  onFunded,
}) {
  const [fundOpen, setFundOpen] = useState(false);
  const [txOpen, setTxOpen] = useState(false);

  return (
    <>
      <div className="bg-gradient-to-br from-[#2E1503] to-[#6b4423] rounded-2xl p-5 text-white">
        <div className="flex items-center gap-3 mb-3">
          <Wallet size={20} />
          <span className="text-sm opacity-80">Points Balance</span>
        </div>
        <p className="text-3xl font-bold">{formatPoints(balance)}</p>

        {/* Buttons: Fund (always), View Transactions (mobile only) */}
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={() => setFundOpen(true)}
            className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/30 text-sm font-semibold flex items-center justify-center gap-2 transition"
          >
            <Plus size={14} /> Buy Points
          </button>

          {/* Mobile-only: view transactions */}
          <button
            onClick={() => setTxOpen(true)}
            className="md:hidden flex-1 py-2.5 rounded-xl bg-[#c9a227] hover:brightness-110 text-[#1a0d02] text-sm font-bold flex items-center justify-center gap-2 transition"
          >
            <ListOrdered size={14} /> View Transactions
          </button>
        </div>
      </div>

      <FundWalletModal
        isOpen={fundOpen}
        onClose={() => setFundOpen(false)}
        userId={userId}
        email={email}
        name={name}
        onSuccess={onFunded}
      />

      {/* Mobile-only transactions modal — centered */}
      <AnimatePresence>
        {txOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] md:hidden bg-black/80 backdrop-blur-sm flex items-center justify-center p-3"
            onClick={() => setTxOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl overflow-hidden"
              style={{
                background:
                  "linear-gradient(180deg, #fffdf7 0%, #faf6ee 100%)",
                border: "1px solid rgba(154,123,79,0.35)",
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
                maxHeight: "85vh",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-4 py-3 border-b border-[#9A7B4F]/20 flex-shrink-0"
                style={{
                  background: "linear-gradient(90deg, #6b4423, #9A7B4F)",
                }}
              >
                <div className="flex items-center gap-2 text-white">
                  <ListOrdered size={16} />
                  <span className="text-sm font-bold">Transactions</span>
                </div>
                <button
                  onClick={() => setTxOpen(false)}
                  aria-label="Close"
                  className="p-1.5 rounded-full hover:bg-white/20 transition"
                >
                  <X size={16} className="text-white" />
                </button>
              </div>

              {/* Body */}
              <div className="p-3 overflow-y-auto min-h-0 flex-1">
                <TransactionList
                  userId={userId}
                  visibleCount={6}
                  variant="embedded"
                  showFilters={true}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}