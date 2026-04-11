// Handler: Get SERP results with AI Overview/Summary via DataForSEO SERP Live Advanced

interface ServiceContext {
  secrets: Record<string, string>;
  dataDir: string;
  templateName: string;
  operationName: string;
  runId: string;
}

interface SerpAiSummaryInput {
  keyword: string;
  locationCode?: number;
  languageCode?: string;
  device?: "desktop" | "mobile";
}

export default async function serpAiSummary(
  input: SerpAiSummaryInput,
  context: ServiceContext,
): Promise<{ results: Array<Record<string, unknown>> }> {
  const { DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD } = context.secrets;
  const locationCode = input.locationCode ?? 2840;
  const languageCode = input.languageCode ?? "en";
  const device = input.device ?? "desktop";

  let response: Response;
  try {
    response = await fetch(
      "https://api.dataforseo.com/v3/serp/google/organic/live/advanced",
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
            device,
            load_async_ai_overview: true,
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

  return { results: [data] };
}
