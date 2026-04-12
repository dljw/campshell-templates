export type Color = "red" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "gray";

export type ArticleStatus = "idea" | "planned" | "briefed" | "drafting" | "review" | "published" | "optimizing" | "needs-refresh";
export type ContentType = "pillar" | "cluster" | "standalone" | "comparison" | "update";
export type Phase = "phase-1" | "phase-2" | "phase-3";
export type Priority = "high" | "medium" | "low";
export type Intent = "informational" | "navigational" | "commercial" | "transactional";
export type Quadrant = "star" | "quick-win" | "ctr-opportunity" | "long-term-target" | "early-signal" | "dog";
export type ActionType = "keyword-addition" | "meta-rewrite" | "content-expansion" | "internal-linking" | "cannibalization-fix" | "technical" | "new-content" | "other";
export type ActionStatus = "planned" | "in-progress" | "done" | "deferred" | "cancelled";
export type HubStatus = "planning" | "active" | "complete";
export type Trajectory = "growing" | "stable" | "declining";

export interface Article {
	id: string;
	createdAt: string;
	updatedAt?: string;
	title: string;
	slug: string;
	pageUrl?: string;
	status: ArticleStatus;
	contentType?: ContentType;
	hubId?: string;
	primaryKeyword?: string;
	wordCount?: number;
	publishDate?: string;
	scheduledDate?: string;
	lastOptimized?: string;
	phase?: Phase;
	priority?: Priority;
	filePath?: string;
	domainId?: string;
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
	intent?: Intent;
	targetSection?: string;
	occurrences?: number;
	impressions?: number;
	clicks?: number;
	ctr?: number;
	position?: number;
	previousPosition?: number;
	quadrant?: Quadrant;
	status?: "tracking" | "paused" | "achieved";
	domainId?: string;
}

export interface Hub {
	id: string;
	createdAt: string;
	name: string;
	description?: string;
	pillarArticleId?: string;
	color?: Color;
	status?: HubStatus;
	domainId?: string;
}

export interface HubsCollection {
	hubs: Hub[];
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
		trajectory: Trajectory;
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
	domainId?: string;
}

export interface Action {
	id: string;
	createdAt: string;
	updatedAt?: string;
	cycleId?: string;
	type?: ActionType;
	status: ActionStatus;
	priority?: Priority;
	description: string;
	articleIds?: string[];
	expectedOutcome?: {
		metric?: string;
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
	domainId?: string;
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
	domainId?: string;
}

export interface ArticleFormatSection {
	name: string;
	description?: string;
	required?: boolean;
	guidanceNotes?: string;
}

export interface ArticleFormat {
	name?: string;
	sections?: ArticleFormatSection[];
	defaultWordCount?: number;
	frontmatterFields?: string[];
}

export interface Domain {
	id: string;
	createdAt: string;
	name: string;
	domain?: string;
	basePath?: string;
	isDefault?: boolean;
	articlesDir?: string;
	articleFormat?: ArticleFormat;
}

export interface DomainsCollection {
	domains: Domain[];
}

export interface CompetitorsCollection {
	competitors: Competitor[];
}

export interface ParsedGscData {
	periodStart: string;
	periodEnd: string;
	sitewide: {
		impressions: number;
		clicks: number;
		ctr: number;
		avgPosition: number;
	};
	pageSnapshots: Array<{
		pageUrl: string;
		impressions: number;
		clicks: number;
		ctr: number;
		position: number;
	}>;
	querySnapshots: Array<{
		query: string;
		impressions: number;
		clicks: number;
		position: number;
	}>;
	dailyTrend?: {
		firstHalfAvg: number;
		secondHalfAvg: number;
		trajectory: Trajectory;
		last7dAvg: number;
	};
}

export interface KeywordImportAction {
	type: "update" | "create";
	keywordId: string;
	term: string;
	impressions: number;
	clicks: number;
	ctr: number;
	position: number;
	previousPosition?: number;
	quadrant: Quadrant;
}

export interface ValidationErrorDetail {
	template: string;
	file: string;
	errors: Array<{
		keyword: string;
		message?: string;
		instancePath: string;
		params?: Record<string, unknown>;
	}>;
}
