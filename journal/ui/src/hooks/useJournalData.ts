import type { ServerMessage } from "@campshell/core";
import { useWebSocket } from "@campshell/ui-hooks";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type {
  JournalEntry,
  JournalPrompt,
  Tag,
  ValidationErrorDetail,
} from "../types.js";

export interface UseJournalDataReturn {
  entries: JournalEntry[];
  tags: Tag[];
  prompts: JournalPrompt[];
  status: "connecting" | "connected" | "disconnected";
  isLoading: boolean;
  errorRecords: ValidationErrorDetail[];
  createEntry: (entry: JournalEntry) => boolean;
  updateEntry: (entry: JournalEntry) => boolean;
  deleteEntry: (entryId: string) => boolean;
  updateTags: (tags: Tag[]) => void;
  updatePrompts: (prompts: JournalPrompt[]) => void;
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
    case "enum":
      return `${label} must be one of: ${(error.params?.allowedValues as string[])?.join(", ")}`;
    case "pattern":
      return `${label} has an invalid format`;
    default:
      return error.message ?? `${label}: ${error.keyword}`;
  }
}

export function useJournalData(apiBase = ""): UseJournalDataReturn {
  const { status, writeFile, deleteFile, onFileEvent } = useWebSocket({
    template: "journal",
  });

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [prompts, setPrompts] = useState<JournalPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorRecords, setErrorRecords] = useState<ValidationErrorDetail[]>([]);

  // Fetch initial data when connected
  useEffect(() => {
    if (status !== "connected") return;
    let cancelled = false;
    setIsLoading(true);

    Promise.all([
      fetch(`${apiBase}/api/journal/data`)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
      fetch(`${apiBase}/api/journal/errors`)
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => []),
    ]).then(([response, errors]) => {
      if (cancelled) return;
      if (response?.data) {
        setEntries(response.data.entries ?? []);
        setTags(response.data.tags?.tags ?? []);
        setPrompts(response.data.prompts?.prompts ?? []);
      }
      setErrorRecords(errors);
      setIsLoading(false);
    });

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
        toast.error(`Validation Error`, { description: summary });
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

      const isEntry = "entity" in event && event.entity === "entries";
      const isTag = "entity" in event && event.entity === "tags";
      const isPrompt = "entity" in event && event.entity === "prompts";

      if (event.type === "file:created" || event.type === "file:updated") {
        setErrorRecords((prev) => prev.filter((er) => er.file !== event.file));

        if (isEntry) {
          const entryData = event.data as JournalEntry;
          setEntries((prev) => {
            const idx = prev.findIndex((e) => e.id === entryData.id);
            if (idx >= 0) {
              const next = [...prev];
              next[idx] = entryData;
              return next;
            }
            return [...prev, entryData];
          });
        } else if (isTag) {
          const tagData = event.data as { tags: Tag[] };
          setTags(tagData.tags ?? []);
        } else if (isPrompt) {
          const promptData = event.data as { prompts: JournalPrompt[] };
          setPrompts(promptData.prompts ?? []);
        }
      } else if (event.type === "file:deleted") {
        if (isEntry) {
          const entryId = event.file.replace("entries/", "").replace(".json", "");
          setEntries((prev) => prev.filter((e) => e.id !== entryId));
        }
      }
    });
    return unsub;
  }, [onFileEvent]);

  const createEntry = useCallback(
    (entry: JournalEntry): boolean => {
      const file = `entries/${entry.id}.json`;
      if (!writeFile(file, entry)) {
        toast.error("Failed to create entry");
        return false;
      }
      setEntries((prev) => [...prev, entry]);
      toast.success("Entry saved ✨");
      return true;
    },
    [writeFile],
  );

  const updateEntry = useCallback(
    (entry: JournalEntry): boolean => {
      const file = `entries/${entry.id}.json`;
      if (!writeFile(file, entry)) {
        toast.error("Failed to update entry");
        return false;
      }
      setEntries((prev) => prev.map((e) => (e.id === entry.id ? entry : e)));
      toast.success("Entry updated");
      return true;
    },
    [writeFile],
  );

  const deleteEntry = useCallback(
    (entryId: string): boolean => {
      const file = `entries/${entryId}.json`;
      if (!deleteFile(file)) {
        toast.error("Failed to delete entry");
        return false;
      }
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
      toast.success("Entry deleted");
      return true;
    },
    [deleteFile],
  );

  const updateTags = useCallback(
    (newTags: Tag[]) => {
      if (!writeFile("tags.json", { tags: newTags })) return;
      setTags(newTags);
    },
    [writeFile],
  );

  const updatePrompts = useCallback(
    (newPrompts: JournalPrompt[]) => {
      if (!writeFile("prompts.json", { prompts: newPrompts })) return;
      setPrompts(newPrompts);
    },
    [writeFile],
  );

  return {
    entries,
    tags,
    prompts,
    status,
    isLoading,
    errorRecords,
    createEntry,
    updateEntry,
    deleteEntry,
    updateTags,
    updatePrompts,
  };
}
