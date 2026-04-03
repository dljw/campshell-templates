import { readAllTransactions } from "./helpers.js";
import type { QueryOptions, TransactionSearchResult } from "./types.js";

export async function searchTransactions(
  term: string,
  options: QueryOptions,
): Promise<TransactionSearchResult[]> {
  const transactions = await readAllTransactions(options.dataDir);
  const lower = term.toLowerCase();
  const results: TransactionSearchResult[] = [];

  for (const t of transactions) {
    const matchedIn: ("description" | "notes")[] = [];
    if (t.description.toLowerCase().includes(lower)) matchedIn.push("description");
    if (t.notes?.toLowerCase().includes(lower)) matchedIn.push("notes");
    if (matchedIn.length > 0) {
      results.push({
        id: t.id,
        description: t.description,
        amount: t.amount,
        date: t.date,
        type: t.type,
        matchedIn,
      });
    }
  }

  return results.sort((a, b) => b.date.localeCompare(a.date));
}
