import { NextRequest, NextResponse } from "next/server";

// Stub — Auth.js handler added in Epic 6
export async function GET(_request: NextRequest) {
  return NextResponse.json({
    success: false,
    data: { message: "Auth not configured" },
  });
}

export async function POST(_request: NextRequest) {
  return NextResponse.json({
    success: false,
    data: { message: "Auth not configured" },
  });
}
