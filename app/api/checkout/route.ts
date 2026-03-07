import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { createCheckoutSession } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get("origin") ?? request.nextUrl.origin;
    const successUrl = `${origin}/subscribe?success=true`;
    const cancelUrl = `${origin}/subscribe?canceled=true`;

    const url = await createCheckoutSession(
      env.STRIPE_PRICE_ID,
      successUrl,
      cancelUrl
    );

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Checkout session creation failed:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
