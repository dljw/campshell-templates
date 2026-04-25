// Apify actor: https://console.apify.com/actors/h7sDV53CddomktSi5 (streamers/youtube-scraper)
import { runApifyActor, type ServiceContext } from "../lib/apify.js";

const ACTOR_ID = "streamers/youtube-scraper";

interface Input {
  channelUrls: string[];
}

interface ChannelItem {
  channelId: string;
  channelName: string;
  subscriberCount: number;
  videosCount: number;
  viewCount: number;
  description: string;
  channelUrl: string;
}

interface Output {
  channels: ChannelItem[];
}

export default async function channelScrape(
  input: Input,
  context: ServiceContext,
): Promise<Output> {
  const { APIFY_TOKEN } = context.secrets;
  if (!APIFY_TOKEN) throw new Error("APIFY_TOKEN secret is not configured");

  const items = await runApifyActor<Record<string, unknown>>({
    actorId: ACTOR_ID,
    token: APIFY_TOKEN,
    input: {
      startUrls: input.channelUrls.map((url) => ({ url })),
      maxResults: 1,
      maxResultsShorts: 0,
      maxResultStreams: 0,
    },
  });

  const seen = new Set<string>();
  const channels: ChannelItem[] = [];
  for (const item of items) {
    const channelId = String(item.channelId ?? item.channelUrl ?? "");
    if (!channelId || seen.has(channelId)) continue;
    seen.add(channelId);
    channels.push({
      channelId,
      channelName: String(item.channelName ?? item.channelTitle ?? ""),
      subscriberCount: Number(item.numberOfSubscribers ?? item.subscriberCount ?? 0),
      videosCount: Number(item.channelTotalVideos ?? item.videosCount ?? 0),
      viewCount: Number(item.channelTotalViews ?? item.viewCount ?? 0),
      description: String(item.channelDescription ?? item.description ?? ""),
      channelUrl: String(item.channelUrl ?? ""),
    });
  }

  return { channels };
}
