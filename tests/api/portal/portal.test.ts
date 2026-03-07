import { describe, it, expect, vi, beforeEach } from "vitest";

describe("/api/portal", () => {
  let POST: typeof import("@/app/api/portal/route").POST;
  let mockAuth: ReturnType<typeof vi.fn>;
  let mockGetSubscriberByEmail: ReturnType<typeof vi.fn>;
  let mockCreatePortalSession: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    mockAuth = vi.fn();
    mockGetSubscriberByEmail = vi.fn();
    mockCreatePortalSession = vi.fn();

    vi.doMock("@/lib/auth", () => ({
      auth: mockAuth,
    }));

    vi.doMock("@/lib/turso", () => ({
      getSubscriberByEmail: mockGetSubscriberByEmail,
    }));

    vi.doMock("@/lib/stripe", () => ({
      createPortalSession: mockCreatePortalSession,
    }));

    const routeModule = await import("@/app/api/portal/route");
    POST = routeModule.POST;
  });

  function createRequest(origin = "https://dailysoccerreport.com") {
    return {
      headers: {
        get: (name: string) => (name === "origin" ? origin : null),
      },
      nextUrl: { origin },
    } as unknown as import("next/server").NextRequest;
  }

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);

    const response = await POST(createRequest());
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Not authenticated");
  });

  it("returns 401 when session has no email", async () => {
    mockAuth.mockResolvedValue({ user: {} });

    const response = await POST(createRequest());
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Not authenticated");
  });

  it("returns portal URL for authenticated subscriber", async () => {
    mockAuth.mockResolvedValue({
      user: { email: "fan@example.com" },
    });
    mockGetSubscriberByEmail.mockResolvedValue({
      stripe_customer_id: "cus_abc123",
    });
    mockCreatePortalSession.mockResolvedValue(
      "https://billing.stripe.com/session/test_session"
    );

    const response = await POST(createRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.url).toBe(
      "https://billing.stripe.com/session/test_session"
    );
    expect(mockCreatePortalSession).toHaveBeenCalledWith(
      "cus_abc123",
      "https://dailysoccerreport.com/archive"
    );
  });

  it("returns error when subscriber has no stripe_customer_id", async () => {
    mockAuth.mockResolvedValue({
      user: { email: "fan@example.com" },
    });
    mockGetSubscriberByEmail.mockResolvedValue({
      stripe_customer_id: null,
    });

    const response = await POST(createRequest());
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("No subscription found");
  });

  it("returns error when subscriber not found in database", async () => {
    mockAuth.mockResolvedValue({
      user: { email: "fan@example.com" },
    });
    mockGetSubscriberByEmail.mockResolvedValue(null);

    const response = await POST(createRequest());
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("No subscription found");
  });

  it("returns 502 when Stripe portal session creation fails", async () => {
    mockAuth.mockResolvedValue({
      user: { email: "fan@example.com" },
    });
    mockGetSubscriberByEmail.mockResolvedValue({
      stripe_customer_id: "cus_abc123",
    });
    mockCreatePortalSession.mockRejectedValue(
      new Error("Stripe API error")
    );

    const response = await POST(createRequest());
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body.error).toBe("Failed to create portal session");
  });
});
