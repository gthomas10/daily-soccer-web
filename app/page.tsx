import type { Metadata } from "next";
import { getLatestEpisode, getAudioStreamUrl } from "@/lib/r2";
import EpisodePlayer from "@/components/EpisodePlayer";
import ShowNotes from "@/components/ShowNotes";
import SubscribeCta from "@/components/SubscribeCta";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const episode = await getLatestEpisode();

  if (!episode) {
    return {
      title: "Daily Soccer Report",
      description:
        "Your daily soccer briefing — every league, every result, every FPL angle.",
    };
  }

  return {
    title: `${episode.title} | Daily Soccer Report`,
    description: episode.description,
    openGraph: {
      title: `${episode.title} | Daily Soccer Report`,
      description: episode.description,
      type: "website",
      siteName: "Daily Soccer Report",
    },
  };
}

export default async function HomePage() {
  const episode = await getLatestEpisode();

  if (!episode) {
    return (
      <main className="min-h-screen bg-content-surface">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-accent-emerald focus:px-4 focus:py-2 focus:text-text-on-dark"
        >
          Skip to content
        </a>
        <div
          id="main-content"
          className="mx-auto max-w-[1120px] px-4 py-20 text-center lg:px-6"
        >
          <h1 className="text-3xl font-bold text-text-primary">
            Daily Soccer Report
          </h1>
          <p className="mt-4 text-lg text-text-secondary">
            First episode drops soon. Check back daily for your soccer briefing.
          </p>
        </div>
      </main>
    );
  }

  const audioUrl = getAudioStreamUrl(episode.episode_id);

  return (
    <main className="min-h-screen bg-content-surface">
      <a
        href="#audio-player"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-accent-emerald focus:px-4 focus:py-2 focus:text-text-on-dark"
      >
        Skip to player
      </a>

      <div className="mx-auto max-w-[1120px] px-4 py-4 lg:px-6">
        {/*
          CSS Grid layout:
          Mobile:  player / chapters / notes / cta (stacked)
          Desktop: player(full) / [notes | chapters] / cta(full)
        */}
        <div className="episode-grid">
          {/* EpisodePlayer renders into "player" and "chapters" grid areas via inline styles */}
          <EpisodePlayer episode={episode} audioUrl={audioUrl} />

          <div style={{ gridArea: "notes" }}>
            <ShowNotes html={episode.show_notes_html} />
          </div>

          <div style={{ gridArea: "cta" }}>
            <SubscribeCta />
          </div>
        </div>
      </div>
    </main>
  );
}
