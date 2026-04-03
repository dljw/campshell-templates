#!/usr/bin/env node
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveCampshellHome, resolveCampshellPaths } from "@campshell/core";
import { Command } from "commander";
import { reset, start, stop } from "../lifecycle.js";
import {
  NotFoundError,
  getAccount,
  getBudget,
  getTransaction,
  listAccounts,
  listBudgets,
  listCategories,
  getMonthlySummary,
  readTags,
  searchTransactions,
  listTransactions,
} from "../queries/index.js";
import type { QueryOptions } from "../queries/types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(path.join(__dirname, "..", "..", "package.json"), "utf-8"));

const program = new Command();

program
  .name("campshell-budget-tracker")
  .description("Budget Tracker CLI for Campshell")
  .version(pkg.version);

function resolveDataDir(dataDirFlag: string | undefined): string {
  if (dataDirFlag) {
    return path.resolve(process.cwd(), dataDirFlag);
  }
  const home = resolveCampshellHome();
  return path.join(resolveCampshellPaths(home).data, "budget-tracker");
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

const query = program.command("query").description("Query budget tracker data");

query
  .command("list accounts")
  .description("List all accounts")
  .option("--type <type>", "Filter by account type (asset, expense, revenue, liability)")
  .option("--data-dir <dir>", "Data directory (default: ~/.campshell/data/budget-tracker)")
  .action(async (opts) => {
    try {
      const options: QueryOptions = {
        dataDir: resolveDataDir(opts.dataDir),
        type: opts.type,
      };
      outputJson(await listAccounts(options));
    } catch (err) {
      handleError(err);
    }
  });

query
  .command("get account <id>")
  .description("Get a single account by ID")
  .option("--data-dir <dir>", "Data directory")
  .action(async (id: string, opts) => {
    try {
      outputJson(await getAccount(id, { dataDir: resolveDataDir(opts.dataDir) }));
    } catch (err) {
      handleError(err);
    }
  });

query
  .command("list transactions")
  .description("List transactions with optional filters")
  .option("--type <type>", "Filter by type (withdrawal, deposit, transfer)")
  .option("--category <id>", "Filter by category ID")
  .option("--account <id>", "Filter by account ID (source or destination)")
  .option("--from <date>", "Start date (YYYY-MM-DD)")
  .option("--to <date>", "End date (YYYY-MM-DD)")
  .option("--data-dir <dir>", "Data directory")
  .action(async (opts) => {
    try {
      const options: QueryOptions = {
        dataDir: resolveDataDir(opts.dataDir),
        type: opts.type,
        categoryId: opts.category,
        accountId: opts.account,
        from: opts.from,
        to: opts.to,
      };
      outputJson(await listTransactions(options));
    } catch (err) {
      handleError(err);
    }
  });

query
  .command("get transaction <id>")
  .description("Get a single transaction by ID")
  .option("--data-dir <dir>", "Data directory")
  .action(async (id: string, opts) => {
    try {
      outputJson(await getTransaction(id, { dataDir: resolveDataDir(opts.dataDir) }));
    } catch (err) {
      handleError(err);
    }
  });

query
  .command("list budgets")
  .description("List budgets with current month spending progress")
  .option("--data-dir <dir>", "Data directory")
  .action(async (opts) => {
    try {
      outputJson(await listBudgets({ dataDir: resolveDataDir(opts.dataDir) }));
    } catch (err) {
      handleError(err);
    }
  });

query
  .command("get budget <id>")
  .description("Get a single budget with current spending progress")
  .option("--data-dir <dir>", "Data directory")
  .action(async (id: string, opts) => {
    try {
      outputJson(await getBudget(id, { dataDir: resolveDataDir(opts.dataDir) }));
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
  .command("tags")
  .description("List all tags")
  .option("--data-dir <dir>", "Data directory")
  .action(async (opts) => {
    try {
      outputJson(await readTags(resolveDataDir(opts.dataDir)));
    } catch (err) {
      handleError(err);
    }
  });

query
  .command("summary")
  .description("Monthly income/expense summary (defaults to current month)")
  .option("--month <YYYY-MM>", "Month to summarize")
  .option("--data-dir <dir>", "Data directory")
  .action(async (opts) => {
    try {
      const options: QueryOptions = {
        dataDir: resolveDataDir(opts.dataDir),
        month: opts.month,
      };
      outputJson(await getMonthlySummary(options));
    } catch (err) {
      handleError(err);
    }
  });

query
  .command("search <term>")
  .description("Full-text search across transactions")
  .option("--data-dir <dir>", "Data directory")
  .action(async (term: string, opts) => {
    try {
      outputJson(await searchTransactions(term, { dataDir: resolveDataDir(opts.dataDir) }));
    } catch (err) {
      handleError(err);
    }
  });

// --- lifecycle commands ---

program
  .command("start")
  .description("Install and start the budget tracker template")
  .action(async () => {
    try {
      await start({ home: resolveCampshellHome() });
    } catch (err) {
      handleError(err);
    }
  });

program
  .command("stop")
  .description("Stop the budget tracker template")
  .action(async () => {
    try {
      await stop({ home: resolveCampshellHome() });
    } catch (err) {
      handleError(err);
    }
  });

program
  .command("reset")
  .description("Delete all budget tracker data and restore defaults")
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
