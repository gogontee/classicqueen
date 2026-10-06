"use client";
import { useState } from "react";
import { FlutterWaveButton, closePaymentModal } from "flutterwave-react-v3";
import { createClient } from "@/utils/supabase/client";

export default function FundWalletModal({
  isOpen,
  onClose,
  userId,
  email,
  name,
  onSuccess,
}) {
  const supabase = createClient();
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState(""); // "", "processing", "error"
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const amountUSD = Number(amount) || 0;

  const config = {
    public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY,
    tx_ref: `WALLET_${userId}_${Date.now()}`,
    amount: amountUSD,
    currency: "USD",
    payment_options:
      "card, mobilemoneyghana, mobilemoneyuganda, mobilemoneykenya, ussd, banktransfer",
    customer: {
      email: email || "",
      name: name || "",
    },
    customizations: {
      title: "Fund Your Wallet",
      description: `Add $${amountUSD.toFixed(2)} to vote for your favorite queen`,
      logo: "/cqi.png",
    },
  };

  const fwConfig = {
    ...config,
    text: `Fund $${amountUSD.toFixed(2)}`,
    callback: async (response) => {
      setStatus("processing");
      setErrorMsg("");

      try {
        const { data, error } = await supabase.functions.invoke(
          "wallet-fund",
          {
            body: {
              user_id: userId,
              amount: amountUSD,
              tx_ref: response.tx_ref,
              transaction_id: response.transaction_id,
            },
          }
        );

        if (error) {
          throw new Error(error.message || "Failed to credit wallet");
        }

        if (!data?.success) {
          throw new Error(data?.error || "Wallet credit failed on server");
        }

        closePaymentModal();
        onSuccess?.();
        onClose();
      } catch (err) {
        console.error("[fund-wallet] callback error:", err);
        setStatus("error");
        setErrorMsg(
          err?.message || "Something went wrong. Please contact support."
        );
      }
    },
    onClose: () => {},
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
        <h3 className="text-lg font-bold text-[#2E1503] mb-4">Fund Wallet</h3>

        <input
          type="number"
          min="1"
          step="1"
          placeholder="Amount in USD"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={status === "processing"}
          className="w-full px-4 py-3 border rounded-xl mb-4 text-center text-lg disabled:opacity-50"
        />

        {status === "processing" && (
          <p className="text-xs text-center text-[#6b4423] mb-3">
            Crediting your wallet…
          </p>
        )}

        {status === "error" && (
          <div className="text-xs text-center text-red-600 bg-red-50 border border-red-200 rounded-lg p-2 mb-3">
            {errorMsg}
          </div>
        )}

        <FlutterWaveButton
          {...fwConfig}
          className="w-full py-3 bg-gradient-to-r from-[#9A7B4F] to-[#6b4423] text-white rounded-xl font-bold"
        />

        <button
          onClick={onClose}
          disabled={status === "processing"}
          className="mt-3 text-sm text-gray-500 w-full disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}