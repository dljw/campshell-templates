// Handler: Analyze top SERP results for a keyword

interface ServiceContext {
  secrets: Record<string, string>;
  dataDir: string;
  templateName: string;
  operationName: string;
  runId: string;
}

interface SerpAnalysisInput {
  keyword: string;
  locationCode?: number;
  depth?: number;
}

interface SerpResult {
  position: number;
  url: string;
  title: string;
  description: string;
  domain: string;
}

interface SerpAnalysisOutput {
  results: SerpResult[];
}

export default async function serpAnalysis(
  input: SerpAnalysisInput,
  context: ServiceContext,
): Promise<SerpAnalysisOutput> {
  const { DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD } = context.secrets;
  const locationCode = input.locationCode ?? 2840;
  const depth = input.depth ?? 10;

  const response = await fetch(
    "https://api.dataforseo.com/v3/serp/google/organic/live/regular",
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`)}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        {
          keyword: input.keyword,
          location_code: locationCode,
          language_code: "en",
          depth,
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

  const items = task.result?.[0]?.items ?? [];

  const results: SerpResult[] = items
    .filter((item: Record<string, unknown>) => item.type === "organic")
    .map((item: Record<string, unknown>) => ({
      position: (item.rank_absolute as number) ?? 0,
      url: (item.url as string) ?? "",
      title: (item.title as string) ?? "",
      description: (item.description as string) ?? "",
      domain: (item.domain as string) ?? "",
    }));

  return { results };
}
