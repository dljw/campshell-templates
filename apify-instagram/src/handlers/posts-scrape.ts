// Apify actor: https://apify.com/apify/instagram-scraper
import { runApifyActor, type ServiceContext } from "../lib/apify.js";
import { pickIgPost, type IgPost } from "../lib/normalize.js";
import { cacheMediaForItems, type UrlSpec } from "../lib/media-cache.js";

const ACTOR_ID = "apify/instagram-scraper";

interface Input {
  username: string;
  postsLimit?: number;
  onlyPostsNewerThan?: string;
  proxyCountry?: string;
  cacheMedia?: boolean;
}

interface Output {
  posts: IgPost[];
}

export default async function postsScrape(
  input: Input,
  context: ServiceContext,
): Promise<Output> {
  const { APIFY_TOKEN } = context.secrets;
  if (!APIFY_TOKEN) throw new Error("APIFY_TOKEN secret is not configured");

  const limit = Math.min(Math.max(input.postsLimit ?? 20, 1), 200);
  const username = input.username.replace(/^@/, "");

  const actorInput: Record<string, unknown> = {
    directUrls: [`https://www.instagram.com/${username}/`],
    resultsType: "posts",
    resultsLimit: limit,
    addParentData: false,
  };
  if (input.onlyPostsNewerThan) actorInput.onlyPostsNewerThan = input.onlyPostsNewerThan;
  if (input.proxyCountry) {
    actorInput.proxyConfiguration = { useApifyProxy: true, apifyProxyCountry: input.proxyCountry };
  }

  const items = await runApifyActor<Record<string, unknown>>({
    actorId: ACTOR_ID,
    token: APIFY_TOKEN,
    input: actorInput,
  });

  const posts: IgPost[] = items.slice(0, limit).map(pickIgPost);

  if (input.cacheMedia) {
    await cacheMediaForItems({
      items: posts,
      ctx: { dataDir: context.dataDir, runId: context.runId },
      pickUrls: (p): UrlSpec[] => {
        const specs: UrlSpec[] = [];
        if (p.displayUrl) specs.push({ kind: "thumb", url: p.displayUrl, ext: "jpg" });
        p.childPosts.forEach((c, i) => {
          if (c.displayUrl) {
            specs.push({ kind: `child-${i}-thumb`, url: c.displayUrl, ext: "jpg" });
          }
        });
        return specs;
      },
    });
  }

  return { posts };
}
