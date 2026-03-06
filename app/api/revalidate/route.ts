import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");

  if (!env.REVALIDATION_SECRET || secret !== env.REVALIDATION_SECRET) {
    return NextResponse.json(
      { success: false, message: "Invalid token" },
      { status: 401 }
    );
  }

  try {
    revalidatePath("/");
  } catch {
    return NextResponse.json(
      { success: false, message: "Revalidation failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    revalidated: true,
    path: "/",
  });
}
