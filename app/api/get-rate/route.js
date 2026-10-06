// app/api/get-rate/route.js
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

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
    // Try the collection-friendly rates endpoint first
    const url = `https://api.flutterwave.com/v3/rates?from=${from}&to=USD&amount=${amount}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${secretKey}` },
    });

    const data = await res.json();

    console.log("[get-rate] FLW response:", JSON.stringify(data));

    if (data.status !== "success") {
      return NextResponse.json(
        {
          error:
            data.message ||
            "Rate lookup failed. Please choose a different payment method.",
        },
        { status: 400 }
      );
    }

    // The /v3/rates endpoint returns either `data.rate` or `data.to.amount`
    // depending on the shape; handle both.
    const rate = Number(data?.data?.rate);
    const converted = Number(data?.data?.to?.amount);

    // Prefer the pre-computed converted amount if available
    let localAmount;
    if (converted && !Number.isNaN(converted)) {
      localAmount = converted;
    } else if (rate && !Number.isNaN(rate)) {
      localAmount = Math.ceil(Number(amount) * rate);
    } else {
      return NextResponse.json(
        { error: "Flutterwave returned no rate for this pair." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      amount: Math.ceil(localAmount),
      rate: rate || localAmount / Number(amount),
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