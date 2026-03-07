"use client";

import Link from "next/link";
import { use, useState } from "react";

const BENEFITS = [
  "Early access to episodes before public release",
  "Bonus content and extended analysis",
  "Ad-free listening experience",
  "Full episode archive access",
];

export function SubscribeContent({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string; lapsed?: string }>;
}) {
  const params = use(searchParams);
  const isSuccess = params.success === "true";
  const isCanceled = params.canceled === "true";
  const isLapsed = params.lapsed === "true";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubscribe() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", { method: "POST" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to create checkout session");
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  if (isSuccess) {
    return (
      <main className="min-h-screen bg-content-surface">
        <div className="mx-auto max-w-3xl px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-text-primary">
            Welcome to Premium!
          </h1>
          <p className="mt-4 text-text-secondary">
            Your subscription is active. You&apos;ll receive a confirmation
            email shortly with details on how to access your premium benefits.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-lg bg-accent-emerald px-6 py-3 text-sm font-bold text-text-on-dark transition-colors hover:bg-accent-emerald/90 focus:outline-none focus:ring-2 focus:ring-accent-emerald focus:ring-offset-2"
          >
            Back to Episodes
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-content-surface">
      <div className="mx-auto max-w-3xl px-4 py-12">
        {isLapsed && (
          <div className="mb-6 rounded-lg border border-accent-amber/30 bg-accent-amber/10 px-4 py-3 text-sm text-accent-amber" role="alert">
            Your subscription has expired. Resubscribe to regain access to the full archive and premium content.
          </div>
        )}
        <h1 className="text-2xl font-bold text-text-primary">Go Premium</h1>
        <p className="mt-2 text-text-secondary">
          Unlock the full Daily Soccer Report experience with a premium
          subscription.
        </p>

        <div className="mt-8 rounded-lg bg-player-surface p-6">
          <h2 className="text-lg font-bold text-text-on-dark">
            Premium Benefits
          </h2>
          <ul className="mt-4 space-y-3">
            {BENEFITS.map((benefit) => (
              <li
                key={benefit}
                className="flex items-start gap-3 text-sm text-text-on-dark/80"
              >
                <span
                  className="mt-0.5 text-accent-emerald"
                  aria-hidden="true"
                >
                  &#10003;
                </span>
                {benefit}
              </li>
            ))}
          </ul>

          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="mt-6 w-full rounded-lg bg-accent-emerald px-6 py-3 text-sm font-bold text-text-on-dark transition-colors hover:bg-accent-emerald/90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-accent-emerald focus:ring-offset-2 motion-safe:transition-opacity"
          >
            {loading ? "Redirecting to checkout..." : "Subscribe Now"}
          </button>

          {error && (
            <p className="mt-3 text-sm text-red-400" role="alert">
              {error}
            </p>
          )}

          {isCanceled && (
            <p className="mt-3 text-sm text-text-on-dark/60">
              Checkout was canceled. You can try again whenever you&apos;re
              ready.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
