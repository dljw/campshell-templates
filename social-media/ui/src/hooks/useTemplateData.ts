import type { ServerMessage } from "@campshell/core";
import { useWebSocket } from "@campshell/ui-hooks";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type {
  Analytics,
  Business,
  Campaign,
  Idea,
  Pillar,
  PlatformAccount,
  Post,
  ValidationErrorDetail,
} from "../types.js";

export interface UseTemplateDataReturn {
  businesses: Business[];
  posts: Post[];
  pillars: Pillar[];
  campaigns: Campaign[];
  ideas: Idea[];
  platforms: PlatformAccount[];
  analytics: Analytics[];
  status: "connecting" | "connected" | "disconnected";
  isLoading: boolean;
  errorRecords: ValidationErrorDetail[];
  createBusiness: (item: Business) => boolean;
  updateBusiness: (item: Business) => boolean;
  deleteBusiness: (id: string) => boolean;
  createPost: (item: Post) => boolean;
  updatePost: (item: Post) => boolean;
  deletePost: (id: string) => boolean;
  updatePillars: (items: Pillar[]) => boolean;
  createCampaign: (item: Campaign) => boolean;
  updateCampaign: (item: Campaign) => boolean;
  deleteCampaign: (id: string) => boolean;
  createIdea: (item: Idea) => boolean;
  updateIdea: (item: Idea) => boolean;
  deleteIdea: (id: string) => boolean;
  createPlatform: (item: PlatformAccount) => boolean;
  updatePlatform: (item: PlatformAccount) => boolean;
  deletePlatform: (id: string) => boolean;
  createAnalytics: (item: Analytics) => boolean;
  updateAnalytics: (item: Analytics) => boolean;
  deleteAnalytics: (id: string) => boolean;
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

function upsert<T extends { id: string }>(prev: T[], item: T): T[] {
  const idx = prev.findIndex((x) => x.id === item.id);
  if (idx >= 0) {
    const next = [...prev];
    next[idx] = item;
    return next;
  }
  return [...prev, item];
}

export function useTemplateData(apiBase = ""): UseTemplateDataReturn {
  const { status, writeFile, deleteFile, onFileEvent } = useWebSocket({
    template: "social-media",
  });

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [platforms, setPlatforms] = useState<PlatformAccount[]>([]);
  const [analytics, setAnalytics] = useState<Analytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorRecords, setErrorRecords] = useState<ValidationErrorDetail[]>([]);

