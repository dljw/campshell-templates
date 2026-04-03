#!/usr/bin/env node
import path from "node:path";
import { resolveCampshellHome, resolveCampshellPaths } from "@campshell/core";
import { Command } from "commander";
import { reset, start, stop } from "../lifecycle.js";
import { getEntity, listEntities } from "../queries/index.js";

function resolveDataDir(): string {
  const home = resolveCampshellHome();
  return path.join(resolveCampshellPaths(home).data, "brain-vault");
}

const program = new Command();

program
  .name("campshell-brain-vault")
  .description("Brain Vault template for Campshell")
  .version("1.0.0");

program
  .command("start")
  .description("Start the Brain Vault template")
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
  .description("Stop the Brain Vault template")
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
  .description("Reset Brain Vault data to defaults")
  .option("-y, --yes", "Skip confirmation prompt")
  .action(async (opts: { yes?: boolean }) => {
    try {
      await reset({ home: resolveCampshellHome(), skipPrompt: opts.yes });
    } catch (err) {
      process.stderr.write(`Error: ${(err as Error).message}\n`);
      process.exit(1);
    }
  });

const query = program.command("query").description("Query Brain Vault data");

query
  .command("list notes")
  .description("List all notes")
  .action(async () => {
    const dataDir = resolveDataDir();
    const items = await listEntities({ dataDir }, "notes");
    console.log(JSON.stringify(items, null, 2));
  });

query
  .command("get notes <id>")
  .description("Get a single notes by ID")
  .action(async (id: string) => {
    const dataDir = resolveDataDir();
    const item = await getEntity({ dataDir }, "notes", id);
    if (item === null) {
      console.error(`Not found: ${id}`);
      process.exit(1);
    }
    console.log(JSON.stringify(item, null, 2));
  });

program.parse();
