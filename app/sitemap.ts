import type { MetadataRoute } from "next";
import { listEpisodes } from "@/lib/r2";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const episodeIds = await listEpisodes();
  const episodeEntries = episodeIds.map((id) => ({
    url: `https://dailysoccerreport.com/episodes/${id}`,
    lastModified: new Date(id),
    changeFrequency: "never" as const,
  }));

  return [
    {
      url: "https://dailysoccerreport.com",
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://dailysoccerreport.com/presenters",
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...episodeEntries,
  ];
}
