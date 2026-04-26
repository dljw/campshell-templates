// Apify actor: https://apify.com/apify/instagram-scraper
import { runApifyActor, type ServiceContext } from "../lib/apify.js";
import { pickIgProfile, type IgProfile } from "../lib/normalize.js";
import { cacheMediaForItems, type UrlSpec } from "../lib/media-cache.js";

const ACTOR_ID = "apify/instagram-scraper";

interface Input {
  usernames: string[];
  proxyCountry?: string;
  cacheMedia?: boolean;
}

interface Output {
  profiles: IgProfile[];
}

export default async function profileScrape(
  input: Input,
  context: ServiceContext,
): Promise<Output> {
  const { APIFY_TOKEN } = context.secrets;
  if (!APIFY_TOKEN) throw new Error("APIFY_TOKEN secret is not configured");

  const actorInput: Record<string, unknown> = {
    directUrls: input.usernames.map(
      (u) => `https://www.instagram.com/${u.replace(/^@/, "")}/`,
    ),
    resultsType: "details",
    resultsLimit: input.usernames.length,
    addParentData: false,
  };
  if (input.proxyCountry) {
    actorInput.proxyConfiguration = { useApifyProxy: true, apifyProxyCountry: input.proxyCountry };
  }

  const items = await runApifyActor<Record<string, unknown>>({
    actorId: ACTOR_ID,
    token: APIFY_TOKEN,
    input: actorInput,
  });

  const profiles: IgProfile[] = items.map(pickIgProfile);

  // Avatars are tiny — always cache.
  if (input.cacheMedia !== false) {
    await cacheMediaForItems({
      items: profiles,
      ctx: { dataDir: context.dataDir, runId: context.runId },
      pickUrls: (p): UrlSpec[] => {
        const specs: UrlSpec[] = [];
        if (p.profilePicUrl) {
          specs.push({ kind: "avatar", url: p.profilePicUrl, ext: "jpg" });
        }
        p.latestPosts.forEach((post, i) => {
          if (post.displayUrl) {
            specs.push({
              kind: `latest-${i}-thumb`,
              url: post.displayUrl,
              ext: "jpg",
            });
          }
        });
        return specs;
      },
    });
  }

  return { profiles };
}
