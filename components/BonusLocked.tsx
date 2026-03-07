import Link from "next/link";

export default function BonusLocked() {
  return (
    <div className="rounded-lg bg-player-surface/50 p-6">
      <div className="flex items-center gap-3">
        <span className="text-2xl" role="img" aria-label="Locked">
          🔒
        </span>
        <div>
          <h2 className="text-lg font-bold text-text-on-dark">Bonus Content</h2>
          <p className="mt-1 text-sm text-text-on-dark/70">
            Bonus content is available for subscribers
          </p>
        </div>
      </div>
      <Link
        href="/subscribe"
        className="mt-4 inline-block rounded-lg bg-accent-emerald px-6 py-2 text-sm font-semibold text-text-on-dark focus:outline-none focus:ring-2 focus:ring-accent-emerald focus:ring-offset-2 focus:ring-offset-player-surface"
      >
        Subscribe for Access
      </Link>
    </div>
  );
}
