import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import type { Action, Article, Competitor, Cycle, Hub, Keyword } from "./types.js";

export async function readAllFromDir<T>(dataDir: string, subDir: string): Promise<T[]> {
	const dir = path.join(dataDir, subDir);
	let files: string[];
	try {
		files = await readdir(dir);
	} catch (err) {
		if ((err as NodeJS.ErrnoException).code === "ENOENT") {
			return [];
		}
		throw err;
	}
	const items: T[] = [];
	for (const file of files) {
		if (!file.endsWith(".json")) continue;
		try {
			const raw = await readFile(path.join(dir, file), "utf-8");
			items.push(JSON.parse(raw) as T);
		} catch {
			// Skip unparseable files
		}
	}
	return items;
}

export async function readCollection<T>(dataDir: string, file: string, key: string): Promise<T[]> {
	const filePath = path.join(dataDir, file);
	try {
		const raw = await readFile(filePath, "utf-8");
		const data = JSON.parse(raw) as Record<string, T[]>;
		return data[key] ?? [];
	} catch (err) {
		if ((err as NodeJS.ErrnoException).code === "ENOENT") {
			return [];
		}
		throw err;
	}
}

export function readAllArticles(dataDir: string): Promise<Article[]> {
	return readAllFromDir<Article>(dataDir, "articles");
}

export function readAllKeywords(dataDir: string): Promise<Keyword[]> {
	return readAllFromDir<Keyword>(dataDir, "keywords");
}

export function readAllCycles(dataDir: string): Promise<Cycle[]> {
	return readAllFromDir<Cycle>(dataDir, "cycles");
}

export function readAllActions(dataDir: string): Promise<Action[]> {
	return readAllFromDir<Action>(dataDir, "actions");
}

export function readHubs(dataDir: string): Promise<Hub[]> {
	return readCollection<Hub>(dataDir, "hubs.json", "hubs");
}

export function readCompetitors(dataDir: string): Promise<Competitor[]> {
	return readCollection<Competitor>(dataDir, "competitors.json", "competitors");
}
