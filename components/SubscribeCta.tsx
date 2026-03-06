const APPLE_PODCASTS_URL = "https://podcasts.apple.com/podcast/daily-soccer-report";
const SPOTIFY_URL = "https://open.spotify.com/show/daily-soccer-report";

export default function SubscribeCta() {
  return (
    <section className="rounded-lg bg-player-surface p-6 text-center">
      <h2 className="text-lg font-bold text-text-on-dark">
        Get Daily Soccer Report every day
      </h2>
      <p className="mt-2 text-sm text-text-on-dark/70">
        Subscribe on your favourite platform or go premium for bonus content.
      </p>
      <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <a
          href={APPLE_PODCASTS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-text-on-dark/10 px-5 py-2.5 text-sm font-medium text-text-on-dark transition-colors hover:bg-text-on-dark/20"
        >
          Apple Podcasts
        </a>
        <a
          href={SPOTIFY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-text-on-dark/10 px-5 py-2.5 text-sm font-medium text-text-on-dark transition-colors hover:bg-text-on-dark/20"
        >
          Spotify
        </a>
        <a
          href="/subscribe"
          className="inline-flex items-center gap-2 rounded-lg bg-accent-emerald px-5 py-2.5 text-sm font-bold text-text-on-dark transition-colors hover:bg-accent-emerald/90"
        >
          Go Premium
        </a>
      </div>
    </section>
  );
}
