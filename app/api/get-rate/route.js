// app/api/get-rate/route.js
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // ensures env vars are read at runtime, not build time

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

  // If the user is already in USD, no conversion is needed
  if (from === "USD") {
    return NextResponse.json({ amount: Number(amount), rate: 1 });
  }

  const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;

  if (!secretKey) {
    return NextResponse.json(
      { error: "Server misconfigured: missing Flutterwave secret" },
      { status: 500 }
    );
  }

  try {
    // Query Flutterwave: "how much of `from` do I need to reach `amount` USD?"
    const url = `https://api.flutterwave.com/v3/transfers/rates?amount=${amount}&destination_currency=USD&source_currency=${from}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${secretKey}` },
    });

    const data = await res.json();

    if (data.status !== "success") {
      return NextResponse.json(
        { error: data.message || "Failed to fetch rate" },
        { status: 400 }
      );
    }

    // Flutterwave returns: data.source.amount (the local amount needed)
    // and data.rate (the conversion rate)
    const sourceAmount = data.data?.source?.amount;
    const rate = data.data?.rate;

    if (!sourceAmount) {
      return NextResponse.json(
        { error: "Flutterwave returned no amount" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      amount: Math.ceil(sourceAmount), // round up to nearest whole unit
      rate,
      from,
      to: "USD",
    });
  } catch (err) {
    console.error("[get-rate] error:", err);
    return NextResponse.json(
      { error: err?.message || "Rate lookup failed" },
      { status: 500 }
    );
  }
}