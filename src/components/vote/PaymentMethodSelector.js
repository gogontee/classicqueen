"use client";

import { Wallet, CreditCard, ShieldCheck, Zap } from "lucide-react";
import { formatPoints } from "@/lib/points";

export default function PaymentMethodSelector({
  method,
  onChange,
  isLoggedIn,
  walletBalance,
  walletLoading,
  walletEnough,
  totalUSD,
}) {
  const schemes = {
    wallet: {
      base: "linear-gradient(135deg, #6b4423 0%, #9A7B4F 50%, #c9a227 100%)",
      border: "rgba(154, 123, 79, 0.7)",
    },
    card: {
      base: "linear-gradient(135deg, #ea580c 0%, #f97316 50%, #fb923c 100%)",
      border: "rgba(249, 115, 22, 0.7)",
    },
  };

  const HOVER_BG =
    "linear-gradient(135deg, #15803d 0%, #16a34a 50%, #22c55e 100%)";
  const HOVER_BORDER = "rgba(34, 197, 94, 0.85)";
  const SELECTED_BG = "rgba(201, 162, 39, 0.18)";
  const SELECTED_BORDER = "#c9a227";

  const getButtonStyle = (key, isSelected) => {
    const scheme = schemes[key];
    return {
      background: isSelected ? SELECTED_BG : scheme.base,
      borderColor: isSelected ? SELECTED_BORDER : scheme.border,
      boxShadow: isSelected
        ? "0 0 0 1px rgba(201, 162, 39, 0.5), 0 4px 12px rgba(0,0,0,0.3)"
        : "0 2px 6px rgba(0,0,0,0.25)",
    };
  };

  const handleMouseEnter = (e, isSelected) => {
    if (isSelected) return;
    e.currentTarget.style.background = HOVER_BG;
    e.currentTarget.style.borderColor = HOVER_BORDER;
    e.currentTarget.style.boxShadow = "0 4px 14px rgba(22, 163, 74, 0.35)";
  };

  const handleMouseLeave = (e, key, isSelected) => {
    const scheme = schemes[key];
    if (isSelected) {
      e.currentTarget.style.background = SELECTED_BG;
      e.currentTarget.style.borderColor = SELECTED_BORDER;
      e.currentTarget.style.boxShadow =
        "0 0 0 1px rgba(201, 162, 39, 0.5), 0 4px 12px rgba(0,0,0,0.3)";
    } else {
      e.currentTarget.style.background = scheme.base;
      e.currentTarget.style.borderColor = scheme.border;
      e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.25)";
    }
  };

  const baseClass =
    "p-2 rounded-lg border text-left transition-all duration-200 cursor-pointer";

  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        {/* Wallet — always visible so guests can discover it */}
        <button
          type="button"
          onClick={() => onChange("wallet")}
          onMouseEnter={(e) => handleMouseEnter(e, method === "wallet")}
          onMouseLeave={(e) =>
            handleMouseLeave(e, "wallet", method === "wallet")
          }
          className={baseClass}
          style={getButtonStyle("wallet", method === "wallet")}
        >
          <Wallet
            size={14}
            className={`mb-1 ${
              method === "wallet" ? "text-[#c9a227]" : "text-white"
            }`}
          />
          <span className="block text-[11px] font-bold text-white leading-tight">
            Wallet
          </span>
          <span className="block text-[9px] text-white/75 mt-0.5 leading-tight">
            {!isLoggedIn
              ? "Sign up free"
              : walletLoading
              ? "…"
              : formatPoints(walletBalance)}
          </span>
        </button>

        {/* Card / Bank — Flutterwave handles both */}
        <button
          type="button"
          onClick={() => onChange("card")}
          onMouseEnter={(e) => handleMouseEnter(e, method === "card")}
          onMouseLeave={(e) => handleMouseLeave(e, "card", method === "card")}
          className={baseClass}
          style={getButtonStyle("card", method === "card")}
        >
          <CreditCard
            size={14}
            className={`mb-1 ${
              method === "card" ? "text-[#c9a227]" : "text-white"
            }`}
          />
          <span className="block text-[11px] font-bold text-white leading-tight">
            Card/Bank
          </span>
          <span className="block text-[9px] text-white/75 mt-0.5 leading-tight">
            Any currency · Transfer & more
          </span>
        </button>
      </div>

      {/* ---- Info panel under the buttons, per selection ---- */}

      {method === "wallet" && isLoggedIn && (
        <div className="mt-2 rounded-lg border border-[#c9a227]/30 bg-[#c9a227]/8 px-2.5 py-2 flex items-start gap-2">
          <Zap size={12} className="text-[#c9a227] flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-white/75 leading-snug">
            <span className="font-semibold text-[#c9a227]">
              {formatPoints(totalUSD)}
            </span>{" "}
            will be deducted from your points balance.
            <span className="block text-white/55 mt-0.5">
              Fast, easy, one-tap voting — no cards or transfers needed.
            </span>
          </p>
        </div>
      )}

      {method === "wallet" && isLoggedIn && !walletEnough && (
        <p className="text-[10px] text-red-400 mt-2 text-center">
          Insufficient balance — buy points from the dashboard.
        </p>
      )}

      {method === "card" && (
        <div className="mt-2 rounded-lg border border-[#f97316]/30 bg-[#f97316]/8 px-2.5 py-2 flex items-start gap-2">
          <ShieldCheck
            size={12}
            className="text-[#fb923c] flex-shrink-0 mt-0.5"
          />
          <p className="text-[10px] text-white/75 leading-snug">
            <span className="font-semibold text-[#fb923c]">
              Secured payment
            </span>{" "}
            — pay with any card or bank transfer, worldwide. Powered by{" "}
            <span className="font-semibold text-white/90">Flutterwave</span>.
          </p>
        </div>
      )}
    </>
  );
}