import type { ServerMessage } from "@campshell/core";
import { useWebSocket } from "@campshell/ui-hooks";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type {
  Backlink,
  Competitor,
  CompetitorsCollection,
  Issue,
  Keyword,
  Page,
  ValidationErrorDetail,
} from "../types.js";

export interface UseSeoTrackerDataReturn {
  keywords: Keyword[];
  pages: Page[];
  backlinks: Backlink[];
  competitors: Competitor[];
  issues: Issue[];
  status: "connecting" | "connected" | "disconnected";
  isLoading: boolean;
  errorRecords: ValidationErrorDetail[];

  createKeyword: (k: Keyword) => boolean;
  updateKeyword: (k: Keyword) => boolean;
  deleteKeyword: (id: string) => boolean;

  createPage: (p: Page) => boolean;
  updatePage: (p: Page) => boolean;
  deletePage: (id: string) => boolean;

  createBacklink: (b: Backlink) => boolean;
  updateBacklink: (b: Backlink) => boolean;
  deleteBacklink: (id: string) => boolean;

  updateCompetitors: (competitors: Competitor[]) => boolean;

  createIssue: (i: Issue) => boolean;
  updateIssue: (i: Issue) => boolean;
  deleteIssue: (id: string) => boolean;
}

function humanizeError(error: {
  keyword: string;
  instancePath: string;
  message?: string;
  params?: Record<string, unknown>;
}): string {
  const field = error.instancePath.split("/").filter(Boolean).pop() || "Value";
  const label = field.charAt(0).toUpperCase() + field.slice(1);

  switch (error.keyword) {
    case "required":
      return `${error.params?.missingProperty ?? label} is required`;
    case "maxLength":
      return `${label} is too long (max ${error.params?.limit} characters)`;
    case "minLength":
      return `${label} cannot be empty`;
    case "minimum":
      return `${label} must be at least ${error.params?.limit}`;
    case "maximum":
      return `${label} must be at most ${error.params?.limit}`;
    case "enum":
      return `${label} must be one of: ${(error.params?.allowedValues as string[])?.join(", ")}`;
    case "format":
      return `${label} must be a valid ${error.params?.format}`;
    case "additionalProperties":
      return `Unknown field: ${error.params?.additionalProperty}`;
    default:
      return error.message ?? `${label}: ${error.keyword}`;
  }
}

