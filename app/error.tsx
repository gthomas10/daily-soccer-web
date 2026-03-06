"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-content-surface">
      <div className="mx-auto max-w-[1120px] px-4 py-20 text-center lg:px-6">
        <h1 className="text-2xl font-bold text-text-primary">
          Something went wrong
        </h1>
        <p className="mt-4 text-text-secondary">
          We couldn&apos;t load the latest episode. Please try again.
        </p>
        <button
          onClick={reset}
          className="mt-6 rounded-lg bg-accent-emerald px-6 py-2.5 text-sm font-medium text-text-on-dark transition-colors hover:bg-accent-emerald/90"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
