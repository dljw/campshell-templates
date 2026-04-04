import { readFile } from "node:fs/promises";
import path from "node:path";
import { readAllArticles } from "./helpers.js";
import type { Article, QueryOptions } from "./types.js";
import { NotFoundError } from "./types.js";

export async function listArticles(options: QueryOptions): Promise<Article[]> {
	let articles = await readAllArticles(options.dataDir);

	if (options.status) {
		articles = articles.filter((a) => a.status === options.status);
	}
	if (options.contentType) {
		articles = articles.filter((a) => a.contentType === options.contentType);
	}
	if (options.hubId) {
		articles = articles.filter((a) => a.hubId === options.hubId);
	}
	if (options.phase) {
		articles = articles.filter((a) => a.phase === options.phase);
	}
	if (options.priority) {
		articles = articles.filter((a) => a.priority === options.priority);
	}

	articles.sort((a, b) => (a.scheduledDate ?? "").localeCompare(b.scheduledDate ?? ""));
	return articles;
}

export async function getArticle(id: string, options: QueryOptions): Promise<Article> {
	const filePath = path.join(options.dataDir, "articles", `${id}.json`);
	try {
		const raw = await readFile(filePath, "utf-8");
		return JSON.parse(raw) as Article;
	} catch (err) {
		if ((err as NodeJS.ErrnoException).code === "ENOENT") {
			throw new NotFoundError(`Article "${id}" not found`);
		}
		throw err;
	}
}

export async function searchArticles(term: string, options: QueryOptions): Promise<Article[]> {
	const articles = await readAllArticles(options.dataDir);
	const lower = term.toLowerCase();
	return articles.filter(
		(a) =>
			a.title.toLowerCase().includes(lower) ||
			a.slug.toLowerCase().includes(lower) ||
			(a.primaryKeyword?.toLowerCase().includes(lower) ?? false) ||
			(a.notes?.toLowerCase().includes(lower) ?? false),
	);
}
