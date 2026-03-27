import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const session = await auth();

  if (!session) {
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (session.user.subscriptionStatus !== "active") {
    const subscribeUrl = new URL("/subscribe", request.url);
    subscribeUrl.searchParams.set("lapsed", "true");
    return NextResponse.redirect(subscribeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [],
};
