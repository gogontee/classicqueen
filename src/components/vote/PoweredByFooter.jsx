"use client";

import Image from "next/image";
import { ShieldCheck, Wallet } from "lucide-react";

export default function PoweredByFooter({ isLoggedIn = false, onOpenWallet }) {
  return (
    <div className="mt-4 space-y-3">
      {/* ============ Secure + Powered by row ============ */}
      <div className="flex items-center justify-center gap-1.5 text-[9px] text-white/40">
        <ShieldCheck size={10} className="text-[#c9a227] flex-shrink-0" />
        <span className="tracking-wide">Secured · Powered by</span>

        {/* Logos cluster */}
        <span className="inline-flex items-center gap-1 ml-1">
          {/* Flutterwave */}
          <span
            className="relative block"
            style={{
              height: "21px",
              width: "93px",
              borderRadius: "9%",
              border: "1px solid rgba(201, 162, 39, 0.55)",
              overflow: "hidden",
              background:
                "linear-gradient(135deg, #faf6ee 0%, #f3e8d5 45%, #e6d3a8 100%)",
            }}
          >
            <Image
              src="/logos/flutterwave.png"
              alt="Flutterwave"
              fill
              sizes="93px"
              style={{
                objectFit: "contain",
                opacity: 0.95,
                padding: "2px",
              }}
            />
          </span>

          {/* Paystack */}
          <span
            className="relative block"
            style={{
              height: "21px",
              width: "87px",
              borderRadius: "9%",
              border: "1px solid rgba(201, 162, 39, 0.55)",
              overflow: "hidden",
              background:
                "linear-gradient(135deg, #faf6ee 0%, #f3e8d5 45%, #e6d3a8 100%)",
            }}
          >
            <Image
              src="/logos/paystack.png"
              alt="Paystack"
              fill
              sizes="87px"
              style={{
                objectFit: "contain",
                opacity: 0.95,
                padding: "2px",
              }}
            />
          </span>
        </span>
      </div>

      {/* ============ Wallet pitch (only if not logged in) ============ */}
      {!isLoggedIn && (
        <div className="mx-0 rounded-xl border border-[#c9a227]/25 bg-gradient-to-br from-[#c9a227]/8 to-[#9A7B4F]/5 p-2.5 flex items-start gap-2">
          <div
            className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
            style={{
              background:
                "conic-gradient(from 45deg, #7a5c14, #f9e79f, #c9a227, #fff4c2, #8a6a1a, #f5d76e, #7a5c14)",
            }}
          >
            <div className="w-full h-full rounded-full bg-[#1a0d02] flex items-center justify-center">
              <Wallet size={11} className="text-[#f5d76e]" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-white/70 leading-snug">
              <span className="font-semibold text-[#c9a227]">
                Vote faster with a wallet.
              </span>{" "}
              Sign up free, fund once, and vote in one tap — no cards or
              transfers every time.
            </p>
          </div>
        </div>
      )}

      {/* ============ Wallet reminder (if logged in) ============ */}
      {isLoggedIn && (
        <div className="flex items-center justify-center gap-2 text-[9px] text-white/35">
          <Wallet size={10} className="text-[#c9a227]" />
          <span className="tracking-wide">
            Fund your wallet once — vote in one tap forever
          </span>
        </div>
      )}
    </div>
  );
}