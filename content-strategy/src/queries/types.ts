export interface QueryOptions {
	dataDir: string;
	status?: string;
	contentType?: string;
	hubId?: string;
	phase?: string;
	priority?: string;
	articleId?: string;
	intent?: string;
	quadrant?: string;
	keywordStatus?: string;
	type?: string;
	cycleId?: string;
}

export interface Article {
	id: string;
	createdAt: string;
	updatedAt?: string;
	title: string;
	slug: string;
	pageUrl?: string;
	status: "idea" | "planned" | "briefed" | "drafting" | "review" | "published" | "optimizing" | "needs-refresh";
	contentType?: "pillar" | "cluster" | "standalone" | "comparison" | "update";
	hubId?: string;
	primaryKeyword?: string;
	wordCount?: number;
	publishDate?: string;
	scheduledDate?: string;
	lastOptimized?: string;
	phase?: "phase-1" | "phase-2" | "phase-3";
	priority?: "high" | "medium" | "low";
	notes?: string;
}

export interface Keyword {
	id: string;
	createdAt: string;
	updatedAt?: string;
	term: string;
	articleId?: string;
	searchVolume?: number;
	keywordDifficulty?: number;
	cpc?: number;
	intent?: "informational" | "navigational" | "commercial" | "transactional";
	targetSection?: string;
	occurrences?: number;
	impressions?: number;
	clicks?: number;
	ctr?: number;
	position?: number;
	previousPosition?: number;
	quadrant?: "star" | "quick-win" | "ctr-opportunity" | "long-term-target" | "early-signal" | "dog";
	status?: "tracking" | "paused" | "achieved";
}

export interface Hub {
	id: string;
	createdAt: string;
	name: string;
	description?: string;
	pillarArticleId?: string;
	color?: "red" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "gray";
	status?: "planning" | "active" | "complete";
}

export interface Cycle {
	id: string;
	createdAt: string;
	cycleDate: string;
	periodStart: string;
	periodEnd: string;
	sitewide?: {
		impressions: number;
		clicks: number;
		ctr: number;
		avgPosition: number;
	};
	dailyTrend?: {
		firstHalfAvg: number;
		secondHalfAvg: number;
		trajectory: "growing" | "stable" | "declining";
		last7dAvg: number;
	};
	quadrantCounts?: {
		stars: number;
		quickWins: number;
		ctrOpportunities: number;
		longTermTargets: number;
		earlySignals: number;
		dogs: number;
	};
	pageSnapshots?: Array<{
		pageUrl: string;
		impressions: number;
		clicks: number;
		ctr: number;
		position: number;
		indexed?: boolean;
	}>;
	querySnapshots?: Array<{
		query: string;
		impressions: number;
		clicks: number;
		position: number;
		pageUrl?: string;
	}>;
	notIndexedPages?: string[];
	cannibalizationWarnings?: number;
	notes?: string;
}

export interface Action {
	id: string;
	createdAt: string;
	updatedAt?: string;
	cycleId?: string;
	type?: "keyword-addition" | "meta-rewrite" | "content-expansion" | "internal-linking" | "cannibalization-fix" | "technical" | "new-content" | "other";
	status: "planned" | "in-progress" | "done" | "deferred" | "cancelled";
	priority?: "high" | "medium" | "low";
	description: string;
	articleIds?: string[];
	expectedOutcome?: {
		metric?: "position" | "ctr" | "impressions" | "clicks" | "new-query" | "consolidation";
		direction?: "improve" | "maintain";
		baselineValue?: number;
		watchQueries?: string[];
	};
	actualOutcome?: {
		metric?: string;
		beforeValue?: number;
		afterValue?: number;
		measuredAt?: string;
		notes?: string;
	} | null;
	deferredReason?: string;
}

export interface Competitor {
	id: string;
	createdAt: string;
	domain: string;
	estimatedTraffic?: number;
	topPages?: Array<{
		url: string;
		traffic: number;
		keywordsCount?: number;
	}>;
	contentThemes?: string[];
	notes?: string;
}

export interface OverviewStats {
	totalImpressions: number;
	totalClicks: number;
	avgPosition: number;
	ctr: number;
	articlesByStatus: Record<string, number>;
	totalKeywords: number;
	quadrantDistribution: Record<string, number>;
	totalActions: number;
	actionsByStatus: Record<string, number>;
}

export class NotFoundError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "NotFoundError";
	}
}
