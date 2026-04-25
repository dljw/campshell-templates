// Handler: Evaluate feature flags for a user via PostHog /decide

interface ServiceContext {
  secrets: Record<string, string>;
  dataDir: string;
  templateName: string;
  operationName: string;
  runId: string;
}

interface GetFeatureFlagsInput {
  distinctId: string;
  groups?: Record<string, string>;
}

interface DecideResponse {
  featureFlags?: Record<string, unknown>;
  featureFlagPayloads?: Record<string, unknown>;
}

export default async function getFeatureFlags(
  input: GetFeatureFlagsInput,
  context: ServiceContext,
): Promise<{ flags: Record<string, unknown>; featureFlagPayloads: Record<string, unknown> }> {
  const { POSTHOG_API_KEY, POSTHOG_INSTANCE } = context.secrets;
  const baseUrl = (POSTHOG_INSTANCE || "https://app.posthog.com").replace(/\/+$/, "");

  const body = {
    api_key: POSTHOG_API_KEY,
    distinct_id: input.distinctId,
    groups: input.groups ?? {},
  };

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/decide/?v=3`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new Error(`Network error calling PostHog: ${err instanceof Error ? err.message : err}`);
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`PostHog /decide error: ${response.status} ${response.statusText}${text ? ` — ${text}` : ""}`);
  }

  let data: DecideResponse;
  try {
    data = (await response.json()) as DecideResponse;
  } catch {
    throw new Error("PostHog /decide returned invalid JSON");
  }

  return {
    flags: data.featureFlags ?? {},
    featureFlagPayloads: data.featureFlagPayloads ?? {},
  };
}
