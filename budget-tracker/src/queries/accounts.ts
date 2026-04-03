import { readFile } from "node:fs/promises";
import path from "node:path";
import { readAllAccounts } from "./helpers.js";
import { NotFoundError } from "./types.js";
import type { Account, QueryOptions } from "./types.js";

export async function listAccounts(options: QueryOptions): Promise<Account[]> {
  const accounts = await readAllAccounts(options.dataDir);

  let filtered = accounts;
  if (options.type) {
    filtered = filtered.filter((a) => a.type === options.type);
  }

  return filtered.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getAccount(id: string, options: QueryOptions): Promise<Account> {
  const filePath = path.join(options.dataDir, "accounts", `${id}.json`);
  try {
    const raw = await readFile(filePath, "utf-8");
    return JSON.parse(raw) as Account;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      throw new NotFoundError(`Account not found: ${id}`);
    }
    throw err;
  }
}
