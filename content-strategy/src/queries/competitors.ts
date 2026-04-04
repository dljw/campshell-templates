import { readCompetitors } from "./helpers.js";
import type { Competitor, QueryOptions } from "./types.js";

export async function listCompetitors(options: QueryOptions): Promise<Competitor[]> {
	return readCompetitors(options.dataDir);
}
