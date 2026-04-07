#!/usr/bin/env node
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveCampshellHome, resolveCampshellPaths } from "@campshell/core";
import { Command } from "commander";
import { reset, start, stop } from "../lifecycle.js";
import {
	NotFoundError,
	getAction,
	getArticle,
	getCycle,
	getKeyword,
	getStats,
	listActions,
	listArticles,
	listCompetitors,
	listCycles,
	listHubs,
	listKeywords,
	searchArticles,
	searchKeywords,
} from "../queries/index.js";
import type { QueryOptions } from "../queries/types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(path.join(__dirname, "..", "..", "package.json"), "utf-8"));

const program = new Command();

program
	.name("campshell-content-strategy")
	.description("Content Strategy CLI for Campshell")
	.version(pkg.version);

function resolveDataDir(dataDirFlag: string | undefined): string {
	if (dataDirFlag) {
		return path.resolve(process.cwd(), dataDirFlag);
	}
	const home = resolveCampshellHome();
	return path.join(resolveCampshellPaths(home).data, "content-strategy");
}

function outputJson(data: unknown): void {
	process.stdout.write(`${JSON.stringify(data, null, 2)}\n`);
}

function handleError(err: unknown): never {
	if (err instanceof NotFoundError) {
		outputJson({ error: "not_found", message: err.message });
		process.exit(1);
	}
	const message = err instanceof Error ? err.message : String(err);
	process.stderr.write(`Error: ${message}\n`);
	process.exit(1);
}

// --- query command group ---

const query = program.command("query").description("Query content strategy data");

query
	.command("articles")
	.description("List all articles")
	.option("--status <status>", "Filter by status")
	.option("--hub <id>", "Filter by hub ID")
	.option("--phase <phase>", "Filter by phase")
	.option("--priority <priority>", "Filter by priority")
	.option("--type <type>", "Filter by content type")
	.option("--data-dir <dir>", "Data directory (default: auto-detected from Campshell home)")
	.action(async (opts) => {
		try {
			const options: QueryOptions = {
				dataDir: resolveDataDir(opts.dataDir),
				status: opts.status,
				hubId: opts.hub,
				phase: opts.phase,
				priority: opts.priority,
				contentType: opts.type,
			};
			outputJson(await listArticles(options));
		} catch (err) {
			handleError(err);
		}
	});

query
	.command("article <id>")
	.description("Get a single article by ID")
	.option("--data-dir <dir>", "Data directory")
	.action(async (id: string, opts) => {
		try {
			outputJson(await getArticle(id, { dataDir: resolveDataDir(opts.dataDir) }));
		} catch (err) {
			handleError(err);
		}
	});

query
	.command("keywords")
	.description("List all keywords")
	.option("--article <id>", "Filter by article ID")
	.option("--quadrant <quadrant>", "Filter by quadrant")
	.option("--intent <intent>", "Filter by intent")
	.option("--status <status>", "Filter by tracking status")
	.option("--data-dir <dir>", "Data directory")
	.action(async (opts) => {
		try {
			const options: QueryOptions = {
				dataDir: resolveDataDir(opts.dataDir),
				articleId: opts.article,
				quadrant: opts.quadrant,
				intent: opts.intent,
				keywordStatus: opts.status,
			};
			outputJson(await listKeywords(options));
		} catch (err) {
			handleError(err);
		}
	});

query
	.command("keyword <id>")
	.description("Get a single keyword by ID")
	.option("--data-dir <dir>", "Data directory")
	.action(async (id: string, opts) => {
		try {
			outputJson(await getKeyword(id, { dataDir: resolveDataDir(opts.dataDir) }));
		} catch (err) {
			handleError(err);
		}
	});

query
	.command("cycles")
	.description("List all GSC analysis cycles")
	.option("--data-dir <dir>", "Data directory")
	.action(async (opts) => {
		try {
			outputJson(await listCycles({ dataDir: resolveDataDir(opts.dataDir) }));
		} catch (err) {
			handleError(err);
		}
	});

