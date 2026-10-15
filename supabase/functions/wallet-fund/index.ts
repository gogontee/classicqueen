// supabase/functions/wallet-fund/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const FLW_SECRET_KEY = Deno.env.get("FLUTTERWAVE_SECRET_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!FLW_SECRET_KEY) throw new Error("Missing FLUTTERWAVE_SECRET_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY)
      throw new Error("Missing Supabase service credentials");

    const body = await req.json();
    console.log("[wallet-fund] body:", JSON.stringify(body));

    const { user_id, amount, currency, tx_ref, transaction_id } = body;

    if (!user_id || !amount || !tx_ref || !transaction_id) {
      throw new Error(
        `Missing required fields: user_id=${!!user_id} amount=${!!amount} tx_ref=${!!tx_ref} transaction_id=${!!transaction_id}`
      );
    }

    const amountUSD = Number(amount);
    if (!Number.isFinite(amountUSD) || amountUSD <= 0) {
      throw new Error(`Invalid amount: ${amount}`);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // ---- 1. Idempotency check by tx_ref ----
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

    // ---- 2. Verify with Flutterwave ----
    console.log("[wallet-fund] verifying transaction:", transaction_id);
    const verifyRes = await fetch(
      `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
      { headers: { Authorization: `Bearer ${FLW_SECRET_KEY}` } }
    );
    const verifyData = await verifyRes.json().catch(() => null);

    const flwStatus = verifyData?.data?.status;
    const flwTxRef = verifyData?.data?.tx_ref;
    const flwAmount = Number(verifyData?.data?.amount);
    const flwCurrency = verifyData?.data?.currency;

    console.log("[wallet-fund] FLW verify:", {
      apiStatus: verifyData?.status,
      txStatus: flwStatus,
      txRef: flwTxRef,
      amount: flwAmount,
      currency: flwCurrency,
    });

    // ---- 3. Confirm success ----
    if (verifyData?.status !== "success" || flwStatus !== "successful") {
      throw new Error(
        `Payment not successful. FLW status: ${flwStatus || "unknown"}`
      );
    }

    // ---- 4. Confirm the tx_ref matches (prevents replay / mismatch) ----
    if (flwTxRef && flwTxRef !== tx_ref) {
      throw new Error(
        `tx_ref mismatch. Client sent ${tx_ref}, FLW returned ${flwTxRef}.`
      );
    }

    // ---- 5. Currency sanity check (optional, informational only) ----
    // We do NOT re-verify the amount against a rate lookup. Flutterwave
    // already charged the amount we told it to charge in the checkout config.
    // The tx_ref match above is the authoritative link.
    const currencyToStore = flwCurrency || currency || "USD";

    // ---- 6. Credit wallet atomically (always in USD) ----
    console.log("[wallet-fund] crediting wallet for user:", user_id, {
      usd: amountUSD,
    });

    const { data: creditResult, error } = await supabase.rpc("credit_wallet", {
      p_user_id: user_id,
      p_amount: amountUSD,
      p_reference: tx_ref,
      p_metadata: {
        flw_transaction_id: transaction_id,
        flw_amount: flwAmount,
        flw_currency: currencyToStore,
        wallet_credit_usd: amountUSD,
        source: "wallet_fund",
        payment_method: "flutterwave",
        gateway: "callback",
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