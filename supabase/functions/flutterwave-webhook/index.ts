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

    console.log("[master-webhook] Invoked. Signature received:", !!signature);

    // 1. Verify Signature
    if (!signature || signature !== FLW_WEBHOOK_HASH) {
      console.error("[master-webhook] Forbidden: Invalid secret hash");
      return new Response("Forbidden", { status: 403 });
    }

    const payload = await req.json();
    const data = payload?.data;
    
    console.log("[master-webhook] Event:", payload?.event, "| Status:", data?.status);

    // 2. Only process successful charges
    if (payload?.event !== "charge.completed" || data?.status !== "successful") {
      console.log("[master-webhook] Ignored: Not a successful charge.completed");
      return new Response("Ignored", { status: 200 });
    }

    // 3. Get reference (fallback to txRef just in case)
    const reference = data.tx_ref || data.txRef || "";
    console.log("[master-webhook] Found reference:", reference);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;

    // 4. Route based on prefix (Case-insensitive)
    const upperRef = reference.toUpperCase();
    let targetFunction = "";

    if (upperRef.startsWith("VOTE_")) targetFunction = "vote-webhook";
    else if (upperRef.startsWith("GIFT_")) targetFunction = "gift-webhook";
    else if (upperRef.startsWith("WALLET_")) targetFunction = "wallet-webhook";
    
    if (!targetFunction) {
      console.error("[master-webhook] Ignored: Unknown reference prefix", reference);
      return new Response("Ignored", { status: 200 });
    }

    console.log(`[master-webhook] Routing ${reference} to ${targetFunction}`);

    // 5. Forward the request
    const response = await fetch(`${supabaseUrl}/functions/v1/${targetFunction}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "verif-hash": signature,
      },
      body: JSON.stringify(payload),
    });

    // 6. Catch the error from the worker function and send it back
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[master-webhook] ${targetFunction} failed with error: ${errorText}`);
      return new Response(`Worker Error: ${errorText}`, { status: 500 });
    }

    console.log(`[master-webhook] Successfully routed to ${targetFunction}`);
    return new Response("OK", { status: 200 });

  } catch (err) {
    console.error("[master-webhook] Error:", err);
    return new Response("Internal Error", { status: 500 });
  }
});