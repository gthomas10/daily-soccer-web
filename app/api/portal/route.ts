import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSubscriberByEmail } from "@/lib/turso";
import { createPortalSession } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const subscriber = await getSubscriberByEmail(session.user.email);

  if (!subscriber?.stripe_customer_id) {
    return NextResponse.json(
      { error: "No subscription found" },
      { status: 400 }
    );
  }

  const origin = request.headers.get("origin") ?? request.nextUrl.origin;
  const returnUrl = `${origin}/archive`;

  try {
    const url = await createPortalSession(
      subscriber.stripe_customer_id,
      returnUrl
    );
    return NextResponse.json({ url });
  } catch (error) {
    console.error(
      `stage=portal action=create_session_failed customer_id=${subscriber.stripe_customer_id}`,
      error
    );
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 502 }
    );
  }
}
