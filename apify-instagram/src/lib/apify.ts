// Thin wrapper around Apify's run-sync-get-dataset-items endpoint.
// Each template gets its own copy — keeps bundles self-contained.

interface RunApifyActorOpts {
  actorId: string;
  token: string;
  input: Record<string, unknown>;
}

export async function runApifyActor<T = unknown>(opts: RunApifyActorOpts): Promise<T[]> {
  const url = `https://api.apify.com/v2/acts/${encodeURIComponent(opts.actorId)}/run-sync-get-dataset-items?token=${opts.token}`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(opts.input),
    });
  } catch (e) {
    throw new Error(`Network error calling Apify actor ${opts.actorId}: ${(e as Error).message}`);
  }
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Apify error ${res.status} ${res.statusText}: ${body.slice(0, 500)}`);
  }
  return (await res.json()) as T[];
}

export interface ServiceContext {
  secrets: Record<string, string>;
  dataDir: string;
  templateName: string;
  operationName: string;
  runId: string;
}
