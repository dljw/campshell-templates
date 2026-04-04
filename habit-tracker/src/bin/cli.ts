#!/usr/bin/env node
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveCampshellHome, resolveCampshellPaths } from "@campshell/core";
import { Command } from "commander";
import { reset, start, stop } from "../lifecycle.js";
import {
	NotFoundError,
	getCompletion,
	getHabit,
	getStats,
	getStreaks,
	listCategories,
	listCompletions,
	listHabits,
	searchHabits,
} from "../queries/index.js";
import type { QueryOptions } from "../queries/types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(path.join(__dirname, "..", "..", "package.json"), "utf-8"));

const program = new Command();

program
	.name("campshell-habit-tracker")
	.description("Habit Tracker CLI for Campshell")
	.version(pkg.version);

function resolveDataDir(dataDirFlag: string | undefined): string {
	if (dataDirFlag) {
		return path.resolve(process.cwd(), dataDirFlag);
	}
	const home = resolveCampshellHome();
	return path.join(resolveCampshellPaths(home).data, "habit-tracker");
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

const query = program.command("query").description("Query habit tracker data");

query
	.command("habits")
	.description("List all habits")
	.option("--frequency <frequency>", "Filter by frequency (daily, weekly, custom)")
	.option("--category <id>", "Filter by category ID")
	.option("--archived", "Show only archived habits")
	.option("--data-dir <dir>", "Data directory (default: ~/.campshell/data/habit-tracker)")
	.action(async (opts) => {
		try {
			const options: QueryOptions = {
				dataDir: resolveDataDir(opts.dataDir),
				frequency: opts.frequency,
				categoryId: opts.category,
				archived: opts.archived ? true : undefined,
			};
			outputJson(await listHabits(options));
		} catch (err) {
			handleError(err);
		}
	});

query
	.command("habit <id>")
	.description("Get a single habit by ID")
	.option("--data-dir <dir>", "Data directory")
	.action(async (id: string, opts) => {
		try {
			outputJson(await getHabit(id, { dataDir: resolveDataDir(opts.dataDir) }));
		} catch (err) {
			handleError(err);
		}
	});

query
	.command("completions")
	.description("List completions with optional filters")
	.option("--habit <id>", "Filter by habit ID")
	.option("--from <date>", "Start date (YYYY-MM-DD)")
	.option("--to <date>", "End date (YYYY-MM-DD)")
	.option("--data-dir <dir>", "Data directory")
	.action(async (opts) => {
		try {
			const options: QueryOptions = {
				dataDir: resolveDataDir(opts.dataDir),
				habitId: opts.habit,
				from: opts.from,
				to: opts.to,
			};
			outputJson(await listCompletions(options));
		} catch (err) {
			handleError(err);
		}
	});

query
	.command("completion <id>")
	.description("Get a single completion by ID")
	.option("--data-dir <dir>", "Data directory")
	.action(async (id: string, opts) => {
		try {
			outputJson(await getCompletion(id, { dataDir: resolveDataDir(opts.dataDir) }));
		} catch (err) {
			handleError(err);
		}
	});

query
	.command("categories")
	.description("List all categories")
	.option("--data-dir <dir>", "Data directory")
	.action(async (opts) => {
		try {
			outputJson(await listCategories({ dataDir: resolveDataDir(opts.dataDir) }));
		} catch (err) {
			handleError(err);
		}
	});

query
	.command("streaks")
	.description("Get current and best streaks for all active habits")
	.option("--habit <id>", "Filter to a specific habit")
	.option("--data-dir <dir>", "Data directory")
	.action(async (opts) => {
		try {
			outputJson(
				await getStreaks({ dataDir: resolveDataDir(opts.dataDir), habitId: opts.habit }),
			);
		} catch (err) {
			handleError(err);
		}
	});

query
	.command("stats")
	.description("Overall completion stats (defaults to last 30 days)")
	.option("--days <n>", "Number of days to analyze", "30")
	.option("--data-dir <dir>", "Data directory")
	.action(async (opts) => {
		try {
			outputJson(
				await getStats({
					dataDir: resolveDataDir(opts.dataDir),
					days: Number.parseInt(opts.days, 10),
				}),
			);
		} catch (err) {
			handleError(err);
		}
	});

query
	.command("search <term>")
	.description("Search habits by name or description")
	.option("--data-dir <dir>", "Data directory")
	.action(async (term: string, opts) => {
		try {
			outputJson(await searchHabits(term, { dataDir: resolveDataDir(opts.dataDir) }));
		} catch (err) {
			handleError(err);
		}
	});

// --- lifecycle commands ---

program
	.command("start")
	.description("Install and start the habit tracker template")
	.action(async () => {
		try {
			await start({ home: resolveCampshellHome() });
		} catch (err) {
			handleError(err);
		}
	});

program
	.command("stop")
	.description("Stop the habit tracker template")
	.action(async () => {
		try {
			await stop({ home: resolveCampshellHome() });
		} catch (err) {
			handleError(err);
		}
	});

program
	.command("reset")
	.description("Delete all habit tracker data and restore defaults")
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
