import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import type { Category, Completion, Habit } from "./types.js";

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

export function readAllHabits(dataDir: string): Promise<Habit[]> {
	return readAllFromDir<Habit>(dataDir, "habits");
}

export function readAllCompletions(dataDir: string): Promise<Completion[]> {
	return readAllFromDir<Completion>(dataDir, "completions");
}

export function readCategories(dataDir: string): Promise<Category[]> {
	return readCollection<Category>(dataDir, "categories.json", "categories");
}
