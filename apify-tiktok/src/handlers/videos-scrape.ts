// Apify actor: https://apify.com/clockworks/free-tiktok-scraper
import { runApifyActor, type ServiceContext } from "../lib/apify.js";
import { pickTtVideo, type TtVideo } from "../lib/normalize.js";
import { cacheMediaForItems, type UrlSpec } from "../lib/media-cache.js";

const ACTOR_ID = "clockworks/free-tiktok-scraper";

interface Input {
  username: string;
  videosLimit?: number;
  onlyPostsNewerThan?: string;
  onlyPostsOlderThan?: string;
  sortBy?: "latest" | "oldest" | "popular";
  proxyCountry?: string;
  cacheMedia?: boolean;
  cacheVideos?: boolean;
}

interface Output {
  videos: TtVideo[];
}

export default async function videosScrape(
  input: Input,
  context: ServiceContext,
): Promise<Output> {
  const { APIFY_TOKEN } = context.secrets;
  if (!APIFY_TOKEN) throw new Error("APIFY_TOKEN secret is not configured");

  const limit = Math.min(Math.max(input.videosLimit ?? 20, 1), 200);
  const username = input.username.replace(/^@/, "");
  const sort = input.sortBy ?? "latest";

  const actorInput: Record<string, unknown> = {
    profiles: [username],
    profileScrapeSections: ["videos"],
    resultsPerPage: limit,
    shouldDownloadVideos: false,
    shouldDownloadCovers: false,
    shouldDownloadSubtitles: false,
    shouldDownloadSlideshowImages: false,
    profileSorting: sort,
    excludePinnedPosts: false,
  };
  if (input.onlyPostsNewerThan) actorInput.oldestPostDate = input.onlyPostsNewerThan;
  if (input.onlyPostsOlderThan) actorInput.newestPostDateUnified = input.onlyPostsOlderThan;
  if (input.proxyCountry) {
    actorInput.proxyConfiguration = { useApifyProxy: true, apifyProxyCountry: input.proxyCountry };
  }

  const items = await runApifyActor<Record<string, unknown>>({
    actorId: ACTOR_ID,
    token: APIFY_TOKEN,
    input: actorInput,
  });

  const videos: TtVideo[] = items.slice(0, limit).map(pickTtVideo);

  if (input.cacheMedia) {
    await cacheMediaForItems({
      items: videos,
      ctx: { dataDir: context.dataDir, runId: context.runId },
      pickUrls: (v): UrlSpec[] => {
        const specs: UrlSpec[] = [];
        if (v.coverUrl) specs.push({ kind: "thumb", url: v.coverUrl, ext: "jpg" });
        v.slideshowImages.forEach((s, i) => {
          if (s.url) specs.push({ kind: `child-${i}-thumb`, url: s.url, ext: "jpg" });
        });
        if (input.cacheVideos && v.videoDownloadUrl) {
          specs.push({ kind: "video", url: v.videoDownloadUrl, ext: "mp4" });
        }
        return specs;
      },
    });
  }

  return { videos };
}
