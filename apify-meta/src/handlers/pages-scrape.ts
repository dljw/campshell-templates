// Apify actor: https://apify.com/apify/facebook-pages-scraper
import { runApifyActor, type ServiceContext } from "../lib/apify.js";
import { pickMetaPage, type MetaPage } from "../lib/normalize.js";
import { cacheMediaForItems, type UrlSpec } from "../lib/media-cache.js";

const ACTOR_ID = "apify/facebook-pages-scraper";

interface Input {
  pageUrls: string[];
  proxyCountry?: string;
  cacheMedia?: boolean;
}

interface Output {
  pages: MetaPage[];
}

export default async function pagesScrape(
  input: Input,
  context: ServiceContext,
): Promise<Output> {
  const { APIFY_TOKEN } = context.secrets;
  if (!APIFY_TOKEN) throw new Error("APIFY_TOKEN secret is not configured");

  const actorInput: Record<string, unknown> = {
    startUrls: input.pageUrls.map((url) => ({ url })),
  };
  if (input.proxyCountry) {
    actorInput.proxyConfiguration = { useApifyProxy: true, apifyProxyCountry: input.proxyCountry };
  }

  const items = await runApifyActor<Record<string, unknown>>({
    actorId: ACTOR_ID,
    token: APIFY_TOKEN,
    input: actorInput,
  });

  const pages: MetaPage[] = items.map(pickMetaPage);

  if (input.cacheMedia !== false) {
    await cacheMediaForItems<MetaPage>({
      items: pages,
      ctx: { dataDir: context.dataDir, runId: context.runId },
      pickUrls: (page): UrlSpec[] => {
        const specs: UrlSpec[] = [];
        if (page.profilePictureUrl) {
          specs.push({ kind: "avatar", url: page.profilePictureUrl, ext: "jpg" });
        }
        if (page.coverPhotoUrl) {
          specs.push({ kind: "cover", url: page.coverPhotoUrl, ext: "jpg" });
        }
        return specs;
      },
    });
  }

  return { pages };
}
