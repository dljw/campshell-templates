// Apify actor: https://apify.com/streamers/youtube-scraper
import { runApifyActor, type ServiceContext } from "../lib/apify.js";
import { pickYtChannel, type YtChannel } from "../lib/normalize.js";
import { cacheMediaForItems, type UrlSpec } from "../lib/media-cache.js";

const ACTOR_ID = "streamers/youtube-scraper";

interface Input {
  channelUrls: string[];
  proxyCountry?: string;
  cacheMedia?: boolean;
}

interface Output {
  channels: YtChannel[];
}

export default async function channelScrape(
  input: Input,
  context: ServiceContext,
): Promise<Output> {
  const { APIFY_TOKEN } = context.secrets;
  if (!APIFY_TOKEN) throw new Error("APIFY_TOKEN secret is not configured");

  const actorInput: Record<string, unknown> = {
    startUrls: input.channelUrls.map((url) => ({ url })),
    maxResults: 1,
    maxResultsShorts: 0,
    maxResultStreams: 0,
  };
  if (input.proxyCountry) {
    actorInput.proxyConfiguration = { useApifyProxy: true, apifyProxyCountry: input.proxyCountry };
  }

  const items = await runApifyActor<Record<string, unknown>>({
    actorId: ACTOR_ID,
    token: APIFY_TOKEN,
    input: actorInput,
  });

  const seen = new Set<string>();
  const channels: YtChannel[] = [];
  for (const item of items) {
    const channel = pickYtChannel(item);
    if (!channel.channelId || seen.has(channel.channelId)) continue;
    seen.add(channel.channelId);
    channels.push(channel);
  }

  if (input.cacheMedia !== false) {
    await cacheMediaForItems({
      items: channels,
      ctx: { dataDir: context.dataDir, runId: context.runId },
      pickUrls: (c): UrlSpec[] => {
        const specs: UrlSpec[] = [];
        if (c.channelAvatarUrl) specs.push({ kind: "avatar", url: c.channelAvatarUrl, ext: "jpg" });
        if (c.channelBannerUrl) specs.push({ kind: "banner", url: c.channelBannerUrl, ext: "jpg" });
        return specs;
      },
    });
  }

  return { channels };
}
