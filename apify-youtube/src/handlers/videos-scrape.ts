// Apify actor: https://console.apify.com/actors/h7sDV53CddomktSi5 (streamers/youtube-scraper)
import { runApifyActor, type ServiceContext } from "../lib/apify.js";

const ACTOR_ID = "streamers/youtube-scraper";

interface Input {
  channelUrl: string;
  maxVideos?: number;
}

interface VideoItem {
  videoId: string;
  title: string;
  viewCount: number;
  likesCount: number;
  commentsCount: number;
  durationSeconds: number;
  publishedAt: string;
  url: string;
  thumbnailUrl: string;
}

interface Output {
  videos: VideoItem[];
}

export default async function videosScrape(
  input: Input,
  context: ServiceContext,
): Promise<Output> {
  const { APIFY_TOKEN } = context.secrets;
  if (!APIFY_TOKEN) throw new Error("APIFY_TOKEN secret is not configured");

  const limit = Math.min(Math.max(input.maxVideos ?? 20, 1), 50);

  const items = await runApifyActor<Record<string, unknown>>({
    actorId: ACTOR_ID,
    token: APIFY_TOKEN,
    input: {
      startUrls: [{ url: input.channelUrl }],
      maxResults: limit,
      maxResultsShorts: 0,
      maxResultStreams: 0,
    },
  });

  const videos: VideoItem[] = items.slice(0, limit).map((item) => ({
    videoId: String(item.id ?? ""),
    title: String(item.title ?? ""),
    viewCount: Number(item.viewCount ?? 0),
    likesCount: Number(item.likes ?? item.likesCount ?? 0),
    commentsCount: Number(item.commentsCount ?? 0),
    durationSeconds: Number(item.duration ?? 0),
    publishedAt: String(item.date ?? item.publishedAt ?? ""),
    url: String(item.url ?? ""),
    thumbnailUrl: String(item.thumbnailUrl ?? ""),
  }));

  return { videos };
}
