import { Button, Card, CardContent, CardHeader, CardTitle } from "@campshell/ui-components";
import { ArrowDown, ArrowUp, Eye, MousePointerClick, Navigation, FileText, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import type { UseContentStrategyDataReturn } from "../hooks/useContentStrategyData.js";
import type { Cycle } from "../types.js";
import { ImportCycleDialog } from "./ImportCycleDialog.js";
import { QuadrantDonut } from "./QuadrantDonut.js";

interface OverviewViewProps {
	data: UseContentStrategyDataReturn;
}

function MetricCard({
	title,
	value,
	icon,
	delta,
	invertDelta,
}: {
	title: string;
	value: string;
	icon: React.ReactNode;
	delta?: number;
	invertDelta?: boolean;
}) {
	const isPositive = invertDelta ? (delta ?? 0) < 0 : (delta ?? 0) > 0;
	return (
		<Card>
			<CardContent className="pt-6">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm text-muted-foreground">{title}</p>
						<p className="text-2xl font-bold mt-1">{value}</p>
						{delta != null && delta !== 0 && (
							<p className={`text-xs mt-1 flex items-center gap-0.5 ${isPositive ? "text-green-600" : "text-red-500"}`}>
								{isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
								{Math.abs(delta).toFixed(1)}%
							</p>
						)}
					</div>
					<div className="text-muted-foreground">{icon}</div>
				</div>
			</CardContent>
		</Card>
	);
}

function getLatestTwoCycles(cycles: Cycle[]): [Cycle | null, Cycle | null] {
	const sorted = [...cycles].sort((a, b) => b.cycleDate.localeCompare(a.cycleDate));
	return [sorted[0] ?? null, sorted[1] ?? null];
}

function pctChange(current: number, previous: number): number {
	if (previous === 0) return current > 0 ? 100 : 0;
	return ((current - previous) / previous) * 100;
}

export function OverviewView({ data }: OverviewViewProps) {
	const [importOpen, setImportOpen] = useState(false);
	const [latestCycle, prevCycle] = useMemo(() => getLatestTwoCycles(data.cycles), [data.cycles]);

	const quadrantCounts = useMemo(() => {
		const counts: Record<string, number> = {};
		for (const kw of data.keywords) {
			if (kw.quadrant) {
				counts[kw.quadrant] = (counts[kw.quadrant] ?? 0) + 1;
			}
		}
		return counts;
	}, [data.keywords]);

	const pipelineSummary = useMemo(() => {
		const published = data.articles.filter((a) => a.status === "published" || a.status === "optimizing").length;
		const inProgress = data.articles.filter((a) => ["drafting", "review", "briefed"].includes(a.status)).length;
		const planned = data.articles.filter((a) => ["idea", "planned"].includes(a.status)).length;
		return `${published}P ${inProgress}D ${planned}Q`;
	}, [data.articles]);

	const impressions = latestCycle?.sitewide?.impressions ?? 0;
	const clicks = latestCycle?.sitewide?.clicks ?? 0;
	const avgPos = latestCycle?.sitewide?.avgPosition ?? 0;
	const prevImpressions = prevCycle?.sitewide?.impressions;
	const prevClicks = prevCycle?.sitewide?.clicks;
	const prevPos = prevCycle?.sitewide?.avgPosition;

	const recentActions = useMemo(() => {
		return [...data.actions]
			.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
			.slice(0, 5);
	}, [data.actions]);

	return (
		<div className="space-y-6">
			{/* Header with import button */}
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-semibold">Overview</h2>
				<Button variant="outline" size="sm" onClick={() => setImportOpen(true)} className="gap-1.5">
					<Upload className="h-4 w-4" />
					Import GSC Cycle
				</Button>
			</div>

			{/* Metric Cards */}
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
				<MetricCard
					title="Impressions"
					value={impressions.toLocaleString()}
					icon={<Eye className="h-5 w-5" />}
					delta={prevImpressions != null ? pctChange(impressions, prevImpressions) : undefined}
				/>
				<MetricCard
					title="Clicks"
					value={clicks.toLocaleString()}
					icon={<MousePointerClick className="h-5 w-5" />}
					delta={prevClicks != null ? pctChange(clicks, prevClicks) : undefined}
				/>
				<MetricCard
					title="Avg Position"
					value={avgPos.toFixed(1)}
					icon={<Navigation className="h-5 w-5" />}
					delta={prevPos != null ? pctChange(avgPos, prevPos) : undefined}
					invertDelta
				/>
				<MetricCard
					title="Pipeline"
					value={pipelineSummary}
					icon={<FileText className="h-5 w-5" />}
				/>
			</div>

			{/* Two-column layout */}
			<div className="grid lg:grid-cols-2 gap-6">
				{/* Recent Actions */}
				<Card>
					<CardHeader>
						<CardTitle className="text-sm font-medium">Recent Actions</CardTitle>
					</CardHeader>
					<CardContent>
						{recentActions.length === 0 ? (
							<p className="text-sm text-muted-foreground">No actions yet</p>
						) : (
							<ul className="space-y-2">
								{recentActions.map((action) => (
									<li key={action.id} className="flex items-center gap-2 text-sm">
										<span
											className={`h-2 w-2 rounded-full shrink-0 ${
												action.status === "done"
													? "bg-green-500"
													: action.status === "in-progress"
														? "bg-yellow-500"
														: action.status === "deferred"
															? "bg-orange-500"
															: "bg-muted-foreground"
											}`}
										/>
										<span className="truncate">{action.description}</span>
										<span className="text-xs text-muted-foreground ml-auto shrink-0">
											{action.status}
										</span>
									</li>
								))}
							</ul>
						)}
					</CardContent>
				</Card>

				{/* Quadrant Summary */}
				<Card>
					<CardHeader>
						<CardTitle className="text-sm font-medium">Keyword Quadrants</CardTitle>
					</CardHeader>
					<CardContent>
						<QuadrantDonut counts={quadrantCounts} total={data.keywords.length} />
					</CardContent>
				</Card>
			</div>

			{/* Trend info */}
			{latestCycle?.dailyTrend && (
				<Card>
					<CardHeader>
						<CardTitle className="text-sm font-medium">Daily Trend</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-6 text-sm">
							<div>
								<span className="text-muted-foreground">Trajectory: </span>
								<span className={`font-medium ${
									latestCycle.dailyTrend.trajectory === "growing" ? "text-green-600" :
									latestCycle.dailyTrend.trajectory === "declining" ? "text-red-500" : ""
								}`}>
									{latestCycle.dailyTrend.trajectory}
								</span>
							</div>
							<div>
								<span className="text-muted-foreground">1st half avg: </span>
								<span className="font-medium">{latestCycle.dailyTrend.firstHalfAvg.toFixed(1)}</span>
							</div>
							<div>
								<span className="text-muted-foreground">2nd half avg: </span>
								<span className="font-medium">{latestCycle.dailyTrend.secondHalfAvg.toFixed(1)}</span>
							</div>
							<div>
								<span className="text-muted-foreground">Last 7d avg: </span>
								<span className="font-medium">{latestCycle.dailyTrend.last7dAvg.toFixed(1)}</span>
							</div>
						</div>
					</CardContent>
				</Card>
			)}
			<ImportCycleDialog open={importOpen} onOpenChange={setImportOpen} data={data} />
		</div>
	);
}
