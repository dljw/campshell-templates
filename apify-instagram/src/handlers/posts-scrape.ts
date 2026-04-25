// Apify actor: https://console.apify.com/actors/dSCLg0C3YEZ83HzYr (apify/instagram-scraper)
import { runApifyActor, type ServiceContext } from "../lib/apify.js";

const ACTOR_ID = "apify/instagram-scraper";

interface Input {
  username: string;
  postsLimit?: number;
}

interface PostItem {
  id: string;
  shortcode: string;
  caption: string;
  likesCount: number;
  commentsCount: number;
  timestamp: string;
  mediaUrl: string;
  mediaType: string;
  url: string;
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

  const limit = Math.min(Math.max(input.postsLimit ?? 20, 1), 50);
  const username = input.username.replace(/^@/, "");

  const items = await runApifyActor<Record<string, unknown>>({
    actorId: ACTOR_ID,
    token: APIFY_TOKEN,
    input: {
      directUrls: [`https://www.instagram.com/${username}/`],
      resultsType: "posts",
      resultsLimit: limit,
      addParentData: false,
    },
  });

  const posts: PostItem[] = items.slice(0, limit).map((item) => ({
    id: String(item.id ?? ""),
    shortcode: String(item.shortCode ?? item.shortcode ?? ""),
    caption: String(item.caption ?? ""),
    likesCount: Number(item.likesCount ?? 0),
    commentsCount: Number(item.commentsCount ?? 0),
    timestamp: String(item.timestamp ?? ""),
    mediaUrl: String(item.displayUrl ?? item.videoUrl ?? ""),
    mediaType: String(item.type ?? ""),
    url: String(item.url ?? ""),
  }));

  return { posts };
}
