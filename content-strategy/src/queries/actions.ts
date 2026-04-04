import { readFile } from "node:fs/promises";
import path from "node:path";
import { readAllActions } from "./helpers.js";
import type { Action, QueryOptions } from "./types.js";
import { NotFoundError } from "./types.js";

export async function listActions(options: QueryOptions): Promise<Action[]> {
	let actions = await readAllActions(options.dataDir);

	if (options.status) {
		actions = actions.filter((a) => a.status === options.status);
	}
	if (options.type) {
		actions = actions.filter((a) => a.type === options.type);
	}
	if (options.priority) {
		actions = actions.filter((a) => a.priority === options.priority);
	}
	if (options.cycleId) {
		actions = actions.filter((a) => a.cycleId === options.cycleId);
	}

	actions.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
	return actions;
}

export async function getAction(id: string, options: QueryOptions): Promise<Action> {
	const filePath = path.join(options.dataDir, "actions", `${id}.json`);
	try {
		const raw = await readFile(filePath, "utf-8");
		return JSON.parse(raw) as Action;
	} catch (err) {
		if ((err as NodeJS.ErrnoException).code === "ENOENT") {
			throw new NotFoundError(`Action "${id}" not found`);
		}
		throw err;
	}
}
