import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const TEMPLATE_NAME = "apify-meta";

export interface SecretStatus {
  key: string;
  label: string;
  description?: string;
  required: boolean;
  configured: boolean;
}

export interface SecretsStatusResponse {
  template: string;
  allRequiredConfigured: boolean;
  secrets: SecretStatus[];
}

export interface RunHistoryItem {
  runId: string;
  operation: string;
  status: "success" | "error" | "running";
  input: unknown;
  output: unknown;
  startedAt: string;
  completedAt: string | null;
  durationMs: number | null;
  error: string | null;
}

export interface UseApifyMetaReturn {
  secretsStatus: SecretsStatusResponse | null;
  runs: RunHistoryItem[];
  isLoading: boolean;
  isExecuting: boolean;

  fetchSecretsStatus: () => Promise<void>;
  setSecrets: (secrets: Record<string, string>) => Promise<boolean>;
  fetchRuns: () => Promise<void>;
  executeOperation: (operation: string, input: unknown) => Promise<any>;
  downloadMediaZip: (runId: string, itemIds: string[]) => Promise<void>;
}

export function useApifyMeta(apiBase = ""): UseApifyMetaReturn {
  const [secretsStatus, setSecretsStatus] = useState<SecretsStatusResponse | null>(null);
  const [runs, setRuns] = useState<RunHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);

  const fetchSecretsStatus = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/api/services/${TEMPLATE_NAME}/secrets/status`);
      if (res.ok) setSecretsStatus(await res.json());
    } catch (err) {
      console.error("Failed to fetch secrets status", err);
    }
  }, [apiBase]);

  const fetchRuns = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/api/services/${TEMPLATE_NAME}/runs`);
      if (res.ok) {
        const data = await res.json();
        setRuns(data.runs || []);
      }
    } catch (err) {
      console.error("Failed to fetch runs", err);
    }
  }, [apiBase]);

  const setSecrets = useCallback(
    async (secrets: Record<string, string>) => {
      try {
        const res = await fetch(`${apiBase}/api/services/${TEMPLATE_NAME}/secrets`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(secrets),
        });
        if (res.ok) {
          toast.success("Apify token saved");
          await fetchSecretsStatus();
          return true;
        } else {
          const error = await res.json();
          toast.error(`Failed to save: ${error.error || "Unknown error"}`);
          return false;
        }
      } catch (err) {
        console.error("Failed to set secrets", err);
        toast.error("Failed to save token");
        return false;
      }
    },
    [apiBase, fetchSecretsStatus],
  );

  const executeOperation = useCallback(
    async (operation: string, input: unknown) => {
      setIsExecuting(true);
      try {
        const res = await fetch(`${apiBase}/api/services/${TEMPLATE_NAME}/${operation}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(`Operation failed: ${data.error || "Unknown error"}`);
          throw new Error(data.error || "Operation failed");
        }
        if (data.status === "error") {
          toast.error(`Operation failed: ${data.error || "Unknown error"}`);
          throw new Error(data.error || "Operation failed");
        }
        toast.success(`${operation} completed`);
        await fetchRuns();
        return data;
      } catch (err) {
        console.error(`Failed to execute ${operation}`, err);
        throw err;
      } finally {
        setIsExecuting(false);
      }
    },
    [apiBase, fetchRuns],
  );

  const downloadMediaZip = useCallback(
    async (runId: string, itemIds: string[]) => {
      try {
        const res = await fetch(`${apiBase}/api/services/${TEMPLATE_NAME}/media-zip`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ runId, itemIds }),
        });
        const data = await res.json();
        if (!res.ok || data.status === "error") {
          toast.error(`Download failed: ${data.error ?? "Unknown error"}`);
          return;
        }
        const out = data.output ?? data;
        if (!out?.dataUrl) {
          toast.error("Download failed: no data returned");
          return;
        }
        const a = document.createElement("a");
        a.href = out.dataUrl;
        a.download = out.filename ?? `${runId}.zip`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        toast.success(`Downloaded ${out.fileCount ?? itemIds.length} files`);
      } catch (err) {
        console.error("Failed to download media zip", err);
        toast.error("Download failed");
      }
    },
    [apiBase],
  );

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    Promise.all([fetchSecretsStatus(), fetchRuns()]).finally(() => {
      if (mounted) setIsLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [fetchSecretsStatus, fetchRuns]);

  return {
    secretsStatus,
    runs,
    isLoading,
    isExecuting,
    fetchSecretsStatus,
    setSecrets,
    fetchRuns,
    executeOperation,
    downloadMediaZip,
  };
}
