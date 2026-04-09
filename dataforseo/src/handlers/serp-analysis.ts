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
  languageCode?: string;
  depth?: number;
}

export default async function serpAnalysis(
  input: SerpAnalysisInput,
  context: ServiceContext,
): Promise<{ results: Array<Record<string, unknown>> }> {
  const { DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD } = context.secrets;
  const locationCode = input.locationCode ?? 2840;
  const languageCode = input.languageCode ?? "en";
  const depth = input.depth ?? 10;

  let response: Response;
  try {
    response = await fetch(
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
            language_code: languageCode,
            depth,
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

  const taskResult = task.result as Array<Record<string, unknown>> | undefined;
  const items = (taskResult?.[0]?.items as Array<Record<string, unknown>>) ?? [];

  const results = items.filter((item) => item.type === "organic");

  return { results };
}
