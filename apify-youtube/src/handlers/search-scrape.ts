// Apify actor: https://console.apify.com/actors/h7sDV53CddomktSi5 (streamers/youtube-scraper)
import { runApifyActor, type ServiceContext } from "../lib/apify.js";

const ACTOR_ID = "streamers/youtube-scraper";

interface Input {
  query: string;
  maxResults?: number;
}

interface SearchResult {
  videoId: string;
  title: string;
  channelName: string;
  viewCount: number;
  publishedAt: string;
  url: string;
}

interface Output {
  results: SearchResult[];
}

export default async function searchScrape(
  input: Input,
  context: ServiceContext,
): Promise<Output> {
  const { APIFY_TOKEN } = context.secrets;
  if (!APIFY_TOKEN) throw new Error("APIFY_TOKEN secret is not configured");

  const limit = Math.min(Math.max(input.maxResults ?? 20, 1), 50);

  const items = await runApifyActor<Record<string, unknown>>({
    actorId: ACTOR_ID,
    token: APIFY_TOKEN,
    input: {
      searchKeywords: input.query,
      maxResults: limit,
      maxResultsShorts: 0,
      maxResultStreams: 0,
    },
  });

  const results: SearchResult[] = items.slice(0, limit).map((item) => ({
    videoId: String(item.id ?? ""),
    title: String(item.title ?? ""),
    channelName: String(item.channelName ?? item.channelTitle ?? ""),
    viewCount: Number(item.viewCount ?? 0),
    publishedAt: String(item.date ?? item.publishedAt ?? ""),
    url: String(item.url ?? ""),
  }));

  return { results };
}
