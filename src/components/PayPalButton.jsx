"use client";

import { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { createClient } from "@/utils/supabase/client";
import { useNetworkError, isNetworkError } from "@/contexts/NetworkErrorContext";

export default function PayPalButton({
  amount,
  currency = "USD",
  candidate,
  voteCount,
  currentUser,
  guestInfo,
  onSuccess,
  onError,
}) {
  const supabase = createClient();
  const { reportNetworkError } = useNetworkError();
  const [processing, setProcessing] = useState(false);

  return (
    <PayPalScriptProvider
      options={{
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
        currency,
        intent: "capture",
      }}
    >
      <PayPalButtons
        style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay" }}
        disabled={processing}
        forceReRender={[amount, currency, voteCount]}
        createOrder={async () => {
          try {
            const { data, error } = await supabase.functions.invoke(
              "paypal-order",
              {
                body: {
                  amount,
                  currency,
                  candidateId: candidate?.id,
                  votes: voteCount,
                  userId: currentUser?.id ?? null,
                },
              }
            );
            if (error) throw error;
            if (!data?.id) throw new Error("Failed to create PayPal order.");
            return data.id;
          } catch (err) {
            if (isNetworkError(err)) {
              reportNetworkError();
            } else {
              onError?.(err?.message || "Failed to create PayPal order.");
            }
            throw err;
          }
        }}
        onApprove={async (data, actions) => {
          setProcessing(true);
          try {
            const details = await actions.order.capture();
            if (details.status !== "COMPLETED") {
              throw new Error("PayPal payment was not completed.");
            }

            const email =
              details.payer?.email_address || currentUser?.email || guestInfo?.email || "";
            const name =
              details.payer?.name?.given_name ||
              currentUser?.user_metadata?.full_name ||
              guestInfo?.name ||
              "Voter";

            const { error: insertError } = await supabase
              .from("vote_transactions")
              .insert({
                user_id: currentUser?.id ?? null,
                guest_email: currentUser ? null : email,
                guest_name: currentUser ? null : name,
                candidate_id: candidate.id,
                package_name: `${voteCount} Vote${voteCount > 1 ? "s" : ""}`,
                votes: voteCount,
                price_per_vote: amount / voteCount,
                total_amount: amount,
                currency,
                payment_method: "paypal",
                payment_provider: "paypal",
                payment_id: details.id,
                reference: details.id,
                status: "completed",
                metadata: {
                  paypal_order_id: data.orderID,
                  paypal_payer_id: details.payer?.payer_id,
                },
              });

            if (insertError) throw insertError;

            onSuccess?.(voteCount, `$${amount.toFixed(2)}`);
          } catch (err) {
            console.error("PayPal capture/save failed:", err);
            if (isNetworkError(err)) {
              reportNetworkError();
            } else {
              onError?.(err?.message || "Payment could not be saved.");
            }
          } finally {
            setProcessing(false);
          }
        }}
        onCancel={() => {
          onError?.("Payment cancelled.");
        }}
        onError={(err) => {
          console.error("PayPal error:", err);
          if (isNetworkError(err)) {
            reportNetworkError();
          } else {
            onError?.("PayPal encountered an error. Please try again.");
          }
        }}
      />
    </PayPalScriptProvider>
  );
}