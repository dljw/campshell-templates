#!/usr/bin/env node
import path from "node:path";
import { Command } from "commander";
import { resolveCampshellHome, resolveCampshellPaths } from "@campshell/core";
import { start, stop, reset } from "../lifecycle.js";
import { listEntities, getEntity } from "../queries/index.js";

function resolveDataDir(): string {
  const home = resolveCampshellHome();
  return path.join(resolveCampshellPaths(home).data, "journal");
}

const program = new Command();

program
  .name("campshell-journal")
  .description("Journal template for Campshell")
  .version("1.0.0");

program
  .command("start")
  .description("Start the Journal template")
  .action(async () => {
    try {
      await start({ home: resolveCampshellHome() });
    } catch (err) {
      process.stderr.write(`Error: ${(err as Error).message}\n`);
      process.exit(1);
    }
  });

program
  .command("stop")
  .description("Stop the Journal template")
  .action(async () => {
    try {
      await stop({ home: resolveCampshellHome() });
    } catch (err) {
      process.stderr.write(`Error: ${(err as Error).message}\n`);
      process.exit(1);
    }
  });

program
  .command("reset")
  .description("Reset Journal data to defaults")
  .option("-y, --yes", "Skip confirmation prompt")
  .action(async (opts: { yes?: boolean }) => {
    try {
      await reset({ home: resolveCampshellHome(), skipPrompt: opts.yes });
    } catch (err) {
      process.stderr.write(`Error: ${(err as Error).message}\n`);
      process.exit(1);
    }
  });

const query = program
  .command("query")
  .description("Query Journal data");

  query
    .command("list entries")
    .description("List all entries")
    .action(async () => {
      const dataDir = resolveDataDir();
      const items = await listEntities({ dataDir }, "entries");
      console.log(JSON.stringify(items, null, 2));
    });

  query
    .command("get entries <id>")
    .description("Get a single entries by ID")
    .action(async (id: string) => {
      const dataDir = resolveDataDir();
      const item = await getEntity({ dataDir }, "entries", id);
      if (item === null) {
        console.error(`Not found: ${id}`);
        process.exit(1);
      }
      console.log(JSON.stringify(item, null, 2));
    });

program.parse();
