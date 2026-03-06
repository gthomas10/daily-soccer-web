export default function Loading() {
  return (
    <main className="min-h-screen bg-content-surface">
      <div className="mx-auto max-w-[1120px] px-4 py-4 lg:px-6">
        {/* Player skeleton */}
        <div className="animate-pulse rounded-lg bg-player-surface p-6">
          <div className="h-6 w-3/4 rounded bg-text-on-dark/10" />
          <div className="mt-2 h-4 w-32 rounded bg-text-on-dark/10" />
          <div className="mt-6 flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-text-on-dark/10" />
            <div className="h-2 flex-1 rounded-full bg-text-on-dark/10" />
          </div>
        </div>

        {/* Content skeleton */}
        <div className="mt-6 space-y-4 animate-pulse">
          <div className="h-4 w-full rounded bg-text-secondary/10" />
          <div className="h-4 w-5/6 rounded bg-text-secondary/10" />
          <div className="h-4 w-4/6 rounded bg-text-secondary/10" />
          <div className="h-4 w-full rounded bg-text-secondary/10" />
          <div className="h-4 w-3/4 rounded bg-text-secondary/10" />
        </div>
      </div>
    </main>
  );
}
