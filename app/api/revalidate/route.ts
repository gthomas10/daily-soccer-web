import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");

  if (!env.REVALIDATION_SECRET || secret !== env.REVALIDATION_SECRET) {
    return NextResponse.json(
      { success: false, message: "Invalid token" },
      { status: 401 }
    );
  }

  const errors: string[] = [];

  try {
    revalidateTag("episodes", { expire: 0 });
  } catch (err) {
    errors.push(`revalidateTag: ${err instanceof Error ? err.message : String(err)}`);
  }

  try {
    revalidatePath("/");
    revalidatePath("/archive");
  } catch (err) {
    errors.push(`revalidatePath: ${err instanceof Error ? err.message : String(err)}`);
  }

  if (errors.length > 0) {
    console.error("Revalidation errors:", errors);
  }

  return NextResponse.json({
    success: errors.length === 0,
    revalidated: true,
    errors,
  });
}
