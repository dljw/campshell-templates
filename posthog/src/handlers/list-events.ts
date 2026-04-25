// Handler: List recent events from a PostHog project.
// Requires the optional POSTHOG_PERSONAL_API_KEY + POSTHOG_PROJECT_ID secrets,
// because /api/projects/{id}/events/ is not authorized by the project API key.

interface ServiceContext {
  secrets: Record<string, string>;
  dataDir: string;
  templateName: string;
  operationName: string;
  runId: string;
}

interface ListEventsInput {
  limit?: number;
  after?: string;
  eventName?: string;
}

interface PosthogEventRow {
  id?: string;
  event?: string;
  distinct_id?: string;
  timestamp?: string;
  properties?: Record<string, unknown>;
}

interface PosthogEventsResponse {
  results?: PosthogEventRow[];
}

export default async function listEvents(
  input: ListEventsInput,
  context: ServiceContext,
): Promise<{
  results: Array<{
    id: string;
    event: string;
    distinctId: string;
    timestamp: string;
    properties: Record<string, unknown>;
  }>;
}> {
  const { POSTHOG_INSTANCE, POSTHOG_PERSONAL_API_KEY, POSTHOG_PROJECT_ID } = context.secrets;

  if (!POSTHOG_PERSONAL_API_KEY || !POSTHOG_PROJECT_ID) {
    throw new Error(
      "list-events requires POSTHOG_PERSONAL_API_KEY and POSTHOG_PROJECT_ID secrets. " +
        "Configure them in template settings — the project API key is not authorized for the events query endpoint.",
    );
  }

  const baseUrl = (POSTHOG_INSTANCE || "https://app.posthog.com").replace(/\/+$/, "");
  const params = new URLSearchParams();
  params.set("limit", String(input.limit ?? 100));
  if (input.after) params.set("after", input.after);
  if (input.eventName) params.set("event", input.eventName);

  const url = `${baseUrl}/api/projects/${encodeURIComponent(POSTHOG_PROJECT_ID)}/events/?${params.toString()}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${POSTHOG_PERSONAL_API_KEY}`,
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    throw new Error(`Network error calling PostHog: ${err instanceof Error ? err.message : err}`);
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`PostHog events list error: ${response.status} ${response.statusText}${text ? ` — ${text}` : ""}`);
  }

  let data: PosthogEventsResponse;
  try {
    data = (await response.json()) as PosthogEventsResponse;
  } catch {
    throw new Error("PostHog events list returned invalid JSON");
  }

  const results = (data.results ?? []).map((row) => ({
    id: row.id ?? "",
    event: row.event ?? "",
    distinctId: row.distinct_id ?? "",
    timestamp: row.timestamp ?? "",
    properties: row.properties ?? {},
  }));

  return { results };
}
