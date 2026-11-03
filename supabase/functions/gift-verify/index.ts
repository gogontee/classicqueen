// supabase/functions/gift-verify/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const FLW_SECRET_KEY = Deno.env.get("FLUTTERWAVE_SECRET_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!FLW_SECRET_KEY) throw new Error("Missing FLUTTERWAVE_SECRET_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) throw new Error("Missing Supabase service credentials");

    const body = await req.json();
    const {
      user_id, guest_email, guest_name, candidate_id, gift_type, gift_name, gift_emoji,
      amount, currency, tx_ref, transaction_id, payment_method, raw_payment_method, raw_gateway_response, skip_verification,
    } = body;

    const skipVerification = skip_verification === true;
    if (!candidate_id || !amount || !tx_ref || !transaction_id) throw new Error("Missing required fields");

    const expectedCurrency = currency || "USD";
    const amountUSD = Number(amount);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Idempotency check
    const { data: existing } = await supabase.from("gift_transactions").select("id").eq("reference", tx_ref).maybeSingle();
    if (existing) return new Response(JSON.stringify({ success: true, message: "Already processed" }), { status: 200, headers: corsHeaders });

    if (!skipVerification) {
      const verifyRes = await fetch(`https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`, { headers: { Authorization: `Bearer ${FLW_SECRET_KEY}` } });
      const verifyData = await verifyRes.json();
      
      const flwStatus = verifyData?.data?.status;
      const flwAmount = Number(verifyData?.data?.amount);
      const flwCurrency = verifyData?.data?.currency;

      // HANDLE PENDING PAYMENTS (Bank Transfers)
      if (flwStatus === "pending" || flwStatus === "success-pending-validation") {
        return new Response(JSON.stringify({ success: true, message: "Payment pending, awaiting bank confirmation" }), { status: 200, headers: corsHeaders });
      }

      if (verifyData.status !== "success" || flwStatus !== "successful") throw new Error(`Payment verification failed. FLW status: ${flwStatus}`);
      if (flwCurrency && flwCurrency !== expectedCurrency) throw new Error(`Currency mismatch.`);

      if (expectedCurrency === "USD") {
        if (flwAmount < amountUSD - 0.01) throw new Error(`Amount too low.`);
      } else {
        const rateRes = await fetch(`https://api.flutterwave.com/v3/transfers/rates?amount=${amountUSD}&destination_currency=USD&source_currency=${expectedCurrency}`, { headers: { Authorization: `Bearer ${FLW_SECRET_KEY}` } });
        const rateData = await rateRes.json();
        const expectedLocalAmount = Number(rateData?.data?.source?.amount);
        if (!expectedLocalAmount || Number.isNaN(expectedLocalAmount)) throw new Error(`Could not verify rate.`);
        if (flwAmount < expectedLocalAmount - 1) throw new Error(`Amount too low for ${expectedCurrency}.`);
      }
    }

    const { error: insertError } = await supabase.from("gift_transactions").insert({
        user_id: user_id || null, guest_email: user_id ? null : guest_email || null, guest_name: user_id ? null : guest_name || null,
        candidate_id, gift_type: gift_type || "custom", gift_name: gift_name || "Gift", gift_emoji: gift_emoji || "🎁",
        amount: amountUSD, currency: "USD", payment_method: payment_method || "card", payment_provider: skipVerification ? "wallet" : "flutterwave",
        payment_id: String(transaction_id), reference: tx_ref, status: "completed",
        metadata: { amount_usd: amountUSD, raw_payment_method, raw_gateway_response, source: skipVerification ? "wallet" : "flutterwave" },
    });

    if (insertError) throw insertError;
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[gift-verify] ERROR:", message);
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: corsHeaders });
  }
});