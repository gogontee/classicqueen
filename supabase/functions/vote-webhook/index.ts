// supabase/functions/vote-webhook/index.ts
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
    const { data: existingVote } = await supabase
      .from("vote_transactions")
      .select("id")
      .eq("reference", reference)
      .maybeSingle();

    if (existingVote) {
      console.log("[vote-webhook] Vote already processed:", reference);
      return new Response("Already processed", { status: 200 });
    }

    // 2. Find the pending record
    const { data: pending, error: pendingErr } = await supabase
      .from("pending_vote_transactions")
      .select("*")
      .eq("reference", reference)
      .maybeSingle();

    if (pendingErr) {
      console.error("[vote-webhook] Error finding pending:", pendingErr);
      return new Response(`Pending lookup failed: ${pendingErr.message}`, { status: 500 });
    }

    if (!pending) {
      console.error("[vote-webhook] No pending record for:", reference);
      return new Response("No pending record", { status: 200 });
    }

    // 3. Insert the vote
    const { error: insertErr } = await supabase.from("vote_transactions").insert({
      user_id: pending.user_id,
      guest_email: pending.guest_email,
      guest_name: pending.guest_name,
      candidate_id: pending.candidate_id,
      votes: pending.votes,
      total_amount: pending.total_amount,
      currency: pending.currency,
      reference: reference,
      payment_method: "card",
      payment_provider: "flutterwave",
      payment_id: data.id.toString(),
      status: "completed",
      package_name: "Custom",
      price_per_vote: 1,
    });

    if (insertErr) {
      if (insertErr.code === '23505') return new Response("Already processed", { status: 200 });
      
      // CRITICAL UPDATE: Print and return the exact Postgres error
      console.error("[vote-webhook] Exact DB Error:", JSON.stringify(insertErr));
      return new Response(`Insert failed: ${insertErr.message} | Details: ${insertErr.details} | Hint: ${insertErr.hint}`, { status: 500 });
    }

    // 4. Clean up
    await supabase.from("pending_vote_transactions").delete().eq("reference", reference);

    console.log("[vote-webhook] Successfully credited votes:", reference);
    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("[vote-webhook] Error:", err);
    return new Response(`Internal Error: ${err.message}`, { status: 500 });
  }
});