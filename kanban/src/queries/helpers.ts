import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import type { Card, Column } from "./types.js";

export async function readAllCards(dataDir: string): Promise<Card[]> {
  const cardsDir = path.join(dataDir, "cards");
  let files: string[];
  try {
    files = await readdir(cardsDir);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw err;
  }

  const cards: Card[] = [];
  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    try {
      const raw = await readFile(path.join(cardsDir, file), "utf-8");
      cards.push(JSON.parse(raw) as Card);
    } catch {
      // Skip unparseable files
    }
  }
  return cards;
}

export async function readColumns(dataDir: string): Promise<Column[]> {
  const filePath = path.join(dataDir, "columns.json");
  try {
    const raw = await readFile(filePath, "utf-8");
    const data = JSON.parse(raw) as { columns: Column[] };
    return data.columns ?? [];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw err;
  }
}

/**
 * Build a map from column id/name (lowercased) to column order.
 * Allows matching filters by either id or display name.
 */
export function buildColumnOrderMap(columns: Column[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const col of columns) {
    map.set(col.id.toLowerCase(), col.order);
    map.set(col.name.toLowerCase(), col.order);
  }
  return map;
}

/**
 * Check if a card matches a column filter (by id or name, case-insensitive).
 */
export function matchesColumn(card: Card, columnFilter: string, columns: Column[]): boolean {
  const filter = columnFilter.toLowerCase();
  // Direct match on card.column (which is the column id)
  if (card.column.toLowerCase() === filter) return true;
  // Match by column name: find the column whose name matches the filter,
  // then check if the card belongs to that column
  const col = columns.find((c) => c.name.toLowerCase() === filter);
  return col !== undefined && card.column === col.id;
}
