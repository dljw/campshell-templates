import { ArrowDown, ArrowUp } from "lucide-react";
import type { Cycle, KeywordImportAction, ParsedGscData } from "../types.js";

interface ImportPreviewProps {
	parsed: ParsedGscData;
	keywordActions: KeywordImportAction[];
	previousCycle: Cycle | null;
}

function Delta({ current, previous, invert }: { current: number; previous: number; invert?: boolean }) {
	if (previous === 0) return null;
	const pct = ((current - previous) / previous) * 100;
	const isPositive = invert ? pct < 0 : pct > 0;
	return (
		<span className={`inline-flex items-center text-xs ml-1 ${isPositive ? "text-green-600" : "text-red-500"}`}>
			{isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
			{Math.abs(pct).toFixed(1)}%
		</span>
	);
}

export function ImportPreview({ parsed, keywordActions, previousCycle }: ImportPreviewProps) {
	const updates = keywordActions.filter((a) => a.type === "update").length;
	const creates = keywordActions.filter((a) => a.type === "create").length;

	const quadrantCounts: Record<string, number> = {};
	for (const action of keywordActions) {
		quadrantCounts[action.quadrant] = (quadrantCounts[action.quadrant] ?? 0) + 1;
	}

	return (
		<div className="space-y-4">
			{/* Date range */}
			<div className="text-sm">
				<span className="text-muted-foreground">Period: </span>
				<span className="font-medium">{parsed.periodStart || "Unknown"} – {parsed.periodEnd || "Unknown"}</span>
			</div>

			{/* Sitewide metrics */}
			<div className="grid grid-cols-4 gap-3">
				<div className="rounded-lg border border-border p-3">
					<p className="text-xs text-muted-foreground">Impressions</p>
					<p className="text-lg font-bold">
						{parsed.sitewide.impressions.toLocaleString()}
						{previousCycle?.sitewide && (
							<Delta current={parsed.sitewide.impressions} previous={previousCycle.sitewide.impressions} />
						)}
					</p>
				</div>
				<div className="rounded-lg border border-border p-3">
					<p className="text-xs text-muted-foreground">Clicks</p>
					<p className="text-lg font-bold">
						{parsed.sitewide.clicks.toLocaleString()}
						{previousCycle?.sitewide && (
							<Delta current={parsed.sitewide.clicks} previous={previousCycle.sitewide.clicks} />
						)}
					</p>
				</div>
				<div className="rounded-lg border border-border p-3">
					<p className="text-xs text-muted-foreground">CTR</p>
					<p className="text-lg font-bold">{parsed.sitewide.ctr.toFixed(2)}%</p>
				</div>
				<div className="rounded-lg border border-border p-3">
					<p className="text-xs text-muted-foreground">Avg Position</p>
					<p className="text-lg font-bold">
						{parsed.sitewide.avgPosition.toFixed(1)}
						{previousCycle?.sitewide && (
							<Delta current={parsed.sitewide.avgPosition} previous={previousCycle.sitewide.avgPosition} invert />
						)}
					</p>
				</div>
			</div>

			{/* Trend */}
			{parsed.dailyTrend && (
				<div className="text-sm">
					<span className="text-muted-foreground">Trajectory: </span>
					<span className={`font-medium ${
						parsed.dailyTrend.trajectory === "growing" ? "text-green-600" :
						parsed.dailyTrend.trajectory === "declining" ? "text-red-500" : ""
					}`}>
						{parsed.dailyTrend.trajectory}
					</span>
					<span className="text-muted-foreground ml-2">
						({parsed.dailyTrend.firstHalfAvg} → {parsed.dailyTrend.secondHalfAvg} avg impr/day)
					</span>
				</div>
			)}

			{/* Counts */}
			<div className="grid grid-cols-2 gap-3 text-sm">
				<div className="rounded-lg border border-border p-3">
					<p className="text-muted-foreground">Queries</p>
					<p className="font-medium">{parsed.querySnapshots.length} total</p>
				</div>
				<div className="rounded-lg border border-border p-3">
					<p className="text-muted-foreground">Pages</p>
					<p className="font-medium">{parsed.pageSnapshots.length} total</p>
				</div>
			</div>

			{/* Keyword actions summary */}
			<div className="rounded-lg border border-border p-3">
				<p className="text-sm text-muted-foreground mb-2">Keyword Changes</p>
				<div className="flex gap-4 text-sm">
					<span className="text-blue-600 font-medium">{updates} updated</span>
					<span className="text-green-600 font-medium">{creates} new</span>
				</div>
				{Object.keys(quadrantCounts).length > 0 && (
					<div className="flex flex-wrap gap-2 mt-2">
						{Object.entries(quadrantCounts).map(([q, count]) => (
							<span key={q} className="text-xs bg-muted rounded-full px-2 py-0.5">
								{q}: {count}
							</span>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
