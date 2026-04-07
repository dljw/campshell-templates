// Handler: Get related keyword suggestions based on a seed keyword

interface ServiceContext {
  secrets: Record<string, string>;
  dataDir: string;
  templateName: string;
  operationName: string;
  runId: string;
}

interface KeywordSuggestionsInput {
  seed: string;
  locationCode?: number;
  limit?: number;
}

interface KeywordSuggestion {
  keyword: string;
  searchVolume: number;
  cpc: number;
  competition: number;
}

interface KeywordSuggestionsOutput {
  suggestions: KeywordSuggestion[];
}

export default async function keywordSuggestions(
  input: KeywordSuggestionsInput,
  context: ServiceContext,
): Promise<KeywordSuggestionsOutput> {
  const { DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD } = context.secrets;
  const locationCode = input.locationCode ?? 2840;
  const limit = input.limit ?? 20;

  const response = await fetch(
    "https://api.dataforseo.com/v3/keywords_data/google_ads/keywords_for_keywords/live",
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`)}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        {
          keywords: [input.seed],
          location_code: locationCode,
          language_code: "en",
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

  const items = task.result ?? [];

  const suggestions: KeywordSuggestion[] = items
    .slice(0, limit)
    .map((item: Record<string, unknown>) => ({
      keyword: (item.keyword as string) ?? "",
      searchVolume: (item.search_volume as number) ?? 0,
      cpc: (item.cpc as number) ?? 0,
      competition: (item.competition as number) ?? 0,
    }));

  return { suggestions };
}
