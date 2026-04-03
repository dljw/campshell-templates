#!/usr/bin/env node
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveCampshellHome, resolveCampshellPaths } from "@campshell/core";
import { Command } from "commander";
import { reset, start, stop } from "../lifecycle.js";
import {
  NotFoundError,
  getCard,
  listCards,
  listColumns,
  overdueCards,
  searchCards,
} from "../queries/index.js";
import type { QueryOptions } from "../queries/types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(path.join(__dirname, "..", "..", "package.json"), "utf-8"));

const program = new Command();

program.name("campshell-kanban").description("Kanban board CLI for Campshell").version(pkg.version);

function resolveDataDir(dataDirFlag: string | undefined): string {
  if (dataDirFlag) {
    return path.resolve(process.cwd(), dataDirFlag);
  }
  const home = resolveCampshellHome();
  return path.join(resolveCampshellPaths(home).data, "kanban");
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

const query = program.command("query").description("Query kanban data");

query
  .command("list")
  .description("List all cards")
  .option("--column <column>", "Filter by column name or ID")
  .option("--priority <priority>", "Filter by priority (low, medium, high, urgent)")
  .option("--data-dir <dir>", "Data directory (default: ~/.campshell/data/kanban)")
  .action(async (opts) => {
    try {
      const options: QueryOptions = {
        dataDir: resolveDataDir(opts.dataDir),
        column: opts.column,
        priority: opts.priority,
      };
      const cards = await listCards(options);
      outputJson(cards);
    } catch (err) {
      handleError(err);
    }
  });

query
  .command("get <id>")
  .description("Get a single card by ID")
  .option("--data-dir <dir>", "Data directory (default: ~/.campshell/data/kanban)")
  .action(async (id: string, opts) => {
    try {
      const options: QueryOptions = {
        dataDir: resolveDataDir(opts.dataDir),
      };
      const card = await getCard(id, options);
      outputJson(card);
    } catch (err) {
      handleError(err);
    }
  });

query
  .command("columns")
  .description("List all columns")
  .option("--data-dir <dir>", "Data directory (default: ~/.campshell/data/kanban)")
  .action(async (opts) => {
    try {
      const options: QueryOptions = {
        dataDir: resolveDataDir(opts.dataDir),
      };
      const columns = await listColumns(options);
      outputJson(columns);
    } catch (err) {
      handleError(err);
    }
  });

query
  .command("overdue")
  .description("List cards past their due date")
  .option("--column <column>", "Filter by column name or ID")
  .option("--data-dir <dir>", "Data directory (default: ~/.campshell/data/kanban)")
  .action(async (opts) => {
    try {
      const options: QueryOptions = {
        dataDir: resolveDataDir(opts.dataDir),
        column: opts.column,
      };
      const cards = await overdueCards(options);
      outputJson(cards);
    } catch (err) {
      handleError(err);
    }
  });

query
  .command("search <term>")
  .description("Full-text search across cards")
  .option("--column <column>", "Filter by column name or ID")
  .option("--data-dir <dir>", "Data directory (default: ~/.campshell/data/kanban)")
  .action(async (term: string, opts) => {
    try {
      const options: QueryOptions = {
        dataDir: resolveDataDir(opts.dataDir),
        column: opts.column,
      };
      const cards = await searchCards(term, options);
      outputJson(cards);
    } catch (err) {
      handleError(err);
    }
  });

// --- lifecycle commands ---

program
  .command("start")
  .description("Install and start the kanban template")
  .action(async () => {
    try {
      await start({ home: resolveCampshellHome() });
    } catch (err) {
      handleError(err);
    }
  });

program
  .command("stop")
  .description("Stop the kanban template")
  .action(async () => {
    try {
      await stop({ home: resolveCampshellHome() });
    } catch (err) {
      handleError(err);
    }
  });

program
  .command("reset")
  .description("Delete all kanban data and restore defaults")
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
