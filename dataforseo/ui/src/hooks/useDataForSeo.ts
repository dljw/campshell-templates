import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

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

export interface UseDataForSeoReturn {
  secretsStatus: SecretsStatusResponse | null;
  runs: RunHistoryItem[];
  isLoading: boolean;
  isExecuting: boolean;

  fetchSecretsStatus: () => Promise<void>;
  setSecrets: (secrets: Record<string, string>) => Promise<boolean>;
  fetchRuns: () => Promise<void>;
  executeOperation: (operation: string, input: unknown) => Promise<unknown>;
}

export function useDataForSeo(apiBase = ""): UseDataForSeoReturn {
  const [secretsStatus, setSecretsStatus] = useState<SecretsStatusResponse | null>(null);
  const [runs, setRuns] = useState<RunHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);

  const fetchSecretsStatus = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/api/services/dataforseo/secrets/status`);
      if (res.ok) {
        const data = await res.json();
        setSecretsStatus(data);
      }
    } catch (err) {
      console.error("Failed to fetch secrets status", err);
    }
  }, [apiBase]);

  const fetchRuns = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/api/services/dataforseo/runs`);
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
        const res = await fetch(`${apiBase}/api/services/dataforseo/secrets`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(secrets),
        });
        if (res.ok) {
          toast.success("Secrets updated successfully");
          await fetchSecretsStatus();
          return true;
        } else {
          const error = await res.json();
          toast.error(`Failed to update secrets: ${error.error || "Unknown error"}`);
          return false;
        }
      } catch (err) {
        console.error("Failed to set secrets", err);
        toast.error("Failed to update secrets");
        return false;
      }
    },
    [apiBase, fetchSecretsStatus],
  );

  const executeOperation = useCallback(
    async (operation: string, input: unknown) => {
      setIsExecuting(true);
      try {
        const res = await fetch(`${apiBase}/api/services/dataforseo/${operation}`, {
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

        toast.success(`Operation ${operation} completed successfully`);
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

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    Promise.all([fetchSecretsStatus(), fetchRuns()]).finally(() => {
      if (mounted) {
        setIsLoading(false);
      }
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
  };
}
