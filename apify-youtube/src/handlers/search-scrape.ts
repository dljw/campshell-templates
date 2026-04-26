// Apify actor: https://apify.com/streamers/youtube-scraper
import { runApifyActor, type ServiceContext } from "../lib/apify.js";

const ACTOR_ID = "streamers/youtube-scraper";

interface Input {
  query: string;
  maxResults?: number;
  uploadDate?: "all" | "hour" | "today" | "week" | "month" | "year";
  duration?: "all" | "short" | "medium" | "long";
  sortBy?: "relevance" | "date" | "viewCount" | "rating";
  proxyCountry?: string;
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

  const limit = Math.min(Math.max(input.maxResults ?? 20, 1), 200);

  const actorInput: Record<string, unknown> = {
    searchKeywords: input.query,
    maxResults: limit,
    maxResultsShorts: 0,
    maxResultStreams: 0,
  };
  if (input.uploadDate && input.uploadDate !== "all") {
    actorInput.uploadDate = input.uploadDate;
  }
  if (input.duration && input.duration !== "all") {
    actorInput.duration = input.duration;
  }
  if (input.sortBy && input.sortBy !== "relevance") {
    actorInput.sortBy = input.sortBy;
  }
  if (input.proxyCountry) {
    actorInput.proxyConfiguration = { useApifyProxy: true, apifyProxyCountry: input.proxyCountry };
  }

  const items = await runApifyActor<Record<string, unknown>>({
    actorId: ACTOR_ID,
    token: APIFY_TOKEN,
    input: actorInput,
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
