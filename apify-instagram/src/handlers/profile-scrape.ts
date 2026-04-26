// Apify actor: https://apify.com/apify/instagram-scraper
import { runApifyActor, type ServiceContext } from "../lib/apify.js";

const ACTOR_ID = "apify/instagram-scraper";

interface Input {
  usernames: string[];
  proxyCountry?: string;
}

interface ProfileItem {
  username: string;
  fullName: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  biography: string;
  isVerified: boolean;
  profilePicUrl: string;
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

  const actorInput: Record<string, unknown> = {
    directUrls: input.usernames.map(
      (u) => `https://www.instagram.com/${u.replace(/^@/, "")}/`,
    ),
    resultsType: "details",
    resultsLimit: input.usernames.length,
    addParentData: false,
  };
  if (input.proxyCountry) {
    actorInput.proxy = { useApifyProxy: true, apifyProxyCountry: input.proxyCountry };
  }

  const items = await runApifyActor<Record<string, unknown>>({
    actorId: ACTOR_ID,
    token: APIFY_TOKEN,
    input: actorInput,
  });

  const profiles: ProfileItem[] = items.map((item) => ({
    username: String(item.username ?? ""),
    fullName: String(item.fullName ?? ""),
    followersCount: Number(item.followersCount ?? 0),
    followingCount: Number(item.followsCount ?? item.followingCount ?? 0),
    postsCount: Number(item.postsCount ?? 0),
    biography: String(item.biography ?? ""),
    isVerified: Boolean(item.verified ?? item.isVerified ?? false),
    profilePicUrl: String(item.profilePicUrl ?? item.profilePicUrlHD ?? ""),
  }));

  return { profiles };
}
