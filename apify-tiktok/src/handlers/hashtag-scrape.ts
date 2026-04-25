// Apify actor: https://console.apify.com/actors/GdWCkxBtKWOsKjdch (clockworks/free-tiktok-scraper)
import { runApifyActor, type ServiceContext } from "../lib/apify.js";

const ACTOR_ID = "clockworks/free-tiktok-scraper";

interface Input {
  hashtag: string;
  videosLimit?: number;
}

interface VideoItem {
  id: string;
  text: string;
  playCount: number;
  diggCount: number;
  authorUsername: string;
  createTime: string;
}

interface Output {
  videos: VideoItem[];
}

export default async function hashtagScrape(
  input: Input,
  context: ServiceContext,
): Promise<Output> {
  const { APIFY_TOKEN } = context.secrets;
  if (!APIFY_TOKEN) throw new Error("APIFY_TOKEN secret is not configured");

  const limit = Math.min(Math.max(input.videosLimit ?? 20, 1), 50);
  const tag = input.hashtag.replace(/^#/, "");

  const items = await runApifyActor<Record<string, unknown>>({
    actorId: ACTOR_ID,
    token: APIFY_TOKEN,
    input: {
      hashtags: [tag],
      resultsPerPage: limit,
      shouldDownloadVideos: false,
      shouldDownloadCovers: false,
      shouldDownloadSubtitles: false,
      shouldDownloadSlideshowImages: false,
    },
  });

  const videos: VideoItem[] = items.slice(0, limit).map((item) => {
    const author = (item.authorMeta ?? item.author ?? {}) as Record<string, unknown>;
    return {
      id: String(item.id ?? ""),
      text: String(item.text ?? ""),
      playCount: Number(item.playCount ?? 0),
      diggCount: Number(item.diggCount ?? 0),
      authorUsername: String(author.name ?? author.uniqueId ?? ""),
      createTime: typeof item.createTimeISO === "string"
        ? item.createTimeISO
        : new Date(Number(item.createTime ?? 0) * 1000).toISOString(),
    };
  });

  return { videos };
}
