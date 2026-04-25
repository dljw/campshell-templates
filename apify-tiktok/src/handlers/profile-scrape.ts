// Apify actor: https://console.apify.com/actors/GdWCkxBtKWOsKjdch (clockworks/free-tiktok-scraper)
import { runApifyActor, type ServiceContext } from "../lib/apify.js";

const ACTOR_ID = "clockworks/free-tiktok-scraper";

interface Input {
  usernames: string[];
}

interface ProfileItem {
  username: string;
  nickname: string;
  followerCount: number;
  followingCount: number;
  videoCount: number;
  heartCount: number;
  bio: string;
  verified: boolean;
  avatarUrl: string;
}

interface Output {
  profiles: ProfileItem[];
}

export default async function profileScrape(
  input: Input,
  context: ServiceContext,
): Promise<Output> {
  const { APIFY_TOKEN } = context.secrets;
  if (!APIFY_TOKEN) throw new Error("APIFY_TOKEN secret is not configured");

  const profiles_urls = input.usernames.map(
    (u) => `https://www.tiktok.com/@${u.replace(/^@/, "")}`,
  );

  const items = await runApifyActor<Record<string, unknown>>({
    actorId: ACTOR_ID,
    token: APIFY_TOKEN,
    input: {
      profiles: input.usernames.map((u) => u.replace(/^@/, "")),
      profileScrapeSections: ["videos"],
      resultsPerPage: 1,
      shouldDownloadVideos: false,
      shouldDownloadCovers: false,
      shouldDownloadSubtitles: false,
      shouldDownloadSlideshowImages: false,
      profileSorting: "latest",
      excludePinnedPosts: false,
    },
  });

  const seen = new Set<string>();
  const profiles: ProfileItem[] = [];
  for (const item of items) {
    const author = (item.authorMeta ?? item.author ?? {}) as Record<string, unknown>;
    const username = String(author.name ?? author.uniqueId ?? "");
    if (!username || seen.has(username)) continue;
    seen.add(username);
    profiles.push({
      username,
      nickname: String(author.nickName ?? author.nickname ?? ""),
      followerCount: Number(author.fans ?? author.followerCount ?? 0),
      followingCount: Number(author.following ?? author.followingCount ?? 0),
      videoCount: Number(author.video ?? author.videoCount ?? 0),
      heartCount: Number(author.heart ?? author.heartCount ?? 0),
      bio: String(author.signature ?? author.bio ?? ""),
      verified: Boolean(author.verified ?? false),
      avatarUrl: String(author.avatar ?? author.avatarUrl ?? ""),
    });
  }

  // unused — silences the compiler about the URL list above being intentional context
  void profiles_urls;

  return { profiles };
}
