import type { ServerMessage } from "@campshell/core";
import { useWebSocket } from "@campshell/ui-hooks";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Note, Tag, TagsCollection, ValidationErrorDetail } from "../types.js";

export interface UseBrainVaultDataReturn {
  notes: Note[];
  tags: Tag[];
  status: "connecting" | "connected" | "disconnected";
  isLoading: boolean;
  errorRecords: ValidationErrorDetail[];
  createNote: (note: Note) => boolean;
  updateNote: (note: Note) => boolean;
  deleteNote: (noteId: string) => boolean;
  updateTags: (tags: Tag[]) => void;
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

export function useBrainVaultData(apiBase = ""): UseBrainVaultDataReturn {
  const { status, writeFile, deleteFile, onFileEvent } =
    useWebSocket({ template: "brain-vault" });

  const [notes, setNotes] = useState<Note[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorRecords, setErrorRecords] = useState<ValidationErrorDetail[]>([]);

  // Fetch initial data when connected
  useEffect(() => {
    if (status !== "connected") return;
    let cancelled = false;
    setIsLoading(true);

    Promise.all([
      fetch(`${apiBase}/api/brain-vault/data`)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
      fetch(`${apiBase}/api/brain-vault/errors`)
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => []),
    ]).then(
      ([response, errors]: [
        { data: { notes?: Note[]; tags?: TagsCollection }; meta?: unknown } | null,
        ValidationErrorDetail[],
      ]) => {
        if (cancelled) return;
        if (response?.data) {
          setNotes(response.data.notes ?? []);
          setTags(response.data.tags?.tags ?? []);
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
        toast.error(`Validation Error: ${event.file}`, { description: summary });
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

      const isNote = "entity" in event && event.entity === "notes";
      const isTag = "entity" in event && event.entity === "tags";

      if (event.type === "file:created" || event.type === "file:updated") {
        setErrorRecords((prev) => prev.filter((er) => er.file !== event.file));

        if (isNote) {
          const noteData = event.data as Note;
          setNotes((prev) => {
            const idx = prev.findIndex((n) => n.id === noteData.id);
            if (idx >= 0) {
              const next = [...prev];
              next[idx] = noteData;
              return next;
            }
            return [...prev, noteData];
          });
        } else if (isTag) {
          const tagData = event.data as TagsCollection;
          setTags(tagData.tags ?? []);
        }
      } else if (event.type === "file:deleted") {
        if (isNote) {
          const noteId = event.file.replace("notes/", "").replace(".json", "");
          setNotes((prev) => prev.filter((n) => n.id !== noteId));
        }
      }
    });

    return unsub;
  }, [onFileEvent]);

  const createNote = useCallback(
    (note: Note): boolean => {
      const file = `notes/${note.id}.json`;
      if (!writeFile(file, note)) {
        toast.error("Failed to create note");
        return false;
      }
      setNotes((prev) => [...prev, note]);
      toast.success("Note created");
      return true;
    },
    [writeFile],
  );

  const updateNote = useCallback(
    (note: Note): boolean => {
      const file = `notes/${note.id}.json`;
      if (!writeFile(file, note)) {
        toast.error("Failed to update note");
        return false;
      }
      setNotes((prev) => prev.map((n) => (n.id === note.id ? note : n)));
      return true;
    },
    [writeFile],
  );

  const deleteNoteFn = useCallback(
    (noteId: string): boolean => {
      const file = `notes/${noteId}.json`;
      if (!deleteFile(file)) {
        toast.error("Failed to delete note");
        return false;
      }
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      toast.success("Note deleted");
      return true;
    },
    [deleteFile],
  );

  const updateTagsFn = useCallback(
    (newTags: Tag[]) => {
      if (!writeFile("tags.json", { tags: newTags })) return;
      setTags(newTags);
    },
    [writeFile],
  );

  return {
    notes,
    tags,
    status,
    isLoading,
    errorRecords,
    createNote,
    updateNote,
    deleteNote: deleteNoteFn,
    updateTags: updateTagsFn,
  };
}
