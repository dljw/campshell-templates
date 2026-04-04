import type { ServerMessage } from "@campshell/core";
import { useWebSocket } from "@campshell/ui-hooks";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type {
	Action,
	Article,
	Competitor,
	CompetitorsCollection,
	Cycle,
	Hub,
	HubsCollection,
	Keyword,
	ValidationErrorDetail,
} from "../types.js";

export interface UseContentStrategyDataReturn {
	articles: Article[];
	keywords: Keyword[];
	hubs: Hub[];
	cycles: Cycle[];
	actions: Action[];
	competitors: Competitor[];
	status: "connecting" | "connected" | "disconnected";
	isLoading: boolean;
	errorRecords: ValidationErrorDetail[];
	createArticle: (article: Article) => boolean;
	updateArticle: (article: Article) => boolean;
	deleteArticle: (id: string) => boolean;
	createKeyword: (keyword: Keyword) => boolean;
	updateKeyword: (keyword: Keyword) => boolean;
	deleteKeyword: (id: string) => boolean;
	updateHubs: (hubs: Hub[]) => void;
	createCycle: (cycle: Cycle) => boolean;
	updateCycle: (cycle: Cycle) => boolean;
	createAction: (action: Action) => boolean;
	updateAction: (action: Action) => boolean;
	deleteAction: (id: string) => boolean;
	updateCompetitors: (competitors: Competitor[]) => void;
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
		case "format":
			return `${label} must be a valid ${error.params?.format}`;
		case "additionalProperties":
			return `Unknown field: ${error.params?.additionalProperty}`;
		default:
			return error.message ?? `${label}: ${error.keyword}`;
	}
}

