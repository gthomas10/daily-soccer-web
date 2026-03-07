"use client";

import { useState } from "react";

export default function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function handleClick() {
    setLoading(true);
    setError(false);
    try {
      const response = await fetch("/api/portal", { method: "POST" });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        aria-busy={loading}
        className="text-sm text-accent hover:text-accent/80 underline underline-offset-2 disabled:opacity-50"
      >
        {loading ? "Loading…" : "Manage Subscription"}
      </button>
      {error && (
        <p className="mt-1 text-xs text-red-400">
          Unable to open subscription portal. Please try again.
        </p>
      )}
    </div>
  );
}
