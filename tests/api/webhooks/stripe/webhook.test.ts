import { describe, it, expect, vi, beforeEach } from "vitest";

describe("/api/webhooks/stripe", () => {
  let POST: typeof import("@/app/api/webhooks/stripe/route").POST;
  let mockConstructWebhookEvent: ReturnType<typeof vi.fn>;
  let mockUpsertSubscriber: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    mockConstructWebhookEvent = vi.fn();
    mockUpsertSubscriber = vi.fn();

    vi.doMock("@/lib/env", () => ({
      env: {
        STRIPE_WEBHOOK_SECRET: "whsec_test_secret",
      },
    }));

    vi.doMock("@/lib/stripe", () => ({
      constructWebhookEvent: mockConstructWebhookEvent,
    }));

    vi.doMock("@/lib/turso", () => ({
      upsertSubscriber: mockUpsertSubscriber,
    }));

    const routeModule = await import("@/app/api/webhooks/stripe/route");
    POST = routeModule.POST;
  });

  function createRequest(body: string, signature: string | null) {
    const headers = new Headers();
    if (signature !== null) {
      headers.set("stripe-signature", signature);
    }

    // Build a NextRequest-compatible object
    return {
      text: () => Promise.resolve(body),
      headers: {
        get: (name: string) => headers.get(name),
      },
    } as unknown as import("next/server").NextRequest;
  }

  it("returns 400 when stripe-signature header is missing", async () => {
    const request = createRequest("{}", null);

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Missing stripe-signature header");
  });

  it("returns 400 when signature verification fails", async () => {
    mockConstructWebhookEvent.mockImplementation(() => {
      throw new Error("Invalid signature");
    });

    const request = createRequest("{}", "invalid_sig");

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Invalid signature");
  });

  it("creates subscriber on checkout.session.completed", async () => {
    mockConstructWebhookEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          customer_details: { email: "fan@example.com" },
          customer: "cus_abc123",
        },
      },
    });
    mockUpsertSubscriber.mockResolvedValue(undefined);

    const request = createRequest("{}", "valid_sig");

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.received).toBe(true);
    expect(mockUpsertSubscriber).toHaveBeenCalledWith(
      "fan@example.com",
      "cus_abc123",
      "active"
    );
  });

  it("returns 200 when database upsert fails (prevents Stripe retries)", async () => {
    mockConstructWebhookEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          customer_details: { email: "fan@example.com" },
          customer: "cus_abc123",
        },
      },
    });
    mockUpsertSubscriber.mockRejectedValue(new Error("DB connection error"));

    const request = createRequest("{}", "valid_sig");

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.received).toBe(true);
  });

  it("returns 200 when checkout session payload fails Zod validation", async () => {
    mockConstructWebhookEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          customer_details: { email: "not-an-email" },
          customer: 12345,
        },
      },
    });

    const request = createRequest("{}", "valid_sig");

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.received).toBe(true);
    expect(mockUpsertSubscriber).not.toHaveBeenCalled();
  });

  it("returns 200 for unhandled event types", async () => {
    mockConstructWebhookEvent.mockReturnValue({
      type: "customer.subscription.updated",
      data: { object: {} },
    });

    const request = createRequest("{}", "valid_sig");

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.received).toBe(true);
    expect(mockUpsertSubscriber).not.toHaveBeenCalled();
  });

  it("handles checkout.session.completed with missing email gracefully", async () => {
    mockConstructWebhookEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          customer_details: { email: null },
          customer: "cus_abc123",
        },
      },
    });

    const request = createRequest("{}", "valid_sig");

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.received).toBe(true);
    expect(mockUpsertSubscriber).not.toHaveBeenCalled();
  });

  it("passes raw body and signature to constructWebhookEvent", async () => {
    mockConstructWebhookEvent.mockReturnValue({
      type: "some.event",
      data: { object: {} },
    });

    const rawBody = '{"id":"evt_123"}';
    const request = createRequest(rawBody, "sig_abc");

    await POST(request);

    expect(mockConstructWebhookEvent).toHaveBeenCalledWith(
      rawBody,
      "sig_abc",
      "whsec_test_secret"
    );
  });
});
