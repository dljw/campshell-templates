import type { ServerMessage } from "@campshell/core";
import { useWebSocket } from "@campshell/ui-hooks";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type {
	CategoriesCollection,
	Category,
	Completion,
	Habit,
	ValidationErrorDetail,
} from "../types.js";

export interface UseHabitDataReturn {
	habits: Habit[];
	completions: Completion[];
	categories: Category[];
	status: "connecting" | "connected" | "disconnected";
	isLoading: boolean;
	errorRecords: ValidationErrorDetail[];
	createHabit: (habit: Habit) => boolean;
	updateHabit: (habit: Habit) => boolean;
	deleteHabit: (id: string) => boolean;
	createCompletion: (completion: Completion) => boolean;
	deleteCompletion: (id: string) => boolean;
	updateCategories: (categories: Category[]) => void;
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

export function useHabitData(apiBase = ""): UseHabitDataReturn {
	const { status, writeFile, deleteFile, onFileEvent } = useWebSocket({
		template: "habit-tracker",
	});

	const [habits, setHabits] = useState<Habit[]>([]);
	const [completions, setCompletions] = useState<Completion[]>([]);
	const [categories, setCategories] = useState<Category[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [errorRecords, setErrorRecords] = useState<ValidationErrorDetail[]>([]);

	// Fetch initial data when connected
	useEffect(() => {
		if (status !== "connected") return;
		let cancelled = false;
		setIsLoading(true);

		Promise.all([
			fetch(`${apiBase}/api/habit-tracker/data`)
				.then((r) => (r.ok ? r.json() : null))
				.catch(() => null),
			fetch(`${apiBase}/api/habit-tracker/errors`)
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
					setHabits((d.habits as Habit[]) ?? []);
					setCompletions((d.completions as Completion[]) ?? []);
					setCategories(
						((d.categories as CategoriesCollection)?.categories ??
							(d.categories as Category[])) ??
							[],
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

				if (entity === "habits") {
					const item = event.data as Habit;
					setHabits((prev) => {
						const idx = prev.findIndex((h) => h.id === item.id);
						if (idx >= 0) {
							const next = [...prev];
							next[idx] = item;
							return next;
						}
						return [...prev, item];
					});
				} else if (entity === "completions") {
					const item = event.data as Completion;
					setCompletions((prev) => {
						const idx = prev.findIndex((c) => c.id === item.id);
						if (idx >= 0) {
							const next = [...prev];
							next[idx] = item;
							return next;
						}
						return [...prev, item];
					});
				} else if (entity === "categories") {
					const data = event.data as CategoriesCollection;
					setCategories(data.categories ?? []);
				}
			} else if (event.type === "file:deleted") {
				if (entity === "habits") {
					const id = event.file.replace("habits/", "").replace(".json", "");
					setHabits((prev) => prev.filter((h) => h.id !== id));
				} else if (entity === "completions") {
					const id = event.file.replace("completions/", "").replace(".json", "");
					setCompletions((prev) => prev.filter((c) => c.id !== id));
				}
			}
		});

		return unsub;
	}, [onFileEvent]);

	const createHabit = useCallback(
		(habit: Habit): boolean => {
			if (!writeFile(`habits/${habit.id}.json`, habit)) {
				toast.error("Failed to create habit");
				return false;
			}
			setHabits((prev) => [...prev, habit]);
			toast.success("Habit created");
			return true;
		},
		[writeFile],
	);

	const updateHabit = useCallback(
		(habit: Habit): boolean => {
			if (!writeFile(`habits/${habit.id}.json`, habit)) {
				toast.error("Failed to update habit");
				return false;
			}
			setHabits((prev) => prev.map((h) => (h.id === habit.id ? habit : h)));
			return true;
		},
		[writeFile],
	);

	const deleteHabit = useCallback(
		(id: string): boolean => {
			if (!deleteFile(`habits/${id}.json`)) {
				toast.error("Failed to delete habit");
				return false;
			}
			setHabits((prev) => prev.filter((h) => h.id !== id));
			toast.success("Habit deleted");
			return true;
		},
		[deleteFile],
	);

	const createCompletion = useCallback(
		(completion: Completion): boolean => {
			if (!writeFile(`completions/${completion.id}.json`, completion)) {
				toast.error("Failed to record completion");
				return false;
			}
			setCompletions((prev) => [...prev, completion]);
			return true;
		},
		[writeFile],
	);

	const deleteCompletion = useCallback(
		(id: string): boolean => {
			if (!deleteFile(`completions/${id}.json`)) {
				toast.error("Failed to remove completion");
				return false;
			}
			setCompletions((prev) => prev.filter((c) => c.id !== id));
			return true;
		},
		[deleteFile],
	);

	const updateCategories = useCallback(
		(newCategories: Category[]): void => {
			if (!writeFile("categories.json", { categories: newCategories })) return;
			setCategories(newCategories);
		},
		[writeFile],
	);

	return {
		habits,
		completions,
		categories,
		status,
		isLoading,
		errorRecords,
		createHabit,
		updateHabit,
		deleteHabit,
		createCompletion,
		deleteCompletion,
		updateCategories,
	};
}
