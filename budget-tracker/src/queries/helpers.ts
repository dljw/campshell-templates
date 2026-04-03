import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import type { Account, Category, Tag, Transaction, Budget } from "./types.js";

export async function readAllFromDir<T>(dataDir: string, subDir: string): Promise<T[]> {
  const dir = path.join(dataDir, subDir);
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

export async function readCollection<T>(
  dataDir: string,
  file: string,
  key: string,
): Promise<T[]> {
  const filePath = path.join(dataDir, file);
  try {
    const raw = await readFile(filePath, "utf-8");
    const data = JSON.parse(raw) as Record<string, T[]>;
    return data[key] ?? [];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw err;
  }
}

export function readAllAccounts(dataDir: string): Promise<Account[]> {
  return readAllFromDir<Account>(dataDir, "accounts");
}

export function readAllTransactions(dataDir: string): Promise<Transaction[]> {
  return readAllFromDir<Transaction>(dataDir, "transactions");
}

export function readAllBudgets(dataDir: string): Promise<Budget[]> {
  return readAllFromDir<Budget>(dataDir, "budgets");
}

export function readCategories(dataDir: string): Promise<Category[]> {
  return readCollection<Category>(dataDir, "categories.json", "categories");
}

export function readTags(dataDir: string): Promise<Tag[]> {
  return readCollection<Tag>(dataDir, "tags.json", "tags");
}
