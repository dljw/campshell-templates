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

  let response: Response;
  try {
    response = await fetch(
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
  } catch (err) {
    throw new Error(`Network error calling DataForSEO: ${err instanceof Error ? err.message : err}`);
  }

  if (!response.ok) {
    throw new Error(`DataForSEO API error: ${response.status} ${response.statusText}`);
  }

  let data: Record<string, unknown>;
  try {
    data = await response.json();
  } catch {
    throw new Error("DataForSEO returned invalid JSON");
  }

  if (data.status_code !== 20000) {
    throw new Error(`DataForSEO error: ${data.status_message ?? "Unknown error"}`);
  }

  const tasks = data.tasks as Array<Record<string, unknown>> | undefined;
  const task = tasks?.[0];
  if (!task || task.status_code !== 20000) {
    throw new Error(`DataForSEO task error: ${task?.status_message ?? "No results"}`);
  }

  const results: KeywordResult[] = ((task.result as Array<Record<string, unknown>>) ?? []).map((item) => ({
    keyword: (item.keyword as string) ?? "",
    searchVolume: (item.search_volume as number) ?? 0,
    cpc: (item.cpc as number) ?? 0,
    competition: (item.competition as number) ?? 0,
    competitionLevel: (item.competition_level as string) ?? "unknown",
  }));

  return { results };
}
