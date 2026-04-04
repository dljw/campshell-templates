import { readFile } from "node:fs/promises";
import path from "node:path";
import { readAllKeywords } from "./helpers.js";
import type { Keyword, QueryOptions } from "./types.js";
import { NotFoundError } from "./types.js";

export async function listKeywords(options: QueryOptions): Promise<Keyword[]> {
	let keywords = await readAllKeywords(options.dataDir);

	if (options.articleId) {
		keywords = keywords.filter((k) => k.articleId === options.articleId);
	}
	if (options.intent) {
		keywords = keywords.filter((k) => k.intent === options.intent);
	}
	if (options.quadrant) {
		keywords = keywords.filter((k) => k.quadrant === options.quadrant);
	}
	if (options.keywordStatus) {
		keywords = keywords.filter((k) => k.status === options.keywordStatus);
	}

	keywords.sort((a, b) => (b.impressions ?? 0) - (a.impressions ?? 0));
	return keywords;
}

export async function getKeyword(id: string, options: QueryOptions): Promise<Keyword> {
	const filePath = path.join(options.dataDir, "keywords", `${id}.json`);
	try {
		const raw = await readFile(filePath, "utf-8");
		return JSON.parse(raw) as Keyword;
	} catch (err) {
		if ((err as NodeJS.ErrnoException).code === "ENOENT") {
			throw new NotFoundError(`Keyword "${id}" not found`);
		}
		throw err;
	}
}

export async function searchKeywords(term: string, options: QueryOptions): Promise<Keyword[]> {
	const keywords = await readAllKeywords(options.dataDir);
	const lower = term.toLowerCase();
	return keywords.filter((k) => k.term.toLowerCase().includes(lower));
}
