import { readHubs } from "./helpers.js";
import type { Hub, QueryOptions } from "./types.js";

export async function listHubs(options: QueryOptions): Promise<Hub[]> {
	return readHubs(options.dataDir);
}
