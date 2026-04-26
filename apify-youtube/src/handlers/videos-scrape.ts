// Apify actor: https://apify.com/streamers/youtube-scraper
import { runApifyActor, type ServiceContext } from "../lib/apify.js";

const ACTOR_ID = "streamers/youtube-scraper";

interface Input {
  channelUrl: string;
  maxVideos?: number;
  onlyPostsNewerThan?: string;
  onlyPostsOlderThan?: string;
  sortBy?: "newest" | "popular" | "oldest";
  proxyCountry?: string;
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

  const limit = Math.min(Math.max(input.maxVideos ?? 20, 1), 200);
  const sortBy = input.sortBy ?? "newest";

  const actorInput: Record<string, unknown> = {
    startUrls: [{ url: input.channelUrl }],
    maxResults: limit,
    maxResultsShorts: 0,
    maxResultStreams: 0,
    sortVideosBy: sortBy,
  };
  if (input.onlyPostsNewerThan) actorInput.dateFilter = `after:${input.onlyPostsNewerThan}`;
  if (input.onlyPostsOlderThan) actorInput.dateFilterUntil = input.onlyPostsOlderThan;
  if (input.proxyCountry) {
    actorInput.proxyConfiguration = { useApifyProxy: true, apifyProxyCountry: input.proxyCountry };
  }

  const items = await runApifyActor<Record<string, unknown>>({
    actorId: ACTOR_ID,
    token: APIFY_TOKEN,
    input: actorInput,
  });

  let videos: VideoItem[] = items.slice(0, limit).map((item) => ({
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

  // Apply client-side date filtering as a safety net (the actor may ignore the field)
  if (input.onlyPostsNewerThan) {
    const cutoff = new Date(input.onlyPostsNewerThan).getTime();
    videos = videos.filter((v) => v.publishedAt && new Date(v.publishedAt).getTime() >= cutoff);
  }
  if (input.onlyPostsOlderThan) {
    const cutoff = new Date(input.onlyPostsOlderThan).getTime();
    videos = videos.filter((v) => v.publishedAt && new Date(v.publishedAt).getTime() <= cutoff);
  }

  return { videos };
}
