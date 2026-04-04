import { readFile } from "node:fs/promises";
import path from "node:path";
import { readAllCycles } from "./helpers.js";
import type { Cycle, QueryOptions } from "./types.js";
import { NotFoundError } from "./types.js";

export async function listCycles(options: QueryOptions): Promise<Cycle[]> {
	const cycles = await readAllCycles(options.dataDir);
	cycles.sort((a, b) => b.cycleDate.localeCompare(a.cycleDate));
	return cycles;
}

export async function getCycle(id: string, options: QueryOptions): Promise<Cycle> {
	const filePath = path.join(options.dataDir, "cycles", `${id}.json`);
	try {
		const raw = await readFile(filePath, "utf-8");
		return JSON.parse(raw) as Cycle;
	} catch (err) {
		if ((err as NodeJS.ErrnoException).code === "ENOENT") {
			throw new NotFoundError(`Cycle "${id}" not found`);
		}
		throw err;
	}
}

export async function getLatestCycle(options: QueryOptions): Promise<Cycle | null> {
	const cycles = await listCycles(options);
	return cycles[0] ?? null;
}