export function useSeoTrackerData(apiBase = ""): UseSeoTrackerDataReturn {
  const { status, writeFile, deleteFile, onFileEvent } = useWebSocket({
    template: "seo-tracker",
  });

  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [backlinks, setBacklinks] = useState<Backlink[]>([]);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorRecords, setErrorRecords] = useState<ValidationErrorDetail[]>([]);

  // Fetch initial data when connected
  useEffect(() => {
    if (status !== "connected") return;
    let cancelled = false;
    setIsLoading(true);

    Promise.all([
      fetch(`${apiBase}/api/seo-tracker/data`)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
      fetch(`${apiBase}/api/seo-tracker/errors`)
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => []),
    ]).then(
      ([response, errors]: [
        {
          data: {
            keywords?: Keyword[];
            pages?: Page[];
            backlinks?: Backlink[];
            competitors?: CompetitorsCollection;
            issues?: Issue[];
          };
        } | null,
        ValidationErrorDetail[],
      ]) => {
        if (cancelled) return;
        if (response?.data) {
          setKeywords(response.data.keywords ?? []);
          setPages(response.data.pages ?? []);
          setBacklinks(response.data.backlinks ?? []);
          setCompetitors(response.data.competitors?.competitors ?? []);
          setIssues(response.data.issues ?? []);
        }
        setErrorRecords(errors);
        setIsLoading(false);
      },
    );

    return () => {
      cancelled = true;
    };
  }, [status, apiBase]);

  // Handle real-time WebSocket events
  useEffect(() => {
    const unsub = onFileEvent((event: ServerMessage) => {
      if (event.type === "error") return;

      if (event.type === "validation:error") {
        const summary = event.errors[0]
          ? humanizeError(event.errors[0])
          : "Invalid data";
        toast.error(`Validation Error: ${event.file}`, {
          description: summary,
        });
        setErrorRecords((prev) => {
          const filtered = prev.filter((er) => er.file !== event.file);
          return [
            ...filtered,
            {
              template: event.template,
              file: event.file,
              errors: event.errors.map((e) => ({
                keyword: e.keyword,
                message: e.message,
                instancePath: e.instancePath,
                params: e.params as Record<string, unknown> | undefined,
              })),
            },
          ];
        });
        return;
      }

      const entity = "entity" in event ? event.entity : undefined;

      if (event.type === "file:created" || event.type === "file:updated") {
        setErrorRecords((prev) => prev.filter((er) => er.file !== event.file));

        if (entity === "keywords") {
          const data = event.data as Keyword;
          setKeywords((prev) => {
            const idx = prev.findIndex((k) => k.id === data.id);
            if (idx >= 0) {
              const next = [...prev];
              next[idx] = data;
              return next;
            }
            return [...prev, data];
          });
        } else if (entity === "pages") {
          const data = event.data as Page;
          setPages((prev) => {
            const idx = prev.findIndex((p) => p.id === data.id);
            if (idx >= 0) {
              const next = [...prev];
              next[idx] = data;
              return next;
            }
            return [...prev, data];
          });
        } else if (entity === "backlinks") {
          const data = event.data as Backlink;
          setBacklinks((prev) => {
            const idx = prev.findIndex((b) => b.id === data.id);
            if (idx >= 0) {
              const next = [...prev];
              next[idx] = data;
              return next;
            }
            return [...prev, data];
          });
        } else if (entity === "competitors") {
          const data = event.data as CompetitorsCollection;
          setCompetitors(data.competitors ?? []);
        } else if (entity === "issues") {
          const data = event.data as Issue;
          setIssues((prev) => {
            const idx = prev.findIndex((i) => i.id === data.id);
            if (idx >= 0) {
              const next = [...prev];
              next[idx] = data;
              return next;
            }
            return [...prev, data];
          });
        }
      } else if (event.type === "file:deleted") {
        if (entity === "keywords") {
          const id = event.file.replace("keywords/", "").replace(".json", "");
          setKeywords((prev) => prev.filter((k) => k.id !== id));
        } else if (entity === "pages") {
          const id = event.file.replace("pages/", "").replace(".json", "");
          setPages((prev) => prev.filter((p) => p.id !== id));
        } else if (entity === "backlinks") {
          const id = event.file.replace("backlinks/", "").replace(".json", "");
          setBacklinks((prev) => prev.filter((b) => b.id !== id));
        } else if (entity === "issues") {
          const id = event.file.replace("issues/", "").replace(".json", "");
          setIssues((prev) => prev.filter((i) => i.id !== id));
        }
      }
    });

    return unsub;
  }, [onFileEvent]);

  // Keywords CRUD
  const createKeyword = useCallback(
    (k: Keyword): boolean => {
      if (!writeFile(`keywords/${k.id}.json`, k)) {
        toast.error("Failed to create keyword");
        return false;
      }
      setKeywords((prev) => [...prev, k]);
      toast.success("Keyword created");
      return true;
    },
    [writeFile],
  );

  const updateKeyword = useCallback(
    (k: Keyword): boolean => {
      if (!writeFile(`keywords/${k.id}.json`, k)) {
        toast.error("Failed to update keyword");
        return false;
      }
      setKeywords((prev) => prev.map((x) => (x.id === k.id ? k : x)));
      return true;
    },
    [writeFile],
  );

  const deleteKeyword = useCallback(
    (id: string): boolean => {
      if (!deleteFile(`keywords/${id}.json`)) {
        toast.error("Failed to delete keyword");
        return false;
      }
      setKeywords((prev) => prev.filter((k) => k.id !== id));
      toast.success("Keyword deleted");
      return true;
    },
    [deleteFile],
  );

  // Pages CRUD
  const createPage = useCallback(
    (p: Page): boolean => {
      if (!writeFile(`pages/${p.id}.json`, p)) {
        toast.error("Failed to create page");
        return false;
      }
      setPages((prev) => [...prev, p]);
      toast.success("Page created");
      return true;
    },
    [writeFile],
  );

  const updatePage = useCallback(
    (p: Page): boolean => {
      if (!writeFile(`pages/${p.id}.json`, p)) {
        toast.error("Failed to update page");
        return false;
      }
      setPages((prev) => prev.map((x) => (x.id === p.id ? p : x)));
      return true;
    },
    [writeFile],
  );

  const deletePage = useCallback(
    (id: string): boolean => {
      if (!deleteFile(`pages/${id}.json`)) {
        toast.error("Failed to delete page");
        return false;
      }
      setPages((prev) => prev.filter((p) => p.id !== id));
      toast.success("Page deleted");
      return true;
    },
    [deleteFile],
  );

  // Backlinks CRUD
  const createBacklink = useCallback(
    (b: Backlink): boolean => {
      if (!writeFile(`backlinks/${b.id}.json`, b)) {
        toast.error("Failed to create backlink");
        return false;
      }
      setBacklinks((prev) => [...prev, b]);
      toast.success("Backlink created");
      return true;
    },
    [writeFile],
  );

  const updateBacklink = useCallback(
    (b: Backlink): boolean => {
      if (!writeFile(`backlinks/${b.id}.json`, b)) {
        toast.error("Failed to update backlink");
        return false;
      }
      setBacklinks((prev) => prev.map((x) => (x.id === b.id ? b : x)));
      return true;
    },
    [writeFile],
  );

  const deleteBacklink = useCallback(
    (id: string): boolean => {
      if (!deleteFile(`backlinks/${id}.json`)) {
        toast.error("Failed to delete backlink");
        return false;
      }
      setBacklinks((prev) => prev.filter((b) => b.id !== id));
      toast.success("Backlink deleted");
      return true;
    },
    [deleteFile],
  );

  // Competitors (collection pattern)
  const updateCompetitorsFn = useCallback(
    (newCompetitors: Competitor[]): boolean => {
      if (!writeFile("competitors.json", { competitors: newCompetitors })) {
        toast.error("Failed to update competitors");
        return false;
      }
      setCompetitors(newCompetitors);
      return true;
    },
    [writeFile],
  );

  // Issues CRUD
  const createIssue = useCallback(
    (i: Issue): boolean => {
      if (!writeFile(`issues/${i.id}.json`, i)) {
        toast.error("Failed to create issue");
        return false;
      }
      setIssues((prev) => [...prev, i]);
      toast.success("Issue created");
      return true;
    },
    [writeFile],
  );

  const updateIssue = useCallback(
    (i: Issue): boolean => {
      if (!writeFile(`issues/${i.id}.json`, i)) {
        toast.error("Failed to update issue");
        return false;
      }
      setIssues((prev) => prev.map((x) => (x.id === i.id ? i : x)));
      return true;
    },
    [writeFile],
  );

  const deleteIssue = useCallback(
    (id: string): boolean => {
      if (!deleteFile(`issues/${id}.json`)) {
        toast.error("Failed to delete issue");
        return false;
      }
      setIssues((prev) => prev.filter((i) => i.id !== id));
      toast.success("Issue deleted");
      return true;
    },
    [deleteFile],
  );

  return {
    keywords,
    pages,
    backlinks,
    competitors,
    issues,
    status,
    isLoading,
    errorRecords,
    createKeyword,
    updateKeyword,
    deleteKeyword,
    createPage,
    updatePage,
    deletePage,
    createBacklink,
    updateBacklink,
    deleteBacklink,
    updateCompetitors: updateCompetitorsFn,
    createIssue,
    updateIssue,
    deleteIssue,
  };
}
