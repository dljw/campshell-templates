// Handler: Get keywords a domain/URL ranks for via DataForSEO Labs

interface ServiceContext {
  secrets: Record<string, string>;
  dataDir: string;
  templateName: string;
  operationName: string;
  runId: string;
}

interface RankedKeywordsInput {
  target: string;
  locationCode?: number;
  languageCode?: string;
  limit?: number;
  itemTypes?: string[];
}

export default async function rankedKeywords(
  input: RankedKeywordsInput,
  context: ServiceContext,
): Promise<{ results: Array<Record<string, unknown>> }> {
  const { DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD } = context.secrets;
  const locationCode = input.locationCode ?? 2840;
  const languageCode = input.languageCode ?? "en";
  const limit = input.limit ?? 100;

  const body: Record<string, unknown> = {
    target: input.target,
    location_code: locationCode,
    language_code: languageCode,
    limit,
  };

  if (input.itemTypes && input.itemTypes.length > 0) {
    body.item_types = input.itemTypes;
  }

  let response: Response;
  try {
    response = await fetch(
      "https://api.dataforseo.com/v3/dataforseo_labs/google/ranked_keywords/live",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(`${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`)}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([body]),
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
