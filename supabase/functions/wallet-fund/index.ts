// supabase/functions/wallet-fund/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Must match USD_TO_NGN in FundWalletModal.jsx and VoteModal.jsx
const USD_TO_NGN = 1500;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  console.log("[wallet-fund] invoked", { method: req.method });

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Read env vars INSIDE the handler so they're resolved after injection
    const FLW_SECRET_KEY = Deno.env.get("FLUTTERWAVE_SECRET_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    console.log("[wallet-fund] env check", {
      hasFlwSecret: !!FLW_SECRET_KEY,
      hasSupabaseUrl: !!SUPABASE_URL,
      hasServiceKey: !!SUPABASE_SERVICE_KEY,
    });

    if (!FLW_SECRET_KEY) {
      throw new Error("Missing FLUTTERWAVE_SECRET_KEY");
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      throw new Error("Missing Supabase service credentials");
    }

    const body = await req.json();
    console.log("[wallet-fund] body:", JSON.stringify(body));

    const { user_id, amount, tx_ref, transaction_id } = body;

    if (!user_id || !amount || !tx_ref || !transaction_id) {
      throw new Error(
        `Missing required fields: user_id=${!!user_id} amount=${!!amount} tx_ref=${!!tx_ref} transaction_id=${!!transaction_id}`
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // 1. Idempotency check
    const { data: existing } = await supabase
      .from("wallet_transactions")
      .select("id")
      .eq("reference", tx_ref)
      .maybeSingle();

    if (existing) {
      console.log("[wallet-fund] already processed:", tx_ref);
      return new Response(
        JSON.stringify({ success: true, message: "Already processed" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 2. Verify with Flutterwave
    console.log("[wallet-fund] verifying transaction:", transaction_id);
    const verifyRes = await fetch(
      `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
      {
        headers: { Authorization: `Bearer ${FLW_SECRET_KEY}` },
      }
    );

    const verifyData = await verifyRes.json();

    // Flutterwave returns the amount in the charge currency (NGN).
    // We compare it against the expected NGN amount derived from the USD amount.
    const amountUSD = Number(amount);
    const expectedNGN = Math.round(amountUSD * USD_TO_NGN);
    const flwAmountNGN = Number(verifyData?.data?.amount);

    console.log("[wallet-fund] FLW status:", verifyData?.status);
    console.log("[wallet-fund] FLW data status:", verifyData?.data?.status);
    console.log("[wallet-fund] FLW currency:", verifyData?.data?.currency);
    console.log("[wallet-fund] FLW amount (NGN):", flwAmountNGN);
    console.log("[wallet-fund] expected NGN:", expectedNGN);
    console.log("[wallet-fund] wallet credit (USD):", amountUSD);

    if (verifyData.status !== "success" || verifyData.data?.status !== "successful") {
      throw new Error(
        `Payment verification failed. FLW returned: ${JSON.stringify(verifyData)}`
      );
    }

    if (verifyData.data?.currency && verifyData.data.currency !== "NGN") {
      throw new Error(
        `Unexpected currency from FLW: ${verifyData.data.currency}. Expected NGN.`
      );
    }

    // Allow a small tolerance in case of rounding at Flutterwave's end
    if (flwAmountNGN < expectedNGN - 1) {
      throw new Error(
        `Payment amount too low. Expected ₦${expectedNGN}, got ₦${flwAmountNGN}`
      );
    }

    // 3. Credit wallet atomically (in USD)
    console.log("[wallet-fund] crediting wallet for user:", user_id);
    const { data: creditResult, error } = await supabase.rpc("credit_wallet", {
      p_user_id: user_id,
      p_amount: amountUSD,
      p_reference: tx_ref,
      p_metadata: {
        flw_transaction_id: transaction_id,
        flw_amount_ngn: flwAmountNGN,
        flw_currency: verifyData.data?.currency || "NGN",
        usd_to_ngn_rate: USD_TO_NGN,
      },
    });

    if (error) {
      console.error("[wallet-fund] RPC error:", error.message);
      throw new Error(`Wallet credit failed: ${error.message}`);
    }

    console.log("[wallet-fund] wallet credited:", JSON.stringify(creditResult));

    return new Response(
      JSON.stringify({ success: true, result: creditResult }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[wallet-fund] ERROR:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});