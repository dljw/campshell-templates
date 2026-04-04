import { readCategories } from "./helpers.js";
import type { Category, QueryOptions } from "./types.js";

export async function listCategories(options: QueryOptions): Promise<Category[]> {
	return readCategories(options.dataDir);
}
