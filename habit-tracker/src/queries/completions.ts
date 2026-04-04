import { readFile } from "node:fs/promises";
import path from "node:path";
import { readAllCompletions } from "./helpers.js";
import type { Completion, QueryOptions } from "./types.js";
import { NotFoundError } from "./types.js";

export async function listCompletions(options: QueryOptions): Promise<Completion[]> {
	let completions = await readAllCompletions(options.dataDir);

	if (options.habitId) {
		completions = completions.filter((c) => c.habitId === options.habitId);
	}
	if (options.from) {
		completions = completions.filter((c) => c.date >= options.from!);
	}
	if (options.to) {
		completions = completions.filter((c) => c.date <= options.to!);
	}

	return completions.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getCompletion(id: string, options: QueryOptions): Promise<Completion> {
	const filePath = path.join(options.dataDir, "completions", `${id}.json`);
	try {
		const raw = await readFile(filePath, "utf-8");
		return JSON.parse(raw) as Completion;
	} catch (err) {
		if ((err as NodeJS.ErrnoException).code === "ENOENT") {
			throw new NotFoundError(`Completion not found: ${id}`);
		}
		throw err;
	}
}
