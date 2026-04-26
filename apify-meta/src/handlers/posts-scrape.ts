// Apify actor: https://apify.com/apify/facebook-posts-scraper
import { runApifyActor, type ServiceContext } from "../lib/apify.js";

const ACTOR_ID = "apify/facebook-posts-scraper";

interface Input {
  pageUrl: string;
  postsLimit?: number;
  onlyPostsNewerThan?: string;
  onlyPostsOlderThan?: string;
  proxyCountry?: string;
}

interface PostItem {
  postId: string;
  text: string;
  time: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  url: string;
  mediaType: string;
}

interface Output {
  posts: PostItem[];
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

  const posts: PostItem[] = items.slice(0, limit).map((item) => ({
    postId: String(item.postId ?? item.id ?? ""),
    text: String(item.text ?? item.message ?? ""),
    time: String(item.time ?? item.publishedAt ?? ""),
    likesCount: Number(item.likes ?? item.likesCount ?? 0),
    commentsCount: Number(item.comments ?? item.commentsCount ?? 0),
    sharesCount: Number(item.shares ?? item.sharesCount ?? 0),
    url: String(item.url ?? item.postUrl ?? ""),
    mediaType: String(item.media?.toString() ? "media" : item.mediaType ?? ""),
  }));

  return { posts };
}
