#!/usr/bin/env node
import path from "node:path";
import { resolveCampshellHome, resolveCampshellPaths } from "@campshell/core";
import { Command } from "commander";
import { reset, start, stop } from "../lifecycle.js";
import { getEntity, listEntities } from "../queries/index.js";

function resolveDataDir(): string {
  const home = resolveCampshellHome();
  return path.join(resolveCampshellPaths(home).data, "social-media");
}

const program = new Command();

program
  .name("campshell-social-media")
  .description("Social Media template for Campshell")
  .version("1.0.0");

program
  .command("start")
  .description("Start the Social Media template")
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
  .description("Stop the Social Media template")
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
  .description("Reset Social Media data to defaults")
  .option("-y, --yes", "Skip confirmation prompt")
  .action(async (opts: { yes?: boolean }) => {
    try {
      await reset({ home: resolveCampshellHome(), skipPrompt: opts.yes });
    } catch (err) {
      process.stderr.write(`Error: ${(err as Error).message}\n`);
      process.exit(1);
    }
  });

const query = program.command("query").description("Query Social Media data");

query
  .command("list businesses")
  .description("List all businesses")
  .action(async () => {
    const dataDir = resolveDataDir();
    const items = await listEntities({ dataDir }, "businesses");
    console.log(JSON.stringify(items, null, 2));
  });

query
  .command("get businesses <id>")
  .description("Get a single business by ID")
  .action(async (id: string) => {
    const dataDir = resolveDataDir();
    const item = await getEntity({ dataDir }, "businesses", id);
    if (item === null) {
      console.error(`Not found: ${id}`);
      process.exit(1);
    }
    console.log(JSON.stringify(item, null, 2));
  });

query
  .command("list posts")
  .description("List all posts")
  .action(async () => {
    const dataDir = resolveDataDir();
    const items = await listEntities({ dataDir }, "posts");
    console.log(JSON.stringify(items, null, 2));
  });

query
  .command("get posts <id>")
  .description("Get a single post by ID")
  .action(async (id: string) => {
    const dataDir = resolveDataDir();
    const item = await getEntity({ dataDir }, "posts", id);
    if (item === null) {
      console.error(`Not found: ${id}`);
      process.exit(1);
    }
    console.log(JSON.stringify(item, null, 2));
  });

query
  .command("list campaigns")
  .description("List all campaigns")
  .action(async () => {
    const dataDir = resolveDataDir();
    const items = await listEntities({ dataDir }, "campaigns");
    console.log(JSON.stringify(items, null, 2));
  });

query
  .command("get campaigns <id>")
  .description("Get a single campaign by ID")
  .action(async (id: string) => {
    const dataDir = resolveDataDir();
    const item = await getEntity({ dataDir }, "campaigns", id);
    if (item === null) {
      console.error(`Not found: ${id}`);
      process.exit(1);
    }
    console.log(JSON.stringify(item, null, 2));
  });

query
  .command("list ideas")
  .description("List all ideas")
  .action(async () => {
    const dataDir = resolveDataDir();
    const items = await listEntities({ dataDir }, "ideas");
    console.log(JSON.stringify(items, null, 2));
  });

query
  .command("get ideas <id>")
  .description("Get a single idea by ID")
  .action(async (id: string) => {
    const dataDir = resolveDataDir();
    const item = await getEntity({ dataDir }, "ideas", id);
    if (item === null) {
      console.error(`Not found: ${id}`);
      process.exit(1);
    }
    console.log(JSON.stringify(item, null, 2));
  });

query
  .command("list platforms")
  .description("List all platform accounts")
  .action(async () => {
    const dataDir = resolveDataDir();
    const items = await listEntities({ dataDir }, "platforms");
    console.log(JSON.stringify(items, null, 2));
  });

query
  .command("get platforms <id>")
  .description("Get a single platform account by ID")
  .action(async (id: string) => {
    const dataDir = resolveDataDir();
    const item = await getEntity({ dataDir }, "platforms", id);
    if (item === null) {
      console.error(`Not found: ${id}`);
      process.exit(1);
    }
    console.log(JSON.stringify(item, null, 2));
  });

query
  .command("list analytics")
  .description("List all analytics records")
  .action(async () => {
    const dataDir = resolveDataDir();
    const items = await listEntities({ dataDir }, "analytics");
    console.log(JSON.stringify(items, null, 2));
  });

query
  .command("get analytics <id>")
  .description("Get a single analytics record by ID")
  .action(async (id: string) => {
    const dataDir = resolveDataDir();
    const item = await getEntity({ dataDir }, "analytics", id);
    if (item === null) {
      console.error(`Not found: ${id}`);
      process.exit(1);
    }
    console.log(JSON.stringify(item, null, 2));
  });

program.parse();
