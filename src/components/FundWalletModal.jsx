"use client";
import { useState, useEffect } from "react";
import { FlutterWaveButton, closePaymentModal } from "flutterwave-react-v3";
import { createClient } from "@/utils/supabase/client";
import { getUserCurrency } from "@/lib/currency";

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
  const [status, setStatus] = useState(""); // "", "fetching-rate", "processing", "error"
  const [errorMsg, setErrorMsg] = useState("");
  const [chargeAmount, setChargeAmount] = useState(null); // amount in user's local currency
  const [userCurrency, setUserCurrency] = useState("USD");

  // Reset when closed
  useEffect(() => {
    if (!isOpen) {
      setAmount("");
      setStatus("");
      setErrorMsg("");
      setChargeAmount(null);
      setUserCurrency("USD");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const amountUSD = Number(amount) || 0;

  const handleFund = async () => {
    if (amountUSD < 1) {
      setErrorMsg("Please enter an amount of at least $1.");
      return;
    }

    setStatus("fetching-rate");
    setErrorMsg("");

    const currency = getUserCurrency();
    setUserCurrency(currency);

    // If already USD, use the amount directly
    if (currency === "USD") {
      setChargeAmount(amountUSD);
      setStatus("");
      return;
    }

    // Otherwise, fetch the local equivalent from Flutterwave
    try {
      const res = await fetch(
        `/api/get-rate?amount=${amountUSD}&from=${currency}`
      );
      const data = await res.json();

      if (!res.ok || !data.amount) {
        throw new Error(data.error || "Could not fetch exchange rate.");
      }

      setChargeAmount(data.amount);
      setStatus("");
    } catch (err) {
      console.error("[fund-wallet] rate error:", err);
      setStatus("error");
      setErrorMsg(err?.message || "Failed to fetch rate. Please try again.");
    }
  };

  const config = {
    public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY,
    tx_ref: `WALLET_${userId}_${Date.now()}`,
    amount: chargeAmount,
    currency: userCurrency,
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
              amount: amountUSD, // still in USD — this is what the wallet gets
              currency: userCurrency, // what Flutterwave actually charged in
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

  // Show the Flutterwave button only after the rate has been fetched
  const readyToPay = chargeAmount !== null && chargeAmount > 0;

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
          onChange={(e) => {
            setAmount(e.target.value);
            setChargeAmount(null);
            setErrorMsg("");
            setStatus("");
          }}
          disabled={status === "processing" || status === "fetching-rate"}
          className="w-full px-4 py-3 border rounded-xl mb-3 text-center text-lg disabled:opacity-50"
        />

        {userCurrency !== "USD" && readyToPay && (
          <p className="text-xs text-center text-[#6b4423] mb-3">
            You&apos;ll be charged{" "}
            <span className="font-semibold">
              {chargeAmount} {userCurrency}
            </span>{" "}
            ≈ ${amountUSD.toFixed(2)}
          </p>
        )}

        {status === "fetching-rate" && (
          <p className="text-xs text-center text-[#6b4423] mb-3">
            Fetching exchange rate…
          </p>
        )}

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

        {/* Step 1: fetch the rate */}
        {!readyToPay && (
          <button
            onClick={handleFund}
            disabled={
              amountUSD < 1 ||
              status === "processing" ||
              status === "fetching-rate"
            }
            className="w-full py-3 bg-gradient-to-r from-[#9A7B4F] to-[#6b4423] text-white rounded-xl font-bold disabled:opacity-50"
          >
            {status === "fetching-rate" ? "Fetching rate…" : "Continue"}
          </button>
        )}

        {/* Step 2: open Flutterwave */}
        {readyToPay && (
          <FlutterWaveButton
            {...fwConfig}
            className="w-full py-3 bg-gradient-to-r from-[#9A7B4F] to-[#6b4423] text-white rounded-xl font-bold"
          />
        )}

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