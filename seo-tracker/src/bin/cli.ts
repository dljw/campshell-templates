#!/usr/bin/env node
import path from "node:path";
import { resolveCampshellHome, resolveCampshellPaths } from "@campshell/core";
import { Command } from "commander";
import { reset, start, stop } from "../lifecycle.js";
import { getEntity, listEntities } from "../queries/index.js";

function resolveDataDir(): string {
  const home = resolveCampshellHome();
  return path.join(resolveCampshellPaths(home).data, "seo-tracker");
}

const program = new Command();

program
  .name("campshell-seo-tracker")
  .description("SEO Tracker template for Campshell")
  .version("1.0.0");

program
  .command("start")
  .description("Start the SEO Tracker template")
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
  .description("Stop the SEO Tracker template")
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
  .description("Reset SEO Tracker data to defaults")
  .option("-y, --yes", "Skip confirmation prompt")
  .action(async (opts: { yes?: boolean }) => {
    try {
      await reset({ home: resolveCampshellHome(), skipPrompt: opts.yes });
    } catch (err) {
      process.stderr.write(`Error: ${(err as Error).message}\n`);
      process.exit(1);
    }
  });

const query = program.command("query").description("Query SEO Tracker data");

query
  .command("list keywords")
  .description("List all keywords")
  .action(async () => {
    const dataDir = resolveDataDir();
    const items = await listEntities({ dataDir }, "keywords");
    console.log(JSON.stringify(items, null, 2));
  });

query
  .command("get keywords <id>")
  .description("Get a single keywords by ID")
  .action(async (id: string) => {
    const dataDir = resolveDataDir();
    const item = await getEntity({ dataDir }, "keywords", id);
    if (item === null) {
      console.error(`Not found: ${id}`);
      process.exit(1);
    }
    console.log(JSON.stringify(item, null, 2));
  });

query
  .command("list pages")
  .description("List all pages")
  .action(async () => {
    const dataDir = resolveDataDir();
    const items = await listEntities({ dataDir }, "pages");
    console.log(JSON.stringify(items, null, 2));
  });

query
  .command("get pages <id>")
  .description("Get a single pages by ID")
  .action(async (id: string) => {
    const dataDir = resolveDataDir();
    const item = await getEntity({ dataDir }, "pages", id);
    if (item === null) {
      console.error(`Not found: ${id}`);
      process.exit(1);
    }
    console.log(JSON.stringify(item, null, 2));
  });

query
  .command("list backlinks")
  .description("List all backlinks")
  .action(async () => {
    const dataDir = resolveDataDir();
    const items = await listEntities({ dataDir }, "backlinks");
    console.log(JSON.stringify(items, null, 2));
  });

query
  .command("get backlinks <id>")
  .description("Get a single backlinks by ID")
  .action(async (id: string) => {
    const dataDir = resolveDataDir();
    const item = await getEntity({ dataDir }, "backlinks", id);
    if (item === null) {
      console.error(`Not found: ${id}`);
      process.exit(1);
    }
    console.log(JSON.stringify(item, null, 2));
  });

query
  .command("list issues")
  .description("List all issues")
  .action(async () => {
    const dataDir = resolveDataDir();
    const items = await listEntities({ dataDir }, "issues");
    console.log(JSON.stringify(items, null, 2));
  });

query
  .command("get issues <id>")
  .description("Get a single issues by ID")
  .action(async (id: string) => {
    const dataDir = resolveDataDir();
    const item = await getEntity({ dataDir }, "issues", id);
    if (item === null) {
      console.error(`Not found: ${id}`);
      process.exit(1);
    }
    console.log(JSON.stringify(item, null, 2));
  });

program.parse();
