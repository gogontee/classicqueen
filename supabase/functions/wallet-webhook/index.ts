// supabase/functions/wallet-webhook/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Verify the webhook signature to ensure it's from Flutterwave [citation:1][citation:14]
    const signature = req.headers.get("verif-hash");
    const secretHash = Deno.env.get("FLUTTERWAVE_WEBHOOK_HASH");
    
    if (!signature || signature !== secretHash) {
      console.error("[wallet-webhook] Invalid or missing signature");
      return new Response("Forbidden", { status: 403 });
    }

    const payload = await req.json();
    console.log("[wallet-webhook] Received payload:", JSON.stringify(payload));

    const event = payload?.event;
    const data = payload?.data;

    // We only care about successful charge events
    if (event !== "charge.completed" || data?.status !== "successful") {
      return new Response("Ignored", { status: 200 });
    }

    const txRef = data.tx_ref || "";
    
    // Only process wallet funding transactions
    if (!txRef.startsWith("WALLET_")) {
      return new Response("Ignored (not wallet funding)", { status: 200 });
    }

    // Extract user_id from the tx_ref: WALLET_<uuid>_<timestamp>
    const match = txRef.match(/^WALLET_([0-9a-f-]{36})_/i);
    if (!match) {
      console.error("[wallet-webhook] Could not parse user_id from tx_ref:", txRef);
      return new Response("Bad tx_ref", { status: 400 });
    }
    const userId = match[1];

    // 2. Initialize Supabase with the service role key to bypass RLS
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 3. Idempotency check: Has this payment already been processed? [citation:1]
    const { data: existing } = await supabase
      .from("wallet_transactions")
      .select("id")
      .eq("reference", txRef)
      .maybeSingle();

    if (existing) {
      console.log("[wallet-webhook] Already processed:", txRef);
      return new Response("Already processed", { status: 200 });
    }

    // 4. Verify the transaction with Flutterwave to be absolutely sure
    const FLW_SECRET_KEY = Deno.env.get("FLUTTERWAVE_SECRET_KEY");
    const verifyRes = await fetch(
      `https://api.flutterwave.com/v3/transactions/${data.id}/verify`,
      { headers: { Authorization: `Bearer ${FLW_SECRET_KEY}` } }
    );
    const verifyData = await verifyRes.json();

    if (verifyData?.data?.status !== "successful") {
      console.error("[wallet-webhook] FLW verification failed:", verifyData);
      return new Response("Verification failed", { status: 400 });
    }

    // 5. Determine the amount to credit.
    // The webhook payload only has the local amount (e.g., UGX).
    // You need to know the USD amount that was intended.
    // This requires looking up a "pending" record created when the user started the payment.
    const { data: pending } = await supabase
      .from("pending_wallet_funds")
      .select("usd_amount")
      .eq("tx_ref", txRef)
      .maybeSingle();

    if (!pending) {
      console.error("[wallet-webhook] No pending record found for tx_ref:", txRef);
      return new Response("No pending record", { status: 200 });
    }

    const usdAmount = Number(pending.usd_amount);

    // 6. Credit the wallet using your RPC
    const { error: creditErr } = await supabase.rpc("credit_wallet", {
      p_user_id: userId,
      p_amount: usdAmount,
      p_reference: txRef,
      p_metadata: {
        source: "wallet_fund",
        payment_method: "flutterwave",
        gateway: "webhook",
        flw_transaction_id: data.id,
        flw_amount: data.amount,
        flw_currency: data.currency,
      },
    });

    if (creditErr) {
      console.error("[wallet-webhook] Credit failed:", creditErr);
      // Return 500 so Flutterwave retries the webhook later [citation:8][citation:14]
      return new Response("Credit failed", { status: 500 });
    }

    console.log("[wallet-webhook] Successfully credited wallet for:", txRef);
    return new Response("OK", { status: 200 });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[wallet-webhook] Error:", message);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
});