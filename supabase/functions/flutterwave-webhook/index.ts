// supabase/functions/flutterwave-webhook/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const FLW_WEBHOOK_HASH = Deno.env.get("FLUTTERWAVE_WEBHOOK_HASH");
    const signature = req.headers.get("verif-hash");

    if (!signature || signature !== FLW_WEBHOOK_HASH) {
      return new Response("Forbidden", { status: 403 });
    }

    const payload = await req.json();
    const data = payload?.data;
    
    // Only process successful charges
    if (payload?.event !== "charge.completed" || data?.status !== "successful") {
      return new Response("Ignored", { status: 200 });
    }

    const reference = data.tx_ref || "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;

    // Route based on prefix
    let targetFunction = "";
    if (reference.startsWith("VOTE_")) targetFunction = "vote-webhook";
    else if (reference.startsWith("GIFT_")) targetFunction = "gift-webhook";
    else if (reference.startsWith("WALLET_")) targetFunction = "wallet-webhook";
    else return new Response("Ignored", { status: 200 });

    console.log(`[master-webhook] Routing ${reference} to ${targetFunction}`);

    // Forward the request
    const response = await fetch(`${supabaseUrl}/functions/v1/${targetFunction}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "verif-hash": signature,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`[master-webhook] ${targetFunction} failed:`, await response.text());
      return new Response("Internal Error", { status: 500 });
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    return new Response("Internal Error", { status: 500 });
  }
});