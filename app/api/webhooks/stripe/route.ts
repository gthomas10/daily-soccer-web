import { NextRequest, NextResponse } from "next/server";

export async function POST(_request: NextRequest) {
  // Stub — Stripe webhook handler added in Epic 6
  return NextResponse.json({
    success: true,
    data: { received: true, message: "stub" },
  });
}