  useEffect(() => {
    if (status !== "connected") return;
    let cancelled = false;
    setIsLoading(true);

    Promise.all([
      fetch(`${apiBase}/api/social-media/data`)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
      fetch(`${apiBase}/api/social-media/errors`)
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => []),
    ]).then(([response, errors]: [{ data: Record<string, unknown> } | null, ValidationErrorDetail[]]) => {
      if (cancelled) return;
      if (response?.data) {
        const d = response.data;
        setBusinesses((d.businesses as Business[]) ?? []);
        setPosts((d.posts as Post[]) ?? []);
        setPillars((d.pillars as Pillar[]) ?? []);
        setCampaigns((d.campaigns as Campaign[]) ?? []);
        setIdeas((d.ideas as Idea[]) ?? []);
        setPlatforms((d.platforms as PlatformAccount[]) ?? []);
        setAnalytics((d.analytics as Analytics[]) ?? []);
      }
      setErrorRecords(errors);
      setIsLoading(false);
    });

    return () => { cancelled = true; };
  }, [status, apiBase]);

  useEffect(() => {
    const unsub = onFileEvent((event: ServerMessage) => {
      if (event.type === "error") return;

      if (event.type === "validation:error") {
        const summary = event.errors[0] ? humanizeError(event.errors[0]) : "Invalid data";
        toast.error(`Validation Error: ${event.file}`, { description: summary });
        setErrorRecords((prev) => {
          const filtered = prev.filter((er) => er.file !== event.file);
          return [...filtered, { template: event.template, file: event.file, errors: event.errors.map((e) => ({ keyword: e.keyword, message: e.message, instancePath: e.instancePath, params: e.params as Record<string, unknown> | undefined })) }];
        });
        return;
      }

      const entity = "entity" in event ? (event.entity as string) : "";

      if (event.type === "file:created" || event.type === "file:updated") {
        setErrorRecords((prev) => prev.filter((er) => er.file !== event.file));
        if (entity === "businesses") setBusinesses((prev) => upsert(prev, event.data as Business));
        else if (entity === "posts") setPosts((prev) => upsert(prev, event.data as Post));
        else if (entity === "pillars") setPillars((event.data as Pillar[]) ?? []);
        else if (entity === "campaigns") setCampaigns((prev) => upsert(prev, event.data as Campaign));
        else if (entity === "ideas") setIdeas((prev) => upsert(prev, event.data as Idea));
        else if (entity === "platforms") setPlatforms((prev) => upsert(prev, event.data as PlatformAccount));
        else if (entity === "analytics") setAnalytics((prev) => upsert(prev, event.data as Analytics));
      } else if (event.type === "file:deleted") {
        const id = event.file.replace(/\.json$/, "").split("/").pop() ?? "";
        if (entity === "businesses") setBusinesses((prev) => prev.filter((x) => x.id !== id));
        else if (entity === "posts") setPosts((prev) => prev.filter((x) => x.id !== id));
        else if (entity === "campaigns") setCampaigns((prev) => prev.filter((x) => x.id !== id));
        else if (entity === "ideas") setIdeas((prev) => prev.filter((x) => x.id !== id));
        else if (entity === "platforms") setPlatforms((prev) => prev.filter((x) => x.id !== id));
        else if (entity === "analytics") setAnalytics((prev) => prev.filter((x) => x.id !== id));
      }
    });
    return unsub;
  }, [onFileEvent]);

  // --- CRUD helpers ---

  const createBusiness = useCallback((item: Business): boolean => {
    if (!writeFile(`businesses/${item.id}.json`, item)) { toast.error("Failed to create business"); return false; }
    setBusinesses((prev) => [...prev, item]); toast.success("Business created"); return true;
  }, [writeFile]);

  const updateBusiness = useCallback((item: Business): boolean => {
    if (!writeFile(`businesses/${item.id}.json`, item)) { toast.error("Failed to update business"); return false; }
    setBusinesses((prev) => prev.map((x) => (x.id === item.id ? item : x))); return true;
  }, [writeFile]);

  const deleteBusiness = useCallback((id: string): boolean => {
    if (!deleteFile(`businesses/${id}.json`)) { toast.error("Failed to delete business"); return false; }
    setBusinesses((prev) => prev.filter((x) => x.id !== id)); toast.success("Business deleted"); return true;
  }, [deleteFile]);

  const createPost = useCallback((item: Post): boolean => {
    if (!writeFile(`posts/${item.id}.json`, item)) { toast.error("Failed to create post"); return false; }
    setPosts((prev) => [...prev, item]); toast.success("Post created"); return true;
  }, [writeFile]);

  const updatePost = useCallback((item: Post): boolean => {
    if (!writeFile(`posts/${item.id}.json`, item)) { toast.error("Failed to update post"); return false; }
    setPosts((prev) => prev.map((x) => (x.id === item.id ? item : x))); return true;
  }, [writeFile]);

  const deletePost = useCallback((id: string): boolean => {
    if (!deleteFile(`posts/${id}.json`)) { toast.error("Failed to delete post"); return false; }
    setPosts((prev) => prev.filter((x) => x.id !== id)); toast.success("Post deleted"); return true;
  }, [deleteFile]);

  const updatePillars = useCallback((items: Pillar[]): boolean => {
    if (!writeFile("pillars.json", items)) { toast.error("Failed to update pillars"); return false; }
    setPillars(items); return true;
  }, [writeFile]);

  const createCampaign = useCallback((item: Campaign): boolean => {
    if (!writeFile(`campaigns/${item.id}.json`, item)) { toast.error("Failed to create campaign"); return false; }
    setCampaigns((prev) => [...prev, item]); toast.success("Campaign created"); return true;
  }, [writeFile]);

  const updateCampaign = useCallback((item: Campaign): boolean => {
    if (!writeFile(`campaigns/${item.id}.json`, item)) { toast.error("Failed to update campaign"); return false; }
    setCampaigns((prev) => prev.map((x) => (x.id === item.id ? item : x))); return true;
  }, [writeFile]);

  const deleteCampaign = useCallback((id: string): boolean => {
    if (!deleteFile(`campaigns/${id}.json`)) { toast.error("Failed to delete campaign"); return false; }
    setCampaigns((prev) => prev.filter((x) => x.id !== id)); toast.success("Campaign deleted"); return true;
  }, [deleteFile]);

  const createIdea = useCallback((item: Idea): boolean => {
    if (!writeFile(`ideas/${item.id}.json`, item)) { toast.error("Failed to create idea"); return false; }
    setIdeas((prev) => [...prev, item]); toast.success("Idea captured"); return true;
  }, [writeFile]);

  const updateIdea = useCallback((item: Idea): boolean => {
    if (!writeFile(`ideas/${item.id}.json`, item)) { toast.error("Failed to update idea"); return false; }
    setIdeas((prev) => prev.map((x) => (x.id === item.id ? item : x))); return true;
  }, [writeFile]);

  const deleteIdea = useCallback((id: string): boolean => {
    if (!deleteFile(`ideas/${id}.json`)) { toast.error("Failed to delete idea"); return false; }
    setIdeas((prev) => prev.filter((x) => x.id !== id)); toast.success("Idea deleted"); return true;
  }, [deleteFile]);

  const createPlatform = useCallback((item: PlatformAccount): boolean => {
    if (!writeFile(`platforms/${item.id}.json`, item)) { toast.error("Failed to create platform"); return false; }
    setPlatforms((prev) => [...prev, item]); toast.success("Platform added"); return true;
  }, [writeFile]);

  const updatePlatform = useCallback((item: PlatformAccount): boolean => {
    if (!writeFile(`platforms/${item.id}.json`, item)) { toast.error("Failed to update platform"); return false; }
    setPlatforms((prev) => prev.map((x) => (x.id === item.id ? item : x))); return true;
  }, [writeFile]);

  const deletePlatform = useCallback((id: string): boolean => {
    if (!deleteFile(`platforms/${id}.json`)) { toast.error("Failed to delete platform"); return false; }
    setPlatforms((prev) => prev.filter((x) => x.id !== id)); toast.success("Platform removed"); return true;
  }, [deleteFile]);

  const createAnalytics = useCallback((item: Analytics): boolean => {
    if (!writeFile(`analytics/${item.id}.json`, item)) { toast.error("Failed to create analytics"); return false; }
    setAnalytics((prev) => [...prev, item]); toast.success("Analytics recorded"); return true;
  }, [writeFile]);

  const updateAnalytics = useCallback((item: Analytics): boolean => {
    if (!writeFile(`analytics/${item.id}.json`, item)) { toast.error("Failed to update analytics"); return false; }
    setAnalytics((prev) => prev.map((x) => (x.id === item.id ? item : x))); return true;
  }, [writeFile]);

  const deleteAnalytics = useCallback((id: string): boolean => {
    if (!deleteFile(`analytics/${id}.json`)) { toast.error("Failed to delete analytics"); return false; }
    setAnalytics((prev) => prev.filter((x) => x.id !== id)); toast.success("Analytics deleted"); return true;
  }, [deleteFile]);

  return {
    businesses, posts, pillars, campaigns, ideas, platforms, analytics,
    status, isLoading, errorRecords,
    createBusiness, updateBusiness, deleteBusiness,
    createPost, updatePost, deletePost,
    updatePillars,
    createCampaign, updateCampaign, deleteCampaign,
    createIdea, updateIdea, deleteIdea,
    createPlatform, updatePlatform, deletePlatform,
    createAnalytics, updateAnalytics, deleteAnalytics,
  };
}
