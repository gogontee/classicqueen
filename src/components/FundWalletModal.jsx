"use client";
import { useState, useEffect } from "react";
import { FlutterWaveButton, closePaymentModal } from "flutterwave-react-v3";
import { createClient } from "@/utils/supabase/client";
import { getUserCurrency } from "@/lib/currency";
import { formatPoints } from "@/lib/points";

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
  const [chargeAmount, setChargeAmount] = useState(null);
  const [userCurrency, setUserCurrency] = useState("USD");
  const [rateFallback, setRateFallback] = useState(false);

  // ---- New: the tx_ref and the amount we'll credit ----
  // These are fixed at the moment the user clicks "Continue" so that
  // the pending record, the Flutterwave charge, the callback, and the
  // webhook all reference the exact same transaction.
  const [pendingTxRef, setPendingTxRef] = useState(null);
  const [lockedAmountUSD, setLockedAmountUSD] = useState(null);

  // Reset when closed
  useEffect(() => {
    if (!isOpen) {
      setAmount("");
      setStatus("");
      setErrorMsg("");
      setChargeAmount(null);
      setUserCurrency("USD");
      setRateFallback(false);
      setPendingTxRef(null);
      setLockedAmountUSD(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // `amount` is the number of points the user wants to buy.
  // 1 pt = 1 USD in the backend.
  const amountPoints = Number(amount) || 0;
  const amountUSD = amountPoints; // 1:1

  const handleFund = async () => {
    if (amountPoints < 1) {
      setErrorMsg("Please enter at least 1 point.");
      return;
    }

    setStatus("fetching-rate");
    setErrorMsg("");
    setRateFallback(false);

    const currency = getUserCurrency();

    // ---- 1. Determine how much to charge in local currency ----
    let localCharge = amountUSD;
    let chargeCurrency = currency;
    let fallback = false;

    if (currency !== "USD") {
      try {
        const res = await fetch(
          `/api/get-rate?amount=${amountUSD}&from=${currency}`
        );
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.amount) {
          throw new Error(data?.error || "Could not fetch exchange rate.");
        }
        localCharge = Number(data.amount);
      } catch (err) {
        console.warn(
          "[fund-wallet] rate fetch failed, falling back to USD:",
          err?.message
        );
        localCharge = amountUSD;
        chargeCurrency = "USD";
        fallback = true;
      }
    }

    // ---- 2. Generate a single tx_ref for this payment ----
    const txRef = `WALLET_${userId}_${Date.now()}`;

    // ---- 3. Write the pending record BEFORE opening Flutterwave ----
    // The webhook reads this to know how many points to credit.
    const { error: pendingErr } = await supabase
      .from("pending_wallet_funds")
      .insert({
        tx_ref: txRef,
        user_id: userId,
        usd_amount: amountUSD,
        currency: chargeCurrency,
        local_amount: localCharge,
      });

    if (pendingErr) {
      console.error("[fund-wallet] pending insert failed:", pendingErr);
      setStatus("error");
      setErrorMsg("Could not start payment. Please try again.");
      return;
    }

    // ---- 4. Commit state so the Flutterwave config uses these values ----
    setPendingTxRef(txRef);
    setLockedAmountUSD(amountUSD);
    setUserCurrency(chargeCurrency);
    setChargeAmount(localCharge);
    setRateFallback(fallback);
    setStatus("");
  };

  const config = {
    public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY,
    tx_ref: pendingTxRef, // same ref as the pending record
    amount: chargeAmount,
    currency: userCurrency,
    payment_options:
      "card, mobilemoneyghana, mobilemoneyuganda, mobilemoneykenya, ussd, banktransfer",
    customer: {
      email: email || "",
      name: name || "",
    },
    customizations: {
      title: "Buy Points",
      description: `Add ${formatPoints(amountPoints)} to vote for your favorite queen`,
      logo: "/cqi.png",
    },
  };

  const fwConfig = {
    ...config,
    text: `Buy ${formatPoints(amountPoints)}`,
    callback: async (response) => {
      setStatus("processing");
      setErrorMsg("");

      try {
        // Use the locked USD amount, not a re-derived one, so the credit
        // matches exactly what the pending record says.
        const creditUSD = lockedAmountUSD ?? amountUSD;

        const { data, error } = await supabase.functions.invoke(
          "wallet-fund",
          {
            body: {
              user_id: userId,
              amount: creditUSD, // the USD amount to credit
              currency: userCurrency, // what Flutterwave charged in
              tx_ref: response.tx_ref || pendingTxRef,
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
  const readyToPay = chargeAmount !== null && chargeAmount > 0 && !!pendingTxRef;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
        <h3 className="text-lg font-bold text-[#2E1503] mb-4">
          Buy Points
        </h3>

        <input
          type="number"
          min="1"
          step="1"
          placeholder="Number of points"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            // Any change to the amount invalidates the pending record
            // and forces the user to click Continue again, so the new
            // pending row can be written for the new amount.
            setChargeAmount(null);
            setPendingTxRef(null);
            setLockedAmountUSD(null);
            setErrorMsg("");
            setStatus("");
            setRateFallback(false);
          }}
          disabled={status === "processing" || status === "fetching-rate"}
          className="w-full px-4 py-3 border rounded-xl mb-3 text-center text-lg disabled:opacity-50"
        />

        {userCurrency !== "USD" && readyToPay && (
          <p className="text-xs text-center text-[#6b4423] mb-3">
            You&apos;ll be charged{" "}
            <span className="font-semibold">
              {chargeAmount} {userCurrency}
            </span>
          </p>
        )}

        {rateFallback && readyToPay && (
          <p className="text-xs text-center text-[#6b4423] mb-3">
            Local pricing unavailable — you&apos;ll be charged{" "}
            <span className="font-semibold">
              ${Number(chargeAmount).toFixed(2)} USD
            </span>
          </p>
        )}

        {status === "fetching-rate" && (
          <p className="text-xs text-center text-[#6b4423] mb-3">
            Fetching exchange rate…
          </p>
        )}

        {status === "processing" && (
          <p className="text-xs text-center text-[#6b4423] mb-3">
            Adding points to your wallet…
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
              amountPoints < 1 ||
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