"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export function SignInForm({ callbackUrl }: { callbackUrl?: string }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const result = await signIn("resend", {
        email,
        callbackUrl: callbackUrl ?? "/",
        redirect: false,
      });

      if (result?.error) {
        setError("Unable to send magic link. Please try again.");
        setLoading(false);
        return;
      }

      window.location.href = "/auth/verify";
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      {callbackUrl && callbackUrl !== "/" && (
        <p className="text-sm text-text-secondary">
          Sign in to access this content.
        </p>
      )}

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-text-primary"
        >
          Email address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
          className="mt-1 block w-full rounded-lg border border-text-secondary/20 bg-content-surface px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent-emerald focus:ring-offset-2"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-accent-emerald px-6 py-3 text-sm font-bold text-text-on-dark transition-colors hover:bg-accent-emerald/90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-accent-emerald focus:ring-offset-2 motion-safe:transition-opacity"
      >
        {loading ? "Sending magic link..." : "Sign in with email"}
      </button>

      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      <p className="text-center text-sm text-text-secondary">
        Don&apos;t have an account?{" "}
        <Link
          href="/subscribe"
          className="text-accent-emerald hover:underline focus:outline-none focus:ring-2 focus:ring-accent-emerald focus:ring-offset-2"
        >
          Subscribe
        </Link>
      </p>
    </form>
  );
}
