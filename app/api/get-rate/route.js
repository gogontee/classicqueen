// app/api/get-rate/route.js
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const RATE_TIMEOUT_MS = 5000; // hard cap on Flutterwave call

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const amount = searchParams.get("amount");
  const from = searchParams.get("from");

  if (!amount || !from) {
    return NextResponse.json(
      { error: "Missing required params: amount, from" },
      { status: 400 }
    );
  }

  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return NextResponse.json(
      { error: "Invalid amount" },
      { status: 400 }
    );
  }

  // If the user is already in USD, no conversion is needed
  if (from === "USD") {
    return NextResponse.json({ amount: numericAmount, rate: 1 });
  }

  const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;

  if (!secretKey) {
    return NextResponse.json(
      { error: "Server misconfigured: missing Flutterwave secret" },
      { status: 500 }
    );
  }

  // Timeout via AbortController so a slow Flutterwave call fails fast
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), RATE_TIMEOUT_MS);

  try {
    const url = `https://api.flutterwave.com/v3/transfers/rates?amount=${numericAmount}&destination_currency=USD&source_currency=${from}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${secretKey}` },
      signal: controller.signal,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data || data.status !== "success") {
      console.error("[get-rate] Flutterwave rejected:", {
        status: res.status,
        message: data?.message,
        from,
        amount: numericAmount,
      });
      return NextResponse.json(
        { error: data?.message || "Rate unavailable" },
        { status: 502 }
      );
    }

    const sourceAmount = data.data?.source?.amount;
    const rate = data.data?.rate;

    if (!sourceAmount || !Number.isFinite(Number(sourceAmount))) {
      console.error("[get-rate] missing source amount:", data);
      return NextResponse.json(
        { error: "Rate response malformed" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      amount: Math.ceil(Number(sourceAmount)),
      rate,
      from,
      to: "USD",
    });
  } catch (err) {
    const aborted = err?.name === "AbortError";
    console.error(
      "[get-rate]",
      aborted ? "timed out" : "exception",
      { from, amount: numericAmount, message: err?.message }
    );
    return NextResponse.json(
      { error: aborted ? "Rate lookup timed out" : "Rate lookup failed" },
      { status: aborted ? 504 : 500 }
    );
  } finally {
    clearTimeout(timeout);
  }
}