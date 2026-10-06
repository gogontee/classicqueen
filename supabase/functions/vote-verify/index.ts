// supabase/functions/vote-verify/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  console.log("[vote-verify] invoked", { method: req.method });

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
    console.log("[vote-verify] body:", JSON.stringify(body));

    const {
      user_id,
      guest_email,
      guest_name,
      candidate_id,
      votes,
      amount,
      currency,
      tx_ref,
      transaction_id,
      payment_method,
      raw_payment_method,
      raw_gateway_response,
      skip_verification,
    } = body;

    const skipVerification = skip_verification === true;

    if (!candidate_id || !votes || !amount || !tx_ref || !transaction_id) {
      throw new Error("Missing required fields");
    }

    const expectedCurrency = currency || "USD";
    const amountUSD = Number(amount);
    const voteCount = Number(votes);
    const PRICE_PER_VOTE_USD = 1;

    if (voteCount < 1) throw new Error("Vote count must be at least 1");
    if (Math.abs(voteCount * PRICE_PER_VOTE_USD - amountUSD) > 0.01) {
      throw new Error("Vote count and amount do not match");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // 1. Idempotency check
    const { data: existing } = await supabase
      .from("vote_transactions")
      .select("id")
      .eq("reference", tx_ref)
      .maybeSingle();

    if (existing) {
      console.log("[vote-verify] already processed:", tx_ref);
      return new Response(
        JSON.stringify({ success: true, message: "Already processed" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ---- Flutterwave verification block (skipped for wallet payments) ----
    if (!skipVerification) {
      console.log("[vote-verify] verifying with FLW:", transaction_id);
      const verifyRes = await fetch(
        `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
        { headers: { Authorization: `Bearer ${FLW_SECRET_KEY}` } }
      );
      const verifyData = await verifyRes.json();

      const flwAmount = Number(verifyData?.data?.amount);
      const flwCurrency = verifyData?.data?.currency;

      console.log("[vote-verify] FLW status:", verifyData?.status);
      console.log("[vote-verify] FLW currency:", flwCurrency);
      console.log("[vote-verify] FLW amount:", flwAmount);
      console.log("[vote-verify] expected currency:", expectedCurrency);
      console.log("[vote-verify] expected USD:", amountUSD);

      if (
        verifyData.status !== "success" ||
        verifyData.data?.status !== "successful"
      ) {
        throw new Error("Payment verification failed");
      }

      // Currency match
      if (flwCurrency && flwCurrency !== expectedCurrency) {
        throw new Error(
          `Currency mismatch. Client sent ${expectedCurrency}, FLW returned ${flwCurrency}.`
        );
      }

      // Amount verification (server-side rate check for non-USD)
      if (expectedCurrency === "USD") {
        if (flwAmount < amountUSD - 0.01) {
          throw new Error(
            `Amount too low. Expected $${amountUSD.toFixed(
              2
            )}, got $${flwAmount.toFixed(2)}`
          );
        }
      } else {
        const rateRes = await fetch(
          `https://api.flutterwave.com/v3/transfers/rates?amount=${amountUSD}&destination_currency=USD&source_currency=${expectedCurrency}`,
          { headers: { Authorization: `Bearer ${FLW_SECRET_KEY}` } }
        );
        const rateData = await rateRes.json();
        const expectedLocalAmount = Number(rateData?.data?.source?.amount);

        if (!expectedLocalAmount || Number.isNaN(expectedLocalAmount)) {
          throw new Error(`Could not verify rate for ${expectedCurrency}`);
        }

        if (flwAmount < expectedLocalAmount - 1) {
          throw new Error(
            `Amount too low for ${expectedCurrency}. Expected ${expectedLocalAmount}, got ${flwAmount}`
          );
        }
      }
    } else {
      console.log("[vote-verify] skipping FLW verification (wallet payment)");
    }

    // 2. Insert the vote transaction (triggers vote_count increment)
    const { error: insertError } = await supabase
      .from("vote_transactions")
      .insert({
        user_id: user_id || null,
        guest_email: user_id ? null : guest_email || null,
        guest_name: user_id ? null : guest_name || null,
        candidate_id,
        package_name: `${voteCount} Vote${voteCount > 1 ? "s" : ""}`,
        votes: voteCount,
        price_per_vote: PRICE_PER_VOTE_USD,
        total_amount: amountUSD,
        currency: "USD",
        payment_method: payment_method || "card",
        payment_provider: skipVerification ? "wallet" : "flutterwave",
        payment_id: String(transaction_id),
        reference: tx_ref,
        status: "completed",
        metadata: {
          amount_usd: amountUSD,
          raw_payment_method: raw_payment_method || null,
          raw_gateway_response: raw_gateway_response || null,
          source: skipVerification ? "wallet" : "flutterwave",
        },
      });

    if (insertError) throw insertError;

    console.log("[vote-verify] vote recorded for:", candidate_id);

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[vote-verify] ERROR:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});