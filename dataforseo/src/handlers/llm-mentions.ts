// Handler: Track brand/keyword mentions in LLMs (ChatGPT, Google AI) via DataForSEO

interface ServiceContext {
  secrets: Record<string, string>;
  dataDir: string;
  templateName: string;
  operationName: string;
  runId: string;
}

interface LlmMentionTarget {
  type: "domain" | "keyword";
  value: string;
  searchFilter?: "include" | "exclude";
}

interface LlmMentionsInput {
  targets: LlmMentionTarget[];
  platform?: "chat_gpt" | "google";
  locationCode?: number;
  languageCode?: string;
  limit?: number;
}

export default async function llmMentions(
  input: LlmMentionsInput,
  context: ServiceContext,
): Promise<{ results: Array<Record<string, unknown>> }> {
  const { DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD } = context.secrets;
  const locationCode = input.locationCode ?? 2840;
  const languageCode = input.languageCode ?? "en";
  const platform = input.platform ?? "google";
  const limit = input.limit ?? 100;

  // Map simplified targets to DataForSEO target format
  const target = input.targets.map((t) => {
    const base: Record<string, unknown> = {
      search_filter: t.searchFilter ?? "include",
    };
    if (t.type === "domain") {
      base.domain = t.value;
    } else {
      base.keyword = t.value;
    }
    return base;
  });

  let response: Response;
  try {
    response = await fetch(
      "https://api.dataforseo.com/v3/ai_optimization/llm_mentions/search/live",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(`${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`)}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          {
            target,
            platform,
            location_code: locationCode,
            language_code: languageCode,
            limit,
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
