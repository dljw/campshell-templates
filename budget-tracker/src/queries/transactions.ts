import { readFile } from "node:fs/promises";
import path from "node:path";
import { readAllTransactions } from "./helpers.js";
import { NotFoundError } from "./types.js";
import type { QueryOptions, Transaction } from "./types.js";

export async function listTransactions(options: QueryOptions): Promise<Transaction[]> {
  const transactions = await readAllTransactions(options.dataDir);

  let filtered = transactions;

  if (options.type) {
    filtered = filtered.filter((t) => t.type === options.type);
  }
  if (options.categoryId) {
    filtered = filtered.filter((t) => t.categoryId === options.categoryId);
  }
  if (options.accountId) {
    filtered = filtered.filter(
      (t) => t.sourceAccountId === options.accountId || t.destinationAccountId === options.accountId,
    );
  }
  if (options.from) {
    filtered = filtered.filter((t) => t.date >= options.from!);
  }
  if (options.to) {
    filtered = filtered.filter((t) => t.date <= options.to!);
  }

  return filtered.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getTransaction(id: string, options: QueryOptions): Promise<Transaction> {
  const filePath = path.join(options.dataDir, "transactions", `${id}.json`);
  try {
    const raw = await readFile(filePath, "utf-8");
    return JSON.parse(raw) as Transaction;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      throw new NotFoundError(`Transaction not found: ${id}`);
    }
    throw err;
  }
}
