// supabase/functions/paypal-order/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function getBaseUrl(): string {
  const env = Deno.env.get("PAYPAL_ENVIRONMENT") || "sandbox";
  return env === "production"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

async function getAccessToken(): Promise<string> {
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
  const clientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");

  console.log("[paypal-order] env check", {
    hasClientId: !!clientId,
    hasClientSecret: !!clientSecret,
    environment: Deno.env.get("PAYPAL_ENVIRONMENT") || "sandbox",
  });

  if (!clientId || !clientSecret) {
    throw new Error(
      `Missing PayPal credentials. hasClientId=${!!clientId} hasClientSecret=${!!clientSecret}`
    );
  }

  const baseUrl = getBaseUrl();
  const auth = btoa(`${clientId}:${clientSecret}`);

  console.log("[paypal-order] requesting OAuth token from", baseUrl);

  const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const text = await res.text();
  console.log("[paypal-order] OAuth status:", res.status);
  console.log("[paypal-order] OAuth body:", text);

  if (!res.ok) {
    throw new Error(`PayPal OAuth failed (${res.status}): ${text}`);
  }

  let data: { access_token?: string };
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`PayPal OAuth returned non-JSON: ${text}`);
  }

  if (!data.access_token) {
    throw new Error(`PayPal OAuth: no access_token in response: ${text}`);
  }

  return data.access_token;
}

serve(async (req: Request) => {
  console.log("[paypal-order] invoked", { method: req.method });

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("[paypal-order] body:", JSON.stringify(body));

    const { amount, currency, candidateId, votes, userId } = body;

    if (typeof amount !== "number" || amount <= 0) {
      throw new Error(`Invalid amount: ${amount}`);
    }
    if (!currency || typeof currency !== "string") {
      throw new Error(`Invalid currency: ${currency}`);
    }

    const accessToken = await getAccessToken();
    const baseUrl = getBaseUrl();

    const orderRes = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: amount.toFixed(2),
            },
            custom_id: JSON.stringify({ candidateId, votes, userId }),
          },
        ],
      }),
    });

    const orderText = await orderRes.text();
    console.log("[paypal-order] create order status:", orderRes.status);
    console.log("[paypal-order] create order body:", orderText);

    if (!orderRes.ok) {
      throw new Error(`PayPal create order failed (${orderRes.status}): ${orderText}`);
    }

    let orderData: { id?: string };
    try {
      orderData = JSON.parse(orderText);
    } catch {
      throw new Error(`PayPal returned non-JSON: ${orderText}`);
    }

    if (!orderData.id) {
      throw new Error(`PayPal returned no order id: ${orderText}`);
    }

    return new Response(JSON.stringify({ id: orderData.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[paypal-order] ERROR:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});