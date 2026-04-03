import { buildColumnOrderMap, matchesColumn, readAllCards, readColumns } from "./helpers.js";
import type { Card, QueryOptions } from "./types.js";

export async function listCards(options: QueryOptions): Promise<Card[]> {
  const columns = await readColumns(options.dataDir);
  let cards = await readAllCards(options.dataDir);

  if (options.column) {
    const col = options.column;
    cards = cards.filter((c) => matchesColumn(c, col, columns));
  }

  if (options.priority) {
    const p = options.priority.toLowerCase();
    cards = cards.filter((c) => c.priority !== undefined && c.priority.toLowerCase() === p);
  }

  const orderMap = buildColumnOrderMap(columns);

  cards.sort((a, b) => {
    const colA = orderMap.get(a.column.toLowerCase()) ?? Number.MAX_SAFE_INTEGER;
    const colB = orderMap.get(b.column.toLowerCase()) ?? Number.MAX_SAFE_INTEGER;
    if (colA !== colB) return colA - colB;
    return (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER);
  });

  return cards;
}
