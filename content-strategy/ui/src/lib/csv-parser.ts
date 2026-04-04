import Papa from "papaparse";
import type { Keyword, KeywordImportAction, ParsedGscData, Trajectory } from "../types.js";
import { classifyQuadrant } from "./quadrant-classifier.js";

// ---------------------------------------------------------------------------
// CSV row types
// ---------------------------------------------------------------------------

interface QueryRow {
	"Top queries": string;
	Clicks: string;
	Impressions: string;
	CTR: string;
	Position: string;
}

interface PageRow {
	"Top pages": string;
	Clicks: string;
	Impressions: string;
	CTR: string;
	Position: string;
}

interface ChartRow {
	Date: string;
	Clicks: string;
	Impressions: string;
	CTR: string;
	Position: string;
}

interface FilterRow {
	Filter: string;
	Value: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseCtr(raw: string): number {
	if (!raw || raw === "") return 0;
	return Number.parseFloat(raw.replace("%", "")) || 0;
}

function parseNum(raw: string): number {
	if (!raw || raw === "") return 0;
	return Number.parseFloat(raw) || 0;
}

function parseFile<T>(file: File): Promise<T[]> {
	return new Promise((resolve, reject) => {
		Papa.parse<T>(file, {
			header: true,
			skipEmptyLines: true,
			complete: (result) => resolve(result.data),
			error: (err: Error) => reject(err),
		});
	});
}

export function slugifyQuery(query: string): string {
	return query
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "")
		.slice(0, 36);
}

// ---------------------------------------------------------------------------
// Main parse function
// ---------------------------------------------------------------------------

export interface GscFileSet {
	queries: File;
	pages: File;
	chart?: File;
	filters?: File;
}

export async function parseGscCsvs(files: GscFileSet): Promise<ParsedGscData> {
	const [queryRows, pageRows] = await Promise.all([
		parseFile<QueryRow>(files.queries),
		parseFile<PageRow>(files.pages),
	]);

	const chartRows = files.chart ? await parseFile<ChartRow>(files.chart) : [];
	const filterRows = files.filters ? await parseFile<FilterRow>(files.filters) : [];

	// Sitewide totals from queries
	let totalImpressions = 0;
	let totalClicks = 0;
	let weightedPositionSum = 0;

	for (const row of queryRows) {
		const impr = parseNum(row.Impressions);
		const clicks = parseNum(row.Clicks);
		const position = parseNum(row.Position);
		totalImpressions += impr;
		totalClicks += clicks;
		weightedPositionSum += position * impr;
	}

	const avgPosition = totalImpressions > 0 ? weightedPositionSum / totalImpressions : 0;
	const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

	// Page snapshots
	const pageSnapshots = pageRows.map((row) => ({
		pageUrl: row["Top pages"],
		impressions: parseNum(row.Impressions),
		clicks: parseNum(row.Clicks),
		ctr: parseCtr(row.CTR),
		position: parseNum(row.Position),
	}));

	// Query snapshots
	const querySnapshots = queryRows.map((row) => ({
		query: row["Top queries"],
		impressions: parseNum(row.Impressions),
		clicks: parseNum(row.Clicks),
		position: parseNum(row.Position),
	}));

	// Date range
	let periodStart = "";
	let periodEnd = "";

	if (chartRows.length > 0) {
		const dates = chartRows.map((r) => r.Date).filter(Boolean).sort();
		periodStart = dates[0] ?? "";
		periodEnd = dates[dates.length - 1] ?? "";
	}

	// If no chart data, try to infer from filters
	if (!periodStart && filterRows.length > 0) {
		const dateFilter = filterRows.find((r) => r.Filter === "Date");
		if (dateFilter?.Value?.includes("28")) {
			const end = new Date();
			const start = new Date(end);
			start.setDate(start.getDate() - 28);
			periodStart = start.toISOString().split("T")[0];
			periodEnd = end.toISOString().split("T")[0];
		}
	}

	// Daily trend from chart
	let dailyTrend: ParsedGscData["dailyTrend"];
	if (chartRows.length > 0) {
		const dailyImpressions = chartRows.map((r) => parseNum(r.Impressions));
		const mid = Math.floor(dailyImpressions.length / 2);
		const firstHalf = dailyImpressions.slice(0, mid);
		const secondHalf = dailyImpressions.slice(mid);
		const last7 = dailyImpressions.slice(-7);

		const avg = (arr: number[]) => (arr.length > 0 ? arr.reduce((s, v) => s + v, 0) / arr.length : 0);
		const firstHalfAvg = avg(firstHalf);
		const secondHalfAvg = avg(secondHalf);
		const last7dAvg = avg(last7);

		let trajectory: Trajectory = "stable";
		if (secondHalfAvg > firstHalfAvg * 1.2) trajectory = "growing";
		else if (secondHalfAvg < firstHalfAvg * 0.8) trajectory = "declining";

		dailyTrend = {
			firstHalfAvg: Math.round(firstHalfAvg * 10) / 10,
			secondHalfAvg: Math.round(secondHalfAvg * 10) / 10,
			trajectory,
			last7dAvg: Math.round(last7dAvg * 10) / 10,
		};
	}

	return {
		periodStart,
		periodEnd,
		sitewide: {
			impressions: totalImpressions,
			clicks: totalClicks,
			ctr: Math.round(ctr * 100) / 100,
			avgPosition: Math.round(avgPosition * 100) / 100,
		},
		pageSnapshots,
		querySnapshots,
		dailyTrend,
	};
}

// ---------------------------------------------------------------------------
// Keyword matching and import action generation
// ---------------------------------------------------------------------------

export function buildKeywordActions(
	querySnapshots: ParsedGscData["querySnapshots"],
	existingKeywords: Keyword[],
): KeywordImportAction[] {
	const actions: KeywordImportAction[] = [];
	const existingByTerm = new Map<string, Keyword>();
	for (const kw of existingKeywords) {
		existingByTerm.set(kw.term.toLowerCase(), kw);
	}

	for (const qs of querySnapshots) {
		const termLower = qs.query.toLowerCase();
		const existing = existingByTerm.get(termLower);
		const quadrant = classifyQuadrant({
			position: qs.position,
			impressions: qs.impressions,
			ctr: qs.impressions > 0 ? (qs.clicks / qs.impressions) * 100 : 0,
		});

		if (existing) {
			actions.push({
				type: "update",
				keywordId: existing.id,
				term: existing.term,
				impressions: qs.impressions,
				clicks: qs.clicks,
				ctr: qs.impressions > 0 ? Math.round((qs.clicks / qs.impressions) * 10000) / 100 : 0,
				position: qs.position,
				previousPosition: existing.position,
				quadrant,
			});
		} else {
			actions.push({
				type: "create",
				keywordId: slugifyQuery(qs.query),
				term: qs.query,
				impressions: qs.impressions,
				clicks: qs.clicks,
				ctr: qs.impressions > 0 ? Math.round((qs.clicks / qs.impressions) * 10000) / 100 : 0,
				position: qs.position,
				quadrant,
			});
		}
	}

	return actions;
}

// ---------------------------------------------------------------------------
// File validation
// ---------------------------------------------------------------------------

export function identifyGscFile(file: File): "queries" | "pages" | "chart" | "filters" | null {
	const name = file.name.toLowerCase();
	if (name.includes("queries") || name === "queries.csv") return "queries";
	if (name.includes("pages") || name === "pages.csv") return "pages";
	if (name.includes("chart") || name === "chart.csv") return "chart";
	if (name.includes("filters") || name === "filters.csv") return "filters";
	return null;
}
