// Shared APIFY_TOKEN fan-out helpers. The Campshell secrets vault is per-template,
// so to give users a "configure once" experience, this module discovers all installed
// apify-* templates and writes the same APIFY_TOKEN into each via the existing
// /api/services/:template/secrets endpoint. Any future template whose name starts
// with "apify-" and that declares APIFY_TOKEN auto-participates.

const SECRET_KEY = "APIFY_TOKEN";
const NAME_PREFIX = "apify-";

export interface ApifySibling {
  name: string;
  displayName: string;
  emoji: string;
  configured: boolean;
  isSelf: boolean;
}

interface StatusTemplate {
  name: string;
  displayName: string;
  emoji: string;
  type: "data" | "service";
}

interface SecretStatusEntry {
  key: string;
  configured: boolean;
}

interface SecretsStatusResponse {
  template: string;
  allRequiredConfigured: boolean;
  secrets: SecretStatusEntry[];
}

export async function discoverApifySiblings(
  apiBase: string,
  selfTemplate: string,
): Promise<ApifySibling[]> {
  const statusRes = await fetch(`${apiBase}/api/status`);
  if (!statusRes.ok) throw new Error(`GET /api/status failed: ${statusRes.status}`);
  const statusBody = (await statusRes.json()) as { templates?: StatusTemplate[] };
  const candidates = (statusBody.templates ?? []).filter(
    (t) => t.type === "service" && t.name.startsWith(NAME_PREFIX),
  );

  const results = await Promise.all(
    candidates.map(async (t): Promise<ApifySibling | null> => {
      try {
        const res = await fetch(`${apiBase}/api/services/${t.name}/secrets/status`);
        if (!res.ok) return null;
        const body = (await res.json()) as SecretsStatusResponse;
        const entry = body.secrets.find((s) => s.key === SECRET_KEY);
        if (!entry) return null;
        return {
          name: t.name,
          displayName: t.displayName,
          emoji: t.emoji,
          configured: entry.configured,
          isSelf: t.name === selfTemplate,
        };
      } catch {
        return null;
      }
    }),
  );

  return results
    .filter((s): s is ApifySibling => s !== null)
    .sort((a, b) => {
      if (a.isSelf !== b.isSelf) return a.isSelf ? -1 : 1;
      return a.displayName.localeCompare(b.displayName);
    });
}

export interface SaveResult {
  name: string;
  displayName: string;
  ok: boolean;
  error?: string;
}

export async function saveApifyTokenToAllSiblings(
  apiBase: string,
  token: string,
  siblings: ApifySibling[],
): Promise<SaveResult[]> {
  return Promise.all(
    siblings.map(async (s): Promise<SaveResult> => {
      try {
        const res = await fetch(`${apiBase}/api/services/${s.name}/secrets`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [SECRET_KEY]: token }),
        });
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          return { name: s.name, displayName: s.displayName, ok: false, error: body.error ?? `HTTP ${res.status}` };
        }
        return { name: s.name, displayName: s.displayName, ok: true };
      } catch (err) {
        return { name: s.name, displayName: s.displayName, ok: false, error: (err as Error).message };
      }
    }),
  );
}
