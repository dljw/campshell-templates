// Apify actor: https://console.apify.com/actors/GdWCkxBtKWOsKjdch (clockworks/free-tiktok-scraper)
import { runApifyActor, type ServiceContext } from "../lib/apify.js";

const ACTOR_ID = "clockworks/free-tiktok-scraper";

interface Input {
  username: string;
  videosLimit?: number;
}

interface VideoItem {
  id: string;
  text: string;
  playCount: number;
  diggCount: number;
  commentCount: number;
  shareCount: number;
  createTime: string;
  webVideoUrl: string;
  musicTitle: string;
}

interface Output {
  videos: VideoItem[];
}

export default async function videosScrape(
  input: Input,
  context: ServiceContext,
): Promise<Output> {
  const { APIFY_TOKEN } = context.secrets;
  if (!APIFY_TOKEN) throw new Error("APIFY_TOKEN secret is not configured");

  const limit = Math.min(Math.max(input.videosLimit ?? 20, 1), 50);
  const username = input.username.replace(/^@/, "");

  const items = await runApifyActor<Record<string, unknown>>({
    actorId: ACTOR_ID,
    token: APIFY_TOKEN,
    input: {
      profiles: [username],
      profileScrapeSections: ["videos"],
      resultsPerPage: limit,
      shouldDownloadVideos: false,
      shouldDownloadCovers: false,
      shouldDownloadSubtitles: false,
      shouldDownloadSlideshowImages: false,
      profileSorting: "latest",
      excludePinnedPosts: false,
    },
  });

  const videos: VideoItem[] = items.slice(0, limit).map((item) => {
    const music = (item.musicMeta ?? {}) as Record<string, unknown>;
    return {
      id: String(item.id ?? ""),
      text: String(item.text ?? ""),
      playCount: Number(item.playCount ?? 0),
      diggCount: Number(item.diggCount ?? 0),
      commentCount: Number(item.commentCount ?? 0),
      shareCount: Number(item.shareCount ?? 0),
      createTime: typeof item.createTimeISO === "string"
        ? item.createTimeISO
        : new Date(Number(item.createTime ?? 0) * 1000).toISOString(),
      webVideoUrl: String(item.webVideoUrl ?? ""),
      musicTitle: String(music.musicName ?? music.title ?? ""),
    };
  });

  return { videos };
}
