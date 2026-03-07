import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEpisodeMetadata, getAudioStreamUrl, getBonusAudioStreamUrl, listEpisodes } from "@/lib/r2";
import { auth } from "@/lib/auth";
import EpisodePlayer from "@/components/EpisodePlayer";
import ShowNotes from "@/components/ShowNotes";
import SubscribeCta from "@/components/SubscribeCta";
import BonusPlayer from "@/components/BonusPlayer";
import BonusLocked from "@/components/BonusLocked";
import JsonLd from "@/components/JsonLd";
import { formatIsoDuration } from "@/lib/utils";

export const runtime = "nodejs";
export const revalidate = 300;

interface EpisodePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const episodeIds = await listEpisodes();
  return episodeIds.map((id) => ({ slug: id }));
}

export async function generateMetadata({
  params,
}: EpisodePageProps): Promise<Metadata> {
  const { slug } = await params;
  const episode = await getEpisodeMetadata(slug);

  if (!episode) {
    return {
      title: "Episode Not Found | Daily Soccer Report",
    };
  }

  return {
    title: `${episode.title} | Daily Soccer Report`,
    description: episode.description,
    alternates: {
      canonical: `/episodes/${slug}`,
    },
    openGraph: {
      title: `${episode.title} | Daily Soccer Report`,
      description: episode.description,
      type: "article",
      siteName: "Daily Soccer Report",
      url: `/episodes/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${episode.title} | Daily Soccer Report`,
      description: episode.description,
    },
  };
}

export default async function EpisodePage({ params }: EpisodePageProps) {
  const { slug } = await params;
  const episode = await getEpisodeMetadata(slug);

  if (!episode) {
    notFound();
  }

  const audioUrl = getAudioStreamUrl(episode.episode_id);
  const session = await auth();
  const isActiveSubscriber = session?.user?.subscriptionStatus === "active";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "PodcastEpisode",
    name: episode.title,
    description: episode.description,
    datePublished: episode.episode_id,
    timeRequired: formatIsoDuration(episode.duration_seconds),
    associatedMedia: {
      "@type": "MediaObject",
      contentUrl: audioUrl,
    },
    partOfSeries: {
      "@type": "PodcastSeries",
      name: "Daily Soccer Report",
      url: "https://dailysoccerreport.com",
    },
  };

  return (
    <main className="min-h-screen bg-content-surface">
      <JsonLd data={jsonLd} />
      <a
        href="#audio-player"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-accent-emerald focus:px-4 focus:py-2 focus:text-text-on-dark"
      >
        Skip to player
      </a>

      <div className="mx-auto max-w-[1120px] px-4 py-4 lg:px-6">
        <div className="episode-grid">
          <EpisodePlayer episode={episode} audioUrl={audioUrl} />

          <div style={{ gridArea: "notes" }}>
            {isActiveSubscriber && (
              <div className="mb-3">
                <span className="inline-block rounded bg-accent-emerald/10 px-2 py-0.5 text-xs font-semibold text-accent-emerald">
                  Ad-Free
                </span>
              </div>
            )}
            <ShowNotes html={episode.show_notes_html} />
          </div>

          {episode.bonus_audio_url !== null && (
            <div style={{ gridArea: "bonus" }}>
              {isActiveSubscriber ? (
                <BonusPlayer
                  bonusAudioUrl={getBonusAudioStreamUrl(episode.episode_id)}
                  episodeId={episode.episode_id}
                />
              ) : (
                <BonusLocked />
              )}
            </div>
          )}

          <div style={{ gridArea: "cta" }}>
            <SubscribeCta />
          </div>
        </div>
      </div>
    </main>
  );
}
