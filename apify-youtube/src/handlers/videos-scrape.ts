// Apify actor: https://apify.com/streamers/youtube-scraper
import { runApifyActor, type ServiceContext } from "../lib/apify.js";
import { pickYtVideo, type YtVideo } from "../lib/normalize.js";
import { cacheMediaForItems, type UrlSpec } from "../lib/media-cache.js";

const ACTOR_ID = "streamers/youtube-scraper";

interface Input {
  channelUrl: string;
  maxVideos?: number;
  onlyPostsNewerThan?: string;
  onlyPostsOlderThan?: string;
  sortBy?: "newest" | "popular" | "oldest";
  proxyCountry?: string;
  cacheMedia?: boolean;
}

interface Output {
  videos: YtVideo[];
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
    sortVideosBy: sortBy.toUpperCase(),
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

  let videos: YtVideo[] = items.slice(0, limit).map(pickYtVideo);

  if (input.onlyPostsNewerThan) {
    const cutoff = new Date(input.onlyPostsNewerThan).getTime();
    videos = videos.filter(
      (v) => v.publishedAt && new Date(v.publishedAt).getTime() >= cutoff,
    );
  }
  if (input.onlyPostsOlderThan) {
    const cutoff = new Date(input.onlyPostsOlderThan).getTime();
    videos = videos.filter(
      (v) => v.publishedAt && new Date(v.publishedAt).getTime() <= cutoff,
    );
  }

  if (input.cacheMedia) {
    await cacheMediaForItems({
      items: videos,
      ctx: { dataDir: context.dataDir, runId: context.runId },
      pickUrls: (v): UrlSpec[] =>
        v.thumbnailUrl ? [{ kind: "thumb", url: v.thumbnailUrl, ext: "jpg" }] : [],
    });
  }

  return { videos };
}
