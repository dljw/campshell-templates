import { readFile } from "node:fs/promises";
import path from "node:path";
import { readAllHabits } from "./helpers.js";
import type { Habit, NotFoundError as NotFoundErrorType, QueryOptions } from "./types.js";
import { NotFoundError } from "./types.js";

export async function listHabits(options: QueryOptions): Promise<Habit[]> {
	let habits = await readAllHabits(options.dataDir);

	if (options.frequency) {
		habits = habits.filter((h) => h.frequency === options.frequency);
	}
	if (options.categoryId) {
		habits = habits.filter((h) => h.categoryId === options.categoryId);
	}
	if (options.archived !== undefined) {
		habits = habits.filter((h) => (h.archived ?? false) === options.archived);
	}

	return habits.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getHabit(id: string, options: QueryOptions): Promise<Habit> {
	const filePath = path.join(options.dataDir, "habits", `${id}.json`);
	try {
		const raw = await readFile(filePath, "utf-8");
		return JSON.parse(raw) as Habit;
	} catch (err) {
		if ((err as NodeJS.ErrnoException).code === "ENOENT") {
			throw new NotFoundError(`Habit not found: ${id}`);
		}
		throw err;
	}
}

export async function searchHabits(term: string, options: QueryOptions): Promise<Habit[]> {
	const habits = await readAllHabits(options.dataDir);
	const lower = term.toLowerCase();
	return habits.filter(
		(h) =>
			h.name.toLowerCase().includes(lower) ||
			(h.description ?? "").toLowerCase().includes(lower),
	);
}
