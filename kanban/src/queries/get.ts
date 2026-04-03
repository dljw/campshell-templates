import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Card, QueryOptions } from "./types.js";
import { NotFoundError } from "./types.js";

const UNSAFE_ID = /[/\\]|\.\./;

export async function getCard(id: string, options: QueryOptions): Promise<Card> {
  if (UNSAFE_ID.test(id)) {
    throw new NotFoundError(`Card not found: ${id}`);
  }
  const filePath = path.join(options.dataDir, "cards", `${id}.json`);
  try {
    const raw = await readFile(filePath, "utf-8");
    return JSON.parse(raw) as Card;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      throw new NotFoundError(`Card not found: ${id}`);
    }
    throw err;
  }
}
