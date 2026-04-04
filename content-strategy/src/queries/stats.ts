import { readAllActions, readAllArticles, readAllKeywords } from "./helpers.js";
import type { OverviewStats, QueryOptions } from "./types.js";

export async function getStats(options: QueryOptions): Promise<OverviewStats> {
	const [articles, keywords, actions] = await Promise.all([
		readAllArticles(options.dataDir),
		readAllKeywords(options.dataDir),
		readAllActions(options.dataDir),
	]);

	const totalImpressions = keywords.reduce((sum, k) => sum + (k.impressions ?? 0), 0);
	const totalClicks = keywords.reduce((sum, k) => sum + (k.clicks ?? 0), 0);
	const keywordsWithPosition = keywords.filter((k) => k.position != null && k.position > 0);
	const avgPosition =
		keywordsWithPosition.length > 0
			? keywordsWithPosition.reduce((sum, k) => sum + (k.position ?? 0), 0) / keywordsWithPosition.length
			: 0;
	const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

	const articlesByStatus: Record<string, number> = {};
	for (const article of articles) {
		articlesByStatus[article.status] = (articlesByStatus[article.status] ?? 0) + 1;
	}

	const quadrantDistribution: Record<string, number> = {};
	for (const keyword of keywords) {
		if (keyword.quadrant) {
			quadrantDistribution[keyword.quadrant] = (quadrantDistribution[keyword.quadrant] ?? 0) + 1;
		}
	}

	const actionsByStatus: Record<string, number> = {};
	for (const action of actions) {
		actionsByStatus[action.status] = (actionsByStatus[action.status] ?? 0) + 1;
	}

	return {
		totalImpressions,
		totalClicks,
		avgPosition: Math.round(avgPosition * 100) / 100,
		ctr: Math.round(ctr * 100) / 100,
		articlesByStatus,
		totalKeywords: keywords.length,
		quadrantDistribution,
		totalActions: actions.length,
		actionsByStatus,
	};
}
