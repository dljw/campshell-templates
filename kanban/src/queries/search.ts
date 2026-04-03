import { matchesColumn, readAllCards, readColumns } from "./helpers.js";
import type { QueryOptions, SearchResult } from "./types.js";

export async function searchCards(term: string, options: QueryOptions): Promise<SearchResult[]> {
  const columns = await readColumns(options.dataDir);
  let cards = await readAllCards(options.dataDir);

  if (options.column) {
    const col = options.column;
    cards = cards.filter((c) => matchesColumn(c, col, columns));
  }

  const lowerTerm = term.toLowerCase();
  const results: SearchResult[] = [];

  for (const card of cards) {
    const matchedIn: ("title" | "description")[] = [];

    if (card.title.toLowerCase().includes(lowerTerm)) {
      matchedIn.push("title");
    }
    if (card.description?.toLowerCase().includes(lowerTerm)) {
      matchedIn.push("description");
    }

    if (matchedIn.length > 0) {
      results.push({
        id: card.id,
        title: card.title,
        description: card.description,
        column: card.column,
        matchedIn,
      });
    }
  }

  return results;
}
