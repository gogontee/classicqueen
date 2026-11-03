// supabase/functions/wallet-webhook/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const FLW_WEBHOOK_HASH = Deno.env.get("FLUTTERWAVE_WEBHOOK_HASH");
    const signature = req.headers.get("verif-hash");
    if (!signature || signature !== FLW_WEBHOOK_HASH) return new Response("Forbidden", { status: 403 });

    const payload = await req.json();
    const data = payload?.data;
    const reference = data.tx_ref || "";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Idempotency check
    const { data: existing } = await supabase
      .from("wallet_transactions")
      .select("id")
      .eq("reference", reference)
      .maybeSingle();

    if (existing) {
      console.log("[wallet-webhook] Already processed:", reference);
      return new Response("Already processed", { status: 200 });
    }

    // 2. Verify with Flutterwave (Extra safety)
    const FLW_SECRET_KEY = Deno.env.get("FLUTTERWAVE_SECRET_KEY");
    const verifyRes = await fetch(
      `https://api.flutterwave.com/v3/transactions/${data.id}/verify`,
      { headers: { Authorization: `Bearer ${FLW_SECRET_KEY}` } }
    );
    const verifyData = await verifyRes.json();

    if (verifyData?.data?.status !== "successful") {
      return new Response("Verification failed", { status: 400 });
    }

    // 3. Find pending record
    const { data: pending } = await supabase
      .from("pending_wallet_funds")
      .select("usd_amount, user_id")
      .eq("tx_ref", reference)
      .maybeSingle();

    if (!pending) {
      console.error("[wallet-webhook] No pending record found:", reference);
      return new Response("No pending record", { status: 200 });
    }

    const usdAmount = Number(pending.usd_amount);
    const userId = pending.user_id; 

    if (!userId) return new Response("No user id in pending record", { status: 400 });

    // 4. Credit the wallet
    const { error: creditErr } = await supabase.rpc("credit_wallet", {
      p_user_id: userId,
      p_amount: usdAmount,
      p_reference: reference,
      p_metadata: {
        source: "wallet_fund",
        payment_method: "flutterwave",
        gateway: "webhook",
        flw_transaction_id: data.id,
      },
    });

    if (creditErr) {
      console.error("[wallet-webhook] Credit failed:", creditErr);
      return new Response("Credit failed", { status: 500 });
    }

    // 5. Cleanup
    await supabase.from("pending_wallet_funds").delete().eq("tx_ref", reference);

    console.log("[wallet-webhook] Successfully credited wallet:", reference);
    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("[wallet-webhook] Error:", err);
    return new Response("Internal Error", { status: 500 });
  }
});