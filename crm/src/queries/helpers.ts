import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import type { Activity, Contact, Deal } from "./types.js";

async function readAllFromDir<T>(dataDir: string, subdir: string): Promise<T[]> {
  const dir = path.join(dataDir, subdir);
  let files: string[];
  try {
    files = await readdir(dir);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw err;
  }

  const items: T[] = [];
  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    try {
      const raw = await readFile(path.join(dir, file), "utf-8");
      items.push(JSON.parse(raw) as T);
    } catch {
      // Skip unparseable files
    }
  }
  return items;
}

export function readAllContacts(dataDir: string): Promise<Contact[]> {
  return readAllFromDir<Contact>(dataDir, "contacts");
}

export function readAllDeals(dataDir: string): Promise<Deal[]> {
  return readAllFromDir<Deal>(dataDir, "deals");
}

export function readAllActivities(dataDir: string): Promise<Activity[]> {
  return readAllFromDir<Activity>(dataDir, "activities");
}
