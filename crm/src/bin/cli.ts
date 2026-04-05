#!/usr/bin/env node
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveCampshellHome, resolveCampshellPaths } from "@campshell/core";
import { Command } from "commander";
import { reset, start, stop } from "../lifecycle.js";
import {
  NotFoundError,
  getContact,
  getDeal,
  listActivities,
  listContacts,
  listDeals,
  pipelineSummary,
  searchCrm,
} from "../queries/index.js";
import type { QueryOptions } from "../queries/types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(path.join(__dirname, "..", "..", "package.json"), "utf-8"));

const program = new Command();

program.name("campshell-crm").description("Minimalist CRM for Campshell").version(pkg.version);

function resolveDataDir(dataDirFlag: string | undefined): string {
  if (dataDirFlag) {
    return path.resolve(process.cwd(), dataDirFlag);
  }
  const home = resolveCampshellHome();
  return path.join(resolveCampshellPaths(home).data, "crm");
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

const query = program.command("query").description("Query CRM data");

query
  .command("list-contacts")
  .description("List all contacts")
  .option("--data-dir <dir>", "Data directory")
  .action(async (opts) => {
    try {
      const options: QueryOptions = { dataDir: resolveDataDir(opts.dataDir) };
      outputJson(await listContacts(options));
    } catch (err) {
      handleError(err);
    }
  });

query
  .command("get-contact <id>")
  .description("Get a contact by ID")
  .option("--data-dir <dir>", "Data directory")
  .action(async (id: string, opts) => {
    try {
      const options: QueryOptions = { dataDir: resolveDataDir(opts.dataDir) };
      outputJson(await getContact(id, options));
    } catch (err) {
      handleError(err);
    }
  });

query
  .command("list-deals")
  .description("List deals")
  .option("--stage <stage>", "Filter by stage (lead, proposal, won, lost)")
  .option("--contact <contactId>", "Filter by contact ID")
  .option("--data-dir <dir>", "Data directory")
  .action(async (opts) => {
    try {
      const options: QueryOptions = {
        dataDir: resolveDataDir(opts.dataDir),
        stage: opts.stage,
        contactId: opts.contact,
      };
      outputJson(await listDeals(options));
    } catch (err) {
      handleError(err);
    }
  });

query
  .command("get-deal <id>")
  .description("Get a deal by ID")
  .option("--data-dir <dir>", "Data directory")
  .action(async (id: string, opts) => {
    try {
      const options: QueryOptions = { dataDir: resolveDataDir(opts.dataDir) };
      outputJson(await getDeal(id, options));
    } catch (err) {
      handleError(err);
    }
  });

query
  .command("list-activities")
  .description("List activities")
  .option("--type <type>", "Filter by type (call, email, meeting, note)")
  .option("--contact <contactId>", "Filter by contact ID")
  .option("--deal <dealId>", "Filter by deal ID")
  .option("--data-dir <dir>", "Data directory")
  .action(async (opts) => {
    try {
      const options: QueryOptions = {
        dataDir: resolveDataDir(opts.dataDir),
        type: opts.type,
        contactId: opts.contact,
        dealId: opts.deal,
      };
      outputJson(await listActivities(options));
    } catch (err) {
      handleError(err);
    }
  });

query
  .command("pipeline")
  .description("Show pipeline summary (count and value per stage)")
  .option("--data-dir <dir>", "Data directory")
  .action(async (opts) => {
    try {
      const options: QueryOptions = { dataDir: resolveDataDir(opts.dataDir) };
      outputJson(await pipelineSummary(options));
    } catch (err) {
      handleError(err);
    }
  });

query
  .command("search <term>")
  .description("Search across contacts and deals")
  .option("--data-dir <dir>", "Data directory")
  .action(async (term: string, opts) => {
    try {
      const options: QueryOptions = { dataDir: resolveDataDir(opts.dataDir) };
      outputJson(await searchCrm(term, options));
    } catch (err) {
      handleError(err);
    }
  });

// --- lifecycle commands ---

program
  .command("start")
  .description("Install and start the CRM template")
  .action(async () => {
    try {
      await start({ home: resolveCampshellHome() });
    } catch (err) {
      handleError(err);
    }
  });

program
  .command("stop")
  .description("Stop the CRM template")
  .action(async () => {
    try {
      await stop({ home: resolveCampshellHome() });
    } catch (err) {
      handleError(err);
    }
  });

program
  .command("reset")
  .description("Delete all CRM data and restore defaults")
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
