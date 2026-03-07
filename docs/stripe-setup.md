# Stripe Dashboard Configuration (Story 6.1)

## 1. Create Subscription Product + Price

1. Go to Stripe Dashboard > Products
2. Create a new product: "Daily Soccer Report Premium"
3. Add a recurring price (monthly or desired interval)
4. Copy the Price ID (e.g., `price_1...`) and set it as `STRIPE_PRICE_ID` env var in Vercel

## 2. Register Webhook Endpoint

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint URL: `https://<your-domain>/api/webhooks/stripe`
3. Select events to listen for: `checkout.session.completed`
4. Copy the Webhook Signing Secret and set it as `STRIPE_WEBHOOK_SECRET` env var in Vercel

## 3. Environment Variables Required

| Variable | Source | Description |
|----------|--------|-------------|
| `STRIPE_SECRET_KEY` | Stripe Dashboard > API Keys | Server-side secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard > Webhooks | Webhook signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard > API Keys | Client-side publishable key |
| `STRIPE_PRICE_ID` | Stripe Dashboard > Products | Subscription price ID |

## Notes

- Story 6.6 will add `customer.subscription.updated` and `customer.subscription.deleted` webhook events
- Use Stripe test mode keys for staging/development
