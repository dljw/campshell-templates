// Apify actor: https://apify.com/clockworks/free-tiktok-scraper
import { runApifyActor, type ServiceContext } from "../lib/apify.js";
import { pickTtProfile, type TtProfile } from "../lib/normalize.js";
import { cacheMediaForItems, type UrlSpec } from "../lib/media-cache.js";

const ACTOR_ID = "clockworks/free-tiktok-scraper";

interface Input {
  usernames: string[];
  proxyCountry?: string;
  cacheMedia?: boolean;
}

interface Output {
  profiles: TtProfile[];
}

export default async function profileScrape(
  input: Input,
  context: ServiceContext,
): Promise<Output> {
  const { APIFY_TOKEN } = context.secrets;
  if (!APIFY_TOKEN) throw new Error("APIFY_TOKEN secret is not configured");

  const actorInput: Record<string, unknown> = {
    profiles: input.usernames.map((u) => u.replace(/^@/, "")),
    profileScrapeSections: ["videos"],
    resultsPerPage: 1,
    shouldDownloadVideos: false,
    shouldDownloadCovers: false,
    shouldDownloadSubtitles: false,
    shouldDownloadSlideshowImages: false,
    profileSorting: "latest",
    excludePinnedPosts: false,
  };
  if (input.proxyCountry) {
    actorInput.proxyConfiguration = { useApifyProxy: true, apifyProxyCountry: input.proxyCountry };
  }

  const items = await runApifyActor<Record<string, unknown>>({
    actorId: ACTOR_ID,
    token: APIFY_TOKEN,
    input: actorInput,
  });

  // Dedupe — actor returns one record per video, all sharing the same profile.
  const seen = new Set<string>();
  const profiles: TtProfile[] = [];
  for (const item of items) {
    const profile = pickTtProfile(item);
    if (!profile.username || seen.has(profile.username)) continue;
    seen.add(profile.username);
    profiles.push(profile);
  }

  if (input.cacheMedia !== false) {
    await cacheMediaForItems({
      items: profiles,
      ctx: { dataDir: context.dataDir, runId: context.runId },
      pickUrls: (p): UrlSpec[] => {
        const specs: UrlSpec[] = [];
        const url = p.avatarLargerUrl || p.avatarUrl;
        if (url) specs.push({ kind: "avatar", url, ext: "jpg" });
        return specs;
      },
    });
  }

  return { profiles };
}
