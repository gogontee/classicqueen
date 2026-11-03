// supabase/functions/gift-webhook/index.ts
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

    // 1. Idempotency Check
    const { data: existing } = await supabase
      .from("gift_transactions")
      .select("id")
      .eq("tx_ref", reference)
      .maybeSingle();

    if (existing) return new Response("Already processed", { status: 200 });

    // 2. Find Pending Gift
    const { data: pending } = await supabase
      .from("pending_gift_transactions")
      .select("*")
      .eq("tx_ref", reference)
      .maybeSingle();

    if (!pending) {
      console.error("[gift-webhook] No pending record:", reference);
      return new Response("No pending record", { status: 200 });
    }

    // 3. Insert Gift
    const { error: insertErr } = await supabase.from("gift_transactions").insert({
      user_id: pending.user_id,
      guest_email: pending.guest_email,
      guest_name: pending.guest_name,
      candidate_id: pending.candidate_id,
      gift_type: pending.gift_type,
      gift_name: pending.gift_name,
      gift_emoji: pending.gift_emoji,
      amount: pending.amount,
      tx_ref: reference,
      payment_method: "card",
      status: "completed",
    });

    if (insertErr) {
      if (insertErr.code === '23505') return new Response("Already processed", { status: 200 });
      console.error("[gift-webhook] Insert failed:", insertErr);
      return new Response("Insert failed", { status: 500 });
    }

    // 4. Cleanup
    await supabase.from("pending_gift_transactions").delete().eq("tx_ref", reference);

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("[gift-webhook] Error:", err);
    return new Response("Internal Error", { status: 500 });
  }
});