query
	.command("cycle <id>")
	.description("Get a single cycle by ID")
	.option("--data-dir <dir>", "Data directory")
	.action(async (id: string, opts) => {
		try {
			outputJson(await getCycle(id, { dataDir: resolveDataDir(opts.dataDir) }));
		} catch (err) {
			handleError(err);
		}
	});

query
	.command("actions")
	.description("List all optimization actions")
	.option("--status <status>", "Filter by status")
	.option("--type <type>", "Filter by action type")
	.option("--priority <priority>", "Filter by priority")
	.option("--cycle <id>", "Filter by cycle ID")
	.option("--data-dir <dir>", "Data directory")
	.action(async (opts) => {
		try {
			const options: QueryOptions = {
				dataDir: resolveDataDir(opts.dataDir),
				status: opts.status,
				type: opts.type,
				priority: opts.priority,
				cycleId: opts.cycle,
			};
			outputJson(await listActions(options));
		} catch (err) {
			handleError(err);
		}
	});

query
	.command("action <id>")
	.description("Get a single action by ID")
	.option("--data-dir <dir>", "Data directory")
	.action(async (id: string, opts) => {
		try {
			outputJson(await getAction(id, { dataDir: resolveDataDir(opts.dataDir) }));
		} catch (err) {
			handleError(err);
		}
	});

query
	.command("hubs")
	.description("List all content hubs")
	.option("--data-dir <dir>", "Data directory")
	.action(async (opts) => {
		try {
			outputJson(await listHubs({ dataDir: resolveDataDir(opts.dataDir) }));
		} catch (err) {
			handleError(err);
		}
	});

query
	.command("competitors")
	.description("List all competitors")
	.option("--data-dir <dir>", "Data directory")
	.action(async (opts) => {
		try {
			outputJson(await listCompetitors({ dataDir: resolveDataDir(opts.dataDir) }));
		} catch (err) {
			handleError(err);
		}
	});

query
	.command("stats")
	.description("Get overview statistics")
	.option("--data-dir <dir>", "Data directory")
	.action(async (opts) => {
		try {
			outputJson(await getStats({ dataDir: resolveDataDir(opts.dataDir) }));
		} catch (err) {
			handleError(err);
		}
	});

query
	.command("pipeline")
	.description("Get content pipeline (articles sorted by scheduled date)")
	.option("--data-dir <dir>", "Data directory")
	.action(async (opts) => {
		try {
			const articles = await listArticles({ dataDir: resolveDataDir(opts.dataDir) });
			const pipeline = articles.map((a) => ({
				id: a.id,
				title: a.title,
				slug: a.slug,
				status: a.status,
				scheduledDate: a.scheduledDate,
				phase: a.phase,
				priority: a.priority,
				hubId: a.hubId,
				primaryKeyword: a.primaryKeyword,
			}));
			outputJson(pipeline);
		} catch (err) {
			handleError(err);
		}
	});

query
	.command("search <term>")
	.description("Search articles and keywords")
	.option("--data-dir <dir>", "Data directory")
	.action(async (term: string, opts) => {
		try {
			const dataDir = resolveDataDir(opts.dataDir);
			const [articles, keywords] = await Promise.all([
				searchArticles(term, { dataDir }),
				searchKeywords(term, { dataDir }),
			]);
			outputJson({ articles, keywords });
		} catch (err) {
			handleError(err);
		}
	});

// --- lifecycle commands ---

program
	.command("start")
	.description("Install and start the content strategy template")
	.action(async () => {
		try {
			await start({ home: resolveCampshellHome() });
		} catch (err) {
			handleError(err);
		}
	});

program
	.command("stop")
	.description("Stop the content strategy template")
	.action(async () => {
		try {
			await stop({ home: resolveCampshellHome() });
		} catch (err) {
			handleError(err);
		}
	});

program
	.command("reset")
	.description("Delete all content strategy data and restore defaults")
	.option("-y, --yes", "Skip confirmation prompt")
	.action(async (opts) => {
		try {
			await reset({ home: resolveCampshellHome(), skipPrompt: opts.yes });
		} catch (err) {
			handleError(err);
		}
	});

program.action(() => {
	program.outputHelp();
});

program.parse();
