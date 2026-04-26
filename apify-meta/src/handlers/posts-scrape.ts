// Apify actor: https://apify.com/apify/facebook-posts-scraper
import { runApifyActor, type ServiceContext } from "../lib/apify.js";
import { pickMetaPost, type MetaPost } from "../lib/normalize.js";
import { cacheMediaForItems, type UrlSpec } from "../lib/media-cache.js";

const ACTOR_ID = "apify/facebook-posts-scraper";

interface Input {
  pageUrl: string;
  postsLimit?: number;
  onlyPostsNewerThan?: string;
  onlyPostsOlderThan?: string;
  proxyCountry?: string;
  cacheMedia?: boolean;
}

interface Output {
  posts: MetaPost[];
}

export default async function postsScrape(
  input: Input,
  context: ServiceContext,
): Promise<Output> {
  const { APIFY_TOKEN } = context.secrets;
  if (!APIFY_TOKEN) throw new Error("APIFY_TOKEN secret is not configured");

  const limit = Math.min(Math.max(input.postsLimit ?? 20, 1), 200);

  const actorInput: Record<string, unknown> = {
    startUrls: [{ url: input.pageUrl }],
    resultsLimit: limit,
  };
  if (input.onlyPostsNewerThan) actorInput.onlyPostsNewerThan = input.onlyPostsNewerThan;
  if (input.onlyPostsOlderThan) actorInput.onlyPostsOlderThan = input.onlyPostsOlderThan;
  if (input.proxyCountry) {
    actorInput.proxyConfiguration = { useApifyProxy: true, apifyProxyCountry: input.proxyCountry };
  }

  const items = await runApifyActor<Record<string, unknown>>({
    actorId: ACTOR_ID,
    token: APIFY_TOKEN,
    input: actorInput,
  });

  const posts: MetaPost[] = items.slice(0, limit).map(pickMetaPost);

  if (input.cacheMedia) {
    await cacheMediaForItems<MetaPost>({
      items: posts,
      ctx: { dataDir: context.dataDir, runId: context.runId },
      pickUrls: (post): UrlSpec[] => {
        const specs: UrlSpec[] = [];
        if (post.displayUrl) {
          specs.push({ kind: "thumb", url: post.displayUrl, ext: "jpg" });
        }
        post.childPosts?.forEach((c, i) => {
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
