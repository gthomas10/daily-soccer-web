import { describe, it, expect, vi, beforeEach } from "vitest";

describe("/api/checkout", () => {
  let POST: typeof import("@/app/api/checkout/route").POST;
  let mockCreateCheckoutSession: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    mockCreateCheckoutSession = vi.fn();

    vi.doMock("@/lib/env", () => ({
      env: {
        STRIPE_PRICE_ID: "price_test_123",
      },
    }));

    vi.doMock("@/lib/stripe", () => ({
      createCheckoutSession: mockCreateCheckoutSession,
    }));

    const routeModule = await import("@/app/api/checkout/route");
    POST = routeModule.POST;
  });

  it("creates a checkout session and returns the URL", async () => {
    mockCreateCheckoutSession.mockResolvedValue("https://checkout.stripe.com/session123");

    const { NextRequest } = await import("next/server");
    const request = new NextRequest("http://localhost/api/checkout", {
      method: "POST",
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.url).toBe("https://checkout.stripe.com/session123");
    expect(mockCreateCheckoutSession).toHaveBeenCalledWith(
      "price_test_123",
      "http://localhost/subscribe?success=true",
      "http://localhost/subscribe?canceled=true"
    );
  });

  it("returns 500 when checkout session creation fails", async () => {
    mockCreateCheckoutSession.mockRejectedValue(new Error("Stripe API error"));

    const { NextRequest } = await import("next/server");
    const request = new NextRequest("http://localhost/api/checkout", {
      method: "POST",
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Failed to create checkout session");
  });
});
