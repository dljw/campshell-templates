import type { ServerMessage } from "@campshell/core";
import { useWebSocket } from "@campshell/ui-hooks";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Activity, Contact, Deal, ValidationErrorDetail } from "../types.js";

export interface UseCrmDataReturn {
  contacts: Contact[];
  deals: Deal[];
  activities: Activity[];
  status: "connecting" | "connected" | "disconnected";
  isLoading: boolean;
  errorRecords: ValidationErrorDetail[];
  createContact: (contact: Contact) => boolean;
  updateContact: (contact: Contact) => boolean;
  deleteContact: (id: string) => boolean;
  createDeal: (deal: Deal) => boolean;
  updateDeal: (deal: Deal) => boolean;
  deleteDeal: (id: string) => boolean;
  createActivity: (activity: Activity) => boolean;
  updateActivity: (activity: Activity) => boolean;
  deleteActivity: (id: string) => boolean;
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
      return `${label} must be at least ${error.params?.limit ?? 0}`;
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

export function useCrmData(apiBase = ""): UseCrmDataReturn {
  const { status, writeFile, deleteFile, onFileEvent } = useWebSocket({
    template: "crm",
  });

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorRecords, setErrorRecords] = useState<ValidationErrorDetail[]>([]);

  useEffect(() => {
    if (status !== "connected") return;
    let cancelled = false;
    setIsLoading(true);

    Promise.all([
      fetch(`${apiBase}/api/crm/data`)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
      fetch(`${apiBase}/api/crm/errors`)
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => []),
    ]).then(([response, errors]: [{ data: Record<string, unknown> } | null, ValidationErrorDetail[]]) => {
      if (cancelled) return;
      if (response?.data) {
        const d = response.data;
        setContacts((d.contacts as Contact[]) ?? []);
        setDeals((d.deals as Deal[]) ?? []);
        setActivities((d.activities as Activity[]) ?? []);
      }
      setErrorRecords(errors);
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [status, apiBase]);

  useEffect(() => {
    const unsub = onFileEvent((event: ServerMessage) => {
      if (event.type === "error") return;

      if (event.type === "validation:error") {
        const summary = event.errors[0] ? humanizeError(event.errors[0]) : "Invalid data";
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

      const entity = "entity" in event ? (event.entity as string) : "";

      if (event.type === "file:created" || event.type === "file:updated") {
        setErrorRecords((prev) => prev.filter((er) => er.file !== event.file));

        if (entity === "contacts") {
          const item = event.data as Contact;
          setContacts((prev) => {
            const idx = prev.findIndex((c) => c.id === item.id);
            if (idx >= 0) {
              const next = [...prev];
              next[idx] = item;
              return next;
            }
            return [...prev, item];
          });
        } else if (entity === "deals") {
          const item = event.data as Deal;
          setDeals((prev) => {
            const idx = prev.findIndex((d) => d.id === item.id);
            if (idx >= 0) {
              const next = [...prev];
              next[idx] = item;
              return next;
            }
            return [...prev, item];
          });
        } else if (entity === "activities") {
          const item = event.data as Activity;
          setActivities((prev) => {
            const idx = prev.findIndex((a) => a.id === item.id);
            if (idx >= 0) {
              const next = [...prev];
              next[idx] = item;
              return next;
            }
            return [...prev, item];
          });
        }
      } else if (event.type === "file:deleted") {
        if (entity === "contacts") {
          const id = event.file.replace("contacts/", "").replace(".json", "");
          setContacts((prev) => prev.filter((c) => c.id !== id));
        } else if (entity === "deals") {
          const id = event.file.replace("deals/", "").replace(".json", "");
          setDeals((prev) => prev.filter((d) => d.id !== id));
        } else if (entity === "activities") {
          const id = event.file.replace("activities/", "").replace(".json", "");
          setActivities((prev) => prev.filter((a) => a.id !== id));
        }
      }
    });

    return unsub;
  }, [onFileEvent]);

  // --- Contact CRUD ---

  const createContact = useCallback(
    (contact: Contact): boolean => {
      if (!writeFile(`contacts/${contact.id}.json`, contact)) {
        toast.error("Failed to create contact");
        return false;
      }
      setContacts((prev) => [...prev, contact]);
      toast.success("Contact created");
      return true;
    },
    [writeFile],
  );

  const updateContact = useCallback(
    (contact: Contact): boolean => {
      if (!writeFile(`contacts/${contact.id}.json`, contact)) {
        toast.error("Failed to update contact");
        return false;
      }
      setContacts((prev) => prev.map((c) => (c.id === contact.id ? contact : c)));
      return true;
    },
    [writeFile],
  );

  const deleteContact = useCallback(
    (id: string): boolean => {
      if (!deleteFile(`contacts/${id}.json`)) {
        toast.error("Failed to delete contact");
        return false;
      }
      setContacts((prev) => prev.filter((c) => c.id !== id));
      toast.success("Contact deleted");
      return true;
    },
    [deleteFile],
  );

  // --- Deal CRUD ---

  const createDeal = useCallback(
    (deal: Deal): boolean => {
      if (!writeFile(`deals/${deal.id}.json`, deal)) {
        toast.error("Failed to create deal");
        return false;
      }
      setDeals((prev) => [...prev, deal]);
      toast.success("Deal created");
      return true;
    },
    [writeFile],
  );

  const updateDeal = useCallback(
    (deal: Deal): boolean => {
      if (!writeFile(`deals/${deal.id}.json`, deal)) {
        toast.error("Failed to update deal");
        return false;
      }
      setDeals((prev) => prev.map((d) => (d.id === deal.id ? deal : d)));
      return true;
    },
    [writeFile],
  );

  const deleteDeal = useCallback(
    (id: string): boolean => {
      if (!deleteFile(`deals/${id}.json`)) {
        toast.error("Failed to delete deal");
        return false;
      }
      setDeals((prev) => prev.filter((d) => d.id !== id));
      toast.success("Deal deleted");
      return true;
    },
    [deleteFile],
  );

  // --- Activity CRUD ---

  const createActivity = useCallback(
    (activity: Activity): boolean => {
      if (!writeFile(`activities/${activity.id}.json`, activity)) {
        toast.error("Failed to create activity");
        return false;
      }
      setActivities((prev) => [...prev, activity]);
      toast.success("Activity logged");
      return true;
    },
    [writeFile],
  );

  const updateActivity = useCallback(
    (activity: Activity): boolean => {
      if (!writeFile(`activities/${activity.id}.json`, activity)) {
        toast.error("Failed to update activity");
        return false;
      }
      setActivities((prev) => prev.map((a) => (a.id === activity.id ? activity : a)));
      return true;
    },
    [writeFile],
  );

  const deleteActivity = useCallback(
    (id: string): boolean => {
      if (!deleteFile(`activities/${id}.json`)) {
        toast.error("Failed to delete activity");
        return false;
      }
      setActivities((prev) => prev.filter((a) => a.id !== id));
      toast.success("Activity deleted");
      return true;
    },
    [deleteFile],
  );

  return {
    contacts,
    deals,
    activities,
    status,
    isLoading,
    errorRecords,
    createContact,
    updateContact,
    deleteContact,
    createDeal,
    updateDeal,
    deleteDeal,
    createActivity,
    updateActivity,
    deleteActivity,
  };
}
