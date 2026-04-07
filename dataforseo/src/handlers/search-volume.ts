// Handler: Get monthly search volume and CPC data for keywords

interface ServiceContext {
  secrets: Record<string, string>;
  dataDir: string;
  templateName: string;
  operationName: string;
  runId: string;
}

interface SearchVolumeInput {
  keywords: string[];
  locationCode?: number;
  languageCode?: string;
}

interface KeywordResult {
  keyword: string;
  searchVolume: number;
  cpc: number;
  competition: number;
  competitionLevel: string;
}

interface SearchVolumeOutput {
  results: KeywordResult[];
}

export default async function searchVolume(
  input: SearchVolumeInput,
  context: ServiceContext,
): Promise<SearchVolumeOutput> {
  const { DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD } = context.secrets;
  const locationCode = input.locationCode ?? 2840;
  const languageCode = input.languageCode ?? "en";

  const response = await fetch(
    "https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live",
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`)}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        {
          keywords: input.keywords,
          location_code: locationCode,
          language_code: languageCode,
        },
      ]),
    },
  );

  if (!response.ok) {
    throw new Error(`DataForSEO API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  if (data.status_code !== 20000) {
    throw new Error(`DataForSEO error: ${data.status_message ?? "Unknown error"}`);
  }

  const task = data.tasks?.[0];
  if (!task || task.status_code !== 20000) {
    throw new Error(`DataForSEO task error: ${task?.status_message ?? "No results"}`);
  }

  const results: KeywordResult[] = (task.result ?? []).map((item: Record<string, unknown>) => ({
    keyword: item.keyword as string,
    searchVolume: (item.search_volume as number) ?? 0,
    cpc: (item.cpc as number) ?? 0,
    competition: (item.competition as number) ?? 0,
    competitionLevel: (item.competition_level as string) ?? "unknown",
  }));

  return { results };
}
