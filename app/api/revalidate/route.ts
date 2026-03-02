import { NextRequest, NextResponse } from "next/server";

export async function POST(_request: NextRequest) {
  // Stub — revalidation logic added in Epic 4
  return NextResponse.json({
    success: true,
    data: { revalidated: false, message: "stub" },
  });
}
