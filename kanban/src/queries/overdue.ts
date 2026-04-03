import { matchesColumn, readAllCards, readColumns } from "./helpers.js";
import type { OverdueCard, QueryOptions } from "./types.js";

export async function overdueCards(options: QueryOptions): Promise<OverdueCard[]> {
  const columns = await readColumns(options.dataDir);
  let cards = await readAllCards(options.dataDir);

  if (options.column) {
    const col = options.column;
    cards = cards.filter((c) => matchesColumn(c, col, columns));
  }

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  const overdue: OverdueCard[] = [];
  for (const card of cards) {
    if (!card.dueDate) continue;
    if (card.dueDate >= todayStr) continue;

    const dueMs = Date.UTC(
      Number(card.dueDate.slice(0, 4)),
      Number(card.dueDate.slice(5, 7)) - 1,
      Number(card.dueDate.slice(8, 10)),
    );
    const todayMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const daysOverdue = Math.round((todayMs - dueMs) / 86_400_000);
    overdue.push({ ...card, daysOverdue });
  }

  // Most overdue first
  overdue.sort((a, b) => b.daysOverdue - a.daysOverdue);
  return overdue;
}
