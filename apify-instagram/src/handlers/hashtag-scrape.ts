// Apify actor: https://apify.com/apify/instagram-scraper
import { runApifyActor, type ServiceContext } from "../lib/apify.js";

const ACTOR_ID = "apify/instagram-scraper";

interface Input {
  hashtag: string;
  postsLimit?: number;
  onlyPostsNewerThan?: string;
  onlyPostsOlderThan?: string;
  proxyCountry?: string;
}

interface PostItem {
  id: string;
  shortcode: string;
  caption: string;
  likesCount: number;
  commentsCount: number;
  timestamp: string;
  ownerUsername: string;
}

interface Output {
  posts: PostItem[];
}

export default async function hashtagScrape(
  input: Input,
  context: ServiceContext,
): Promise<Output> {
  const { APIFY_TOKEN } = context.secrets;
  if (!APIFY_TOKEN) throw new Error("APIFY_TOKEN secret is not configured");

  const limit = Math.min(Math.max(input.postsLimit ?? 20, 1), 200);
  const tag = input.hashtag.replace(/^#/, "");

  const actorInput: Record<string, unknown> = {
    directUrls: [`https://www.instagram.com/explore/tags/${tag}/`],
    resultsType: "posts",
    resultsLimit: limit,
    addParentData: false,
  };
  if (input.onlyPostsNewerThan) actorInput.onlyPostsNewerThan = input.onlyPostsNewerThan;
  if (input.onlyPostsOlderThan) actorInput.onlyPostsOlderThan = input.onlyPostsOlderThan;
  if (input.proxyCountry) {
    actorInput.proxy = { useApifyProxy: true, apifyProxyCountry: input.proxyCountry };
  }

  const items = await runApifyActor<Record<string, unknown>>({
    actorId: ACTOR_ID,
    token: APIFY_TOKEN,
    input: actorInput,
  });

  const posts: PostItem[] = items.slice(0, limit).map((item) => ({
    id: String(item.id ?? ""),
    shortcode: String(item.shortCode ?? item.shortcode ?? ""),
    caption: String(item.caption ?? ""),
    likesCount: Number(item.likesCount ?? 0),
    commentsCount: Number(item.commentsCount ?? 0),
    timestamp: String(item.timestamp ?? ""),
    ownerUsername: String(item.ownerUsername ?? ""),
  }));

  return { posts };
}
