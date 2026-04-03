import { readAllCards, readColumns } from "./helpers.js";
import type { ColumnWithCount, QueryOptions } from "./types.js";

export async function listColumns(options: QueryOptions): Promise<ColumnWithCount[]> {
  const columns = await readColumns(options.dataDir);
  const cards = await readAllCards(options.dataDir);

  // Count cards per column
  const counts = new Map<string, number>();
  for (const card of cards) {
    counts.set(card.column, (counts.get(card.column) ?? 0) + 1);
  }

  return columns
    .sort((a, b) => a.order - b.order)
    .map((col) => ({
      ...col,
      cardCount: counts.get(col.id) ?? 0,
    }));
}
