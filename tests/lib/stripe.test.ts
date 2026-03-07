import { describe, it, expect, vi, beforeEach } from "vitest";

describe("lib/stripe", () => {
  let createCheckoutSession: typeof import("@/lib/stripe").createCheckoutSession;
  let constructWebhookEvent: typeof import("@/lib/stripe").constructWebhookEvent;
  let mockCreate: ReturnType<typeof vi.fn>;
  let mockConstructEvent: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    mockCreate = vi.fn();
    mockConstructEvent = vi.fn();

    vi.doMock("@/lib/env", () => ({
      env: {
        STRIPE_SECRET_KEY: "sk_test_fake",
        STRIPE_PRICE_ID: "price_test_123",
      },
    }));

    vi.doMock("stripe", () => {
      return {
        default: class MockStripe {
          checkout = { sessions: { create: mockCreate } };
          webhooks = { constructEvent: mockConstructEvent };
        },
      };
    });

    const stripeModule = await import("@/lib/stripe");
    createCheckoutSession = stripeModule.createCheckoutSession;
    constructWebhookEvent = stripeModule.constructWebhookEvent;
  });

  describe("createCheckoutSession", () => {
    it("creates a checkout session and returns URL", async () => {
      mockCreate.mockResolvedValue({ url: "https://checkout.stripe.com/session123" });

      const url = await createCheckoutSession(
        "price_test_123",
        "https://example.com/success",
        "https://example.com/cancel"
      );

      expect(url).toBe("https://checkout.stripe.com/session123");
      expect(mockCreate).toHaveBeenCalledWith({
        mode: "subscription",
        line_items: [{ price: "price_test_123", quantity: 1 }],
        success_url: "https://example.com/success",
        cancel_url: "https://example.com/cancel",
      });
    });

    it("throws when Stripe returns no URL", async () => {
      mockCreate.mockResolvedValue({ url: null });

      await expect(
        createCheckoutSession("price_test_123", "https://example.com/success", "https://example.com/cancel")
      ).rejects.toThrow("Stripe did not return a checkout URL");
    });

    it("propagates Stripe SDK errors", async () => {
      mockCreate.mockRejectedValue(new Error("Stripe API error"));

      await expect(
        createCheckoutSession("price_test_123", "https://example.com/success", "https://example.com/cancel")
      ).rejects.toThrow("Stripe API error");
    });
  });

  describe("constructWebhookEvent", () => {
    it("delegates to stripe.webhooks.constructEvent", () => {
      const mockEvent = { type: "checkout.session.completed", data: {} };
      mockConstructEvent.mockReturnValue(mockEvent);

      const result = constructWebhookEvent("body", "sig_header", "whsec_test");

      expect(result).toEqual(mockEvent);
      expect(mockConstructEvent).toHaveBeenCalledWith("body", "sig_header", "whsec_test");
    });

    it("throws on invalid signature", () => {
      mockConstructEvent.mockImplementation(() => {
        throw new Error("Invalid signature");
      });

      expect(() => constructWebhookEvent("body", "bad_sig", "whsec_test")).toThrow("Invalid signature");
    });
  });
});
