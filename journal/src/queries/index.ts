import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import type { QueryOptions } from "./types.js";

export async function listEntities(
  options: QueryOptions,
  entityDir: string,
): Promise<unknown[]> {
  const dir = path.join(options.dataDir, entityDir);
  let entries: string[];
  try {
    entries = await readdir(dir);
  } catch {
    return [];
  }
  const items: unknown[] = [];
  for (const entry of entries) {
    if (!entry.endsWith(".json")) continue;
    try {
      const data = JSON.parse(await readFile(path.join(dir, entry), "utf-8"));
      items.push(data);
    } catch {
      // Skip unreadable files
    }
  }
  return items;
}

export async function getEntity(
  options: QueryOptions,
  entityDir: string,
  id: string,
): Promise<unknown | null> {
  const filePath = path.join(options.dataDir, entityDir, `${id}.json`);
  try {
    return JSON.parse(await readFile(filePath, "utf-8"));
  } catch {
    return null;
  }
}
