// Apify actor: https://console.apify.com/actors/JJghSZmShuco4j9gJ (apify/facebook-pages-scraper)
import { runApifyActor, type ServiceContext } from "../lib/apify.js";

const ACTOR_ID = "apify/facebook-pages-scraper";

interface Input {
  pageUrls: string[];
}

interface PageItem {
  pageId: string;
  name: string;
  followers: number;
  likes: number;
  category: string;
  about: string;
  websites: string[];
  profilePictureUrl: string;
}

interface Output {
  pages: PageItem[];
}

export default async function pagesScrape(
  input: Input,
  context: ServiceContext,
): Promise<Output> {
  const { APIFY_TOKEN } = context.secrets;
  if (!APIFY_TOKEN) throw new Error("APIFY_TOKEN secret is not configured");

  const items = await runApifyActor<Record<string, unknown>>({
    actorId: ACTOR_ID,
    token: APIFY_TOKEN,
    input: {
      startUrls: input.pageUrls.map((url) => ({ url })),
    },
  });

  const pages: PageItem[] = items.map((item) => ({
    pageId: String(item.pageId ?? item.id ?? ""),
    name: String(item.title ?? item.name ?? ""),
    followers: Number(item.followers ?? item.followersCount ?? 0),
    likes: Number(item.likes ?? item.likesCount ?? 0),
    category: String(item.categories ?? item.category ?? ""),
    about: String(item.intro ?? item.about ?? ""),
    websites: Array.isArray(item.websites) ? (item.websites as string[]) : [],
    profilePictureUrl: String(item.profilePictureUrl ?? item.profilePhoto ?? ""),
  }));

  return { pages };
}
