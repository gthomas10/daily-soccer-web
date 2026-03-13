import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { createCheckoutSession } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const plan = body.plan === "yearly" ? "yearly" : "monthly";
    const priceId =
      plan === "yearly"
        ? env.STRIPE_PRICE_ID_YEARLY
        : env.STRIPE_PRICE_ID_MONTHLY;

    const origin = request.headers.get("origin") ?? request.nextUrl.origin;
    const successUrl = `${origin}/subscribe?success=true`;
    const cancelUrl = `${origin}/subscribe?canceled=true`;

    const url = await createCheckoutSession(
      priceId,
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
