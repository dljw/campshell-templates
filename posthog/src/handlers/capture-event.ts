// Handler: Track a custom event for a user via PostHog /capture/

interface ServiceContext {
  secrets: Record<string, string>;
  dataDir: string;
  templateName: string;
  operationName: string;
  runId: string;
}

interface CaptureEventInput {
  event: string;
  distinctId: string;
  properties?: Record<string, unknown>;
  timestamp?: string;
}

export default async function captureEvent(
  input: CaptureEventInput,
  context: ServiceContext,
): Promise<{ success: boolean; status: number }> {
  const { POSTHOG_API_KEY, POSTHOG_INSTANCE } = context.secrets;
  const baseUrl = (POSTHOG_INSTANCE || "https://app.posthog.com").replace(/\/+$/, "");

  const body = {
    api_key: POSTHOG_API_KEY,
    event: input.event,
    distinct_id: input.distinctId,
    properties: input.properties ?? {},
    timestamp: input.timestamp ?? new Date().toISOString(),
  };

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/capture/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new Error(`Network error calling PostHog: ${err instanceof Error ? err.message : err}`);
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`PostHog capture error: ${response.status} ${response.statusText}${text ? ` — ${text}` : ""}`);
  }

  return { success: true, status: response.status };
}