export function useContentStrategyData(apiBase = ""): UseContentStrategyDataReturn {
	const { status, writeFile, deleteFile, onFileEvent } = useWebSocket({
		template: "content-strategy",
	});

	const [articles, setArticles] = useState<Article[]>([]);
	const [keywords, setKeywords] = useState<Keyword[]>([]);
	const [hubs, setHubs] = useState<Hub[]>([]);
	const [cycles, setCycles] = useState<Cycle[]>([]);
	const [actions, setActions] = useState<Action[]>([]);
	const [competitors, setCompetitors] = useState<Competitor[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [errorRecords, setErrorRecords] = useState<ValidationErrorDetail[]>([]);

	// Fetch initial data when connected
	useEffect(() => {
		if (status !== "connected") return;
		let cancelled = false;
		setIsLoading(true);

		Promise.all([
			fetch(`${apiBase}/api/content-strategy/data`)
				.then((r) => (r.ok ? r.json() : null))
				.catch(() => null),
			fetch(`${apiBase}/api/content-strategy/errors`)
				.then((r) => (r.ok ? r.json() : []))
				.catch(() => []),
		]).then(
			([response, errors]: [
				{ data: Record<string, unknown> } | null,
				ValidationErrorDetail[],
			]) => {
				if (cancelled) return;
				if (response?.data) {
					const d = response.data;
					setArticles((d.articles as Article[]) ?? []);
					setKeywords((d.keywords as Keyword[]) ?? []);
					setHubs(
						((d.hubs as HubsCollection)?.hubs ?? (d.hubs as Hub[])) ?? [],
					);
					setCycles((d.cycles as Cycle[]) ?? []);
					setActions((d.actions as Action[]) ?? []);
					setCompetitors(
						((d.competitors as CompetitorsCollection)?.competitors ??
							(d.competitors as Competitor[])) ?? [],
					);
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

				if (entity === "articles") {
					const item = event.data as Article;
					setArticles((prev) => {
						const idx = prev.findIndex((a) => a.id === item.id);
						if (idx >= 0) { const next = [...prev]; next[idx] = item; return next; }
						return [...prev, item];
					});
				} else if (entity === "keywords") {
					const item = event.data as Keyword;
					setKeywords((prev) => {
						const idx = prev.findIndex((k) => k.id === item.id);
						if (idx >= 0) { const next = [...prev]; next[idx] = item; return next; }
						return [...prev, item];
					});
				} else if (entity === "hubs") {
					const data = event.data as HubsCollection;
					setHubs(data.hubs ?? []);
				} else if (entity === "cycles") {
					const item = event.data as Cycle;
					setCycles((prev) => {
						const idx = prev.findIndex((c) => c.id === item.id);
						if (idx >= 0) { const next = [...prev]; next[idx] = item; return next; }
						return [...prev, item];
					});
				} else if (entity === "actions") {
					const item = event.data as Action;
					setActions((prev) => {
						const idx = prev.findIndex((a) => a.id === item.id);
						if (idx >= 0) { const next = [...prev]; next[idx] = item; return next; }
						return [...prev, item];
					});
				} else if (entity === "competitors") {
					const data = event.data as CompetitorsCollection;
					setCompetitors(data.competitors ?? []);
				}
			} else if (event.type === "file:deleted") {
				const fileId = event.file.split("/").pop()?.replace(".json", "") ?? "";
				if (entity === "articles") {
					setArticles((prev) => prev.filter((a) => a.id !== fileId));
				} else if (entity === "keywords") {
					setKeywords((prev) => prev.filter((k) => k.id !== fileId));
				} else if (entity === "cycles") {
					setCycles((prev) => prev.filter((c) => c.id !== fileId));
				} else if (entity === "actions") {
					setActions((prev) => prev.filter((a) => a.id !== fileId));
				}
			}
		});

		return unsub;
	}, [onFileEvent]);

	// --- CRUD helpers ---

	const createArticle = useCallback((article: Article): boolean => {
		if (!writeFile(`articles/${article.id}.json`, article)) { toast.error("Failed to create article"); return false; }
		setArticles((prev) => [...prev, article]);
		toast.success("Article created");
		return true;
	}, [writeFile]);

	const updateArticle = useCallback((article: Article): boolean => {
		if (!writeFile(`articles/${article.id}.json`, article)) { toast.error("Failed to update article"); return false; }
		setArticles((prev) => prev.map((a) => (a.id === article.id ? article : a)));
		return true;
	}, [writeFile]);

	const deleteArticle = useCallback((id: string): boolean => {
		if (!deleteFile(`articles/${id}.json`)) { toast.error("Failed to delete article"); return false; }
		setArticles((prev) => prev.filter((a) => a.id !== id));
		toast.success("Article deleted");
		return true;
	}, [deleteFile]);

	const createKeyword = useCallback((keyword: Keyword): boolean => {
		if (!writeFile(`keywords/${keyword.id}.json`, keyword)) { toast.error("Failed to create keyword"); return false; }
		setKeywords((prev) => [...prev, keyword]);
		toast.success("Keyword created");
		return true;
	}, [writeFile]);

	const updateKeyword = useCallback((keyword: Keyword): boolean => {
		if (!writeFile(`keywords/${keyword.id}.json`, keyword)) { toast.error("Failed to update keyword"); return false; }
		setKeywords((prev) => prev.map((k) => (k.id === keyword.id ? keyword : k)));
		return true;
	}, [writeFile]);

	const deleteKeyword = useCallback((id: string): boolean => {
		if (!deleteFile(`keywords/${id}.json`)) { toast.error("Failed to delete keyword"); return false; }
		setKeywords((prev) => prev.filter((k) => k.id !== id));
		toast.success("Keyword deleted");
		return true;
	}, [deleteFile]);

	const updateHubs = useCallback((newHubs: Hub[]): void => {
		if (!writeFile("hubs.json", { hubs: newHubs })) return;
		setHubs(newHubs);
	}, [writeFile]);

	const createCycle = useCallback((cycle: Cycle): boolean => {
		if (!writeFile(`cycles/${cycle.id}.json`, cycle)) { toast.error("Failed to create cycle"); return false; }
		setCycles((prev) => [...prev, cycle]);
		toast.success("Cycle created");
		return true;
	}, [writeFile]);

	const updateCycle = useCallback((cycle: Cycle): boolean => {
		if (!writeFile(`cycles/${cycle.id}.json`, cycle)) { toast.error("Failed to update cycle"); return false; }
		setCycles((prev) => prev.map((c) => (c.id === cycle.id ? cycle : c)));
		return true;
	}, [writeFile]);

	const createAction = useCallback((action: Action): boolean => {
		if (!writeFile(`actions/${action.id}.json`, action)) { toast.error("Failed to create action"); return false; }
		setActions((prev) => [...prev, action]);
		toast.success("Action created");
		return true;
	}, [writeFile]);

	const updateAction = useCallback((action: Action): boolean => {
		if (!writeFile(`actions/${action.id}.json`, action)) { toast.error("Failed to update action"); return false; }
		setActions((prev) => prev.map((a) => (a.id === action.id ? action : a)));
		return true;
	}, [writeFile]);

	const deleteAction = useCallback((id: string): boolean => {
		if (!deleteFile(`actions/${id}.json`)) { toast.error("Failed to delete action"); return false; }
		setActions((prev) => prev.filter((a) => a.id !== id));
		toast.success("Action deleted");
		return true;
	}, [deleteFile]);

	const updateCompetitors = useCallback((newCompetitors: Competitor[]): void => {
		if (!writeFile("competitors.json", { competitors: newCompetitors })) return;
		setCompetitors(newCompetitors);
	}, [writeFile]);

	return {
		articles,
		keywords,
		hubs,
		cycles,
		actions,
		competitors,
		status,
		isLoading,
		errorRecords,
		createArticle,
		updateArticle,
		deleteArticle,
		createKeyword,
		updateKeyword,
		deleteKeyword,
		updateHubs,
		createCycle,
		updateCycle,
		createAction,
		updateAction,
		deleteAction,
		updateCompetitors,
	};
}
