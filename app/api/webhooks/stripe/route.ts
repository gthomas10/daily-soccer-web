import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { constructWebhookEvent } from "@/lib/stripe";
import {
  upsertSubscriber,
  updateSubscriberByStripeCustomerId,
} from "@/lib/turso";

const checkoutSessionSchema = z.object({
  customer_details: z
    .object({ email: z.string().email().nullable() })
    .nullable(),
  customer: z.union([z.string(), z.object({}), z.null()]),
});

const subscriptionSchema = z.object({
  customer: z.string(),
  status: z.string(),
});

const STRIPE_STATUS_MAP: Record<string, string> = {
  active: "active",
  trialing: "active",
  past_due: "past_due",
  canceled: "cancelled",
  unpaid: "cancelled",
  incomplete: "cancelled",
  incomplete_expired: "cancelled",
  paused: "cancelled",
};

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event;
  try {
    event = constructWebhookEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.error(
      "Webhook signature verification failed:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const parsed = checkoutSessionSchema.safeParse(event.data.object);

    if (!parsed.success) {
      console.error(
        `stage=webhook action=invalid_payload errors=${JSON.stringify(parsed.error.issues)}`
      );
      return NextResponse.json({ received: true });
    }

    const email = parsed.data.customer_details?.email ?? null;
    const customerId =
      typeof parsed.data.customer === "string" ? parsed.data.customer : null;

    if (email && customerId) {
      try {
        await upsertSubscriber(email, customerId, "active");
        console.log(
          `stage=webhook action=subscriber_created email=${email} customer_id=${customerId}`
        );
      } catch (error) {
        console.error(
        `stage=webhook action=upsert_failed email=${email} customer_id=${customerId}`,
        error
      );
      }
    } else {
      console.warn(
        `stage=webhook action=missing_data email=${email ?? "null"} customer=${customerId ?? "null"}`
      );
    }
  } else if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const parsed = subscriptionSchema.safeParse(event.data.object);

    if (!parsed.success) {
      console.error(
        `stage=webhook action=invalid_subscription_payload errors=${JSON.stringify(parsed.error.issues)}`
      );
      return NextResponse.json({ received: true });
    }

    const customerId = parsed.data.customer;
    const mappedStatus =
      event.type === "customer.subscription.deleted"
        ? "cancelled"
        : STRIPE_STATUS_MAP[parsed.data.status] ?? "cancelled";

    try {
      const rowsAffected = await updateSubscriberByStripeCustomerId(
        customerId,
        mappedStatus
      );
      if (rowsAffected === 0) {
        console.warn(
          `stage=webhook action=subscriber_not_found customer_id=${customerId}`
        );
      } else {
        const action =
          event.type === "customer.subscription.deleted"
            ? "subscription_deleted"
            : "subscription_updated";
        console.log(
          `stage=webhook action=${action} customer_id=${customerId} status=${mappedStatus}`
        );
      }
    } catch (error) {
      console.error(
        `stage=webhook action=update_failed customer_id=${customerId}`,
        error
      );
    }
  } else {
    console.log(`stage=webhook action=unhandled_event type=${event.type}`);
  }

  return NextResponse.json({ received: true });
}
