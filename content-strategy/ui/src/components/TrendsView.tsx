import { Card, CardContent, CardHeader, CardTitle } from "@campshell/ui-components";
import { useMemo } from "react";
import {
	LineChart,
	Line,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	Legend,
} from "recharts";
import type { UseContentStrategyDataReturn } from "../hooks/useContentStrategyData.js";

interface TrendsViewProps {
	data: UseContentStrategyDataReturn;
}

export function TrendsView({ data }: TrendsViewProps) {
	// Cycle-over-cycle data for line chart
	const cycleData = useMemo(() => {
		return [...data.cycles]
			.sort((a, b) => a.cycleDate.localeCompare(b.cycleDate))
			.map((c) => ({
				cycle: c.cycleDate,
				impressions: c.sitewide?.impressions ?? 0,
				clicks: c.sitewide?.clicks ?? 0,
				avgPosition: c.sitewide?.avgPosition ?? 0,
				ctr: c.sitewide?.ctr ?? 0,
			}));
	}, [data.cycles]);

	// Position distribution
	const positionBuckets = useMemo(() => {
		const buckets = { "1-3": 0, "4-10": 0, "11-20": 0, "21-50": 0, "50+": 0 };
		for (const kw of data.keywords) {
			const pos = kw.position;
			if (pos == null || pos === 0) continue;
			if (pos <= 3) buckets["1-3"]++;
			else if (pos <= 10) buckets["4-10"]++;
			else if (pos <= 20) buckets["11-20"]++;
			else if (pos <= 50) buckets["21-50"]++;
			else buckets["50+"]++;
		}
		return Object.entries(buckets).map(([range, count]) => ({ range, count }));
	}, [data.keywords]);

	// CTR by position bucket
	const ctrByPosition = useMemo(() => {
		const buckets: Record<string, { totalCtr: number; count: number }> = {
			"1-3": { totalCtr: 0, count: 0 },
			"4-10": { totalCtr: 0, count: 0 },
			"11-20": { totalCtr: 0, count: 0 },
			"21-50": { totalCtr: 0, count: 0 },
			"50+": { totalCtr: 0, count: 0 },
		};
		for (const kw of data.keywords) {
			const pos = kw.position;
			if (pos == null || pos === 0 || kw.ctr == null) continue;
			let bucket: string;
			if (pos <= 3) bucket = "1-3";
			else if (pos <= 10) bucket = "4-10";
			else if (pos <= 20) bucket = "11-20";
			else if (pos <= 50) bucket = "21-50";
			else bucket = "50+";
			buckets[bucket].totalCtr += kw.ctr;
			buckets[bucket].count++;
		}
		return Object.entries(buckets).map(([range, { totalCtr, count }]) => ({
			range,
			avgCtr: count > 0 ? Math.round((totalCtr / count) * 100) / 100 : 0,
		}));
	}, [data.keywords]);

	// Quadrant trend across cycles
	const quadrantTrend = useMemo(() => {
		return [...data.cycles]
			.sort((a, b) => a.cycleDate.localeCompare(b.cycleDate))
			.filter((c) => c.quadrantCounts)
			.map((c) => ({
				cycle: c.cycleDate,
				...c.quadrantCounts,
			}));
	}, [data.cycles]);

	const hasData = data.cycles.length > 0 || data.keywords.length > 0;

	if (!hasData) {
		return (
			<div className="space-y-4">
				<h2 className="text-lg font-semibold">Trends</h2>
				<p className="text-sm text-muted-foreground">No cycle or keyword data yet. Create a GSC analysis cycle to see trends.</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<h2 className="text-lg font-semibold">Trends</h2>

			<div className="grid lg:grid-cols-2 gap-6">
				{/* Impressions & Clicks over cycles */}
				{cycleData.length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle className="text-sm font-medium">Impressions & Clicks by Cycle</CardTitle>
						</CardHeader>
						<CardContent>
							<div style={{ width: "100%", height: 250 }}>
								<ResponsiveContainer>
									<LineChart data={cycleData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
										<CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
										<XAxis dataKey="cycle" tick={{ className: "fill-muted-foreground text-xs" }} />
										<YAxis yAxisId="left" tick={{ className: "fill-muted-foreground text-xs" }} />
										<YAxis yAxisId="right" orientation="right" tick={{ className: "fill-muted-foreground text-xs" }} />
										<Tooltip contentStyle={{ backgroundColor: "var(--background)", border: "1px solid var(--border)", borderRadius: "6px", fontSize: "12px" }} />
										<Legend wrapperStyle={{ fontSize: "12px" }} />
										<Line yAxisId="left" type="monotone" dataKey="impressions" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
										<Line yAxisId="right" type="monotone" dataKey="clicks" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
									</LineChart>
								</ResponsiveContainer>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Position Distribution */}
				<Card>
					<CardHeader>
						<CardTitle className="text-sm font-medium">Position Distribution</CardTitle>
					</CardHeader>
					<CardContent>
						<div style={{ width: "100%", height: 250 }}>
							<ResponsiveContainer>
								<BarChart data={positionBuckets} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
									<CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
									<XAxis dataKey="range" tick={{ className: "fill-muted-foreground text-xs" }} />
									<YAxis tick={{ className: "fill-muted-foreground text-xs" }} />
									<Tooltip contentStyle={{ backgroundColor: "var(--background)", border: "1px solid var(--border)", borderRadius: "6px", fontSize: "12px" }} />
									<Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
								</BarChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>

				{/* CTR by Position */}
				<Card>
					<CardHeader>
						<CardTitle className="text-sm font-medium">Avg CTR by Position Range</CardTitle>
					</CardHeader>
					<CardContent>
						<div style={{ width: "100%", height: 250 }}>
							<ResponsiveContainer>
								<BarChart data={ctrByPosition} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
									<CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
									<XAxis dataKey="range" tick={{ className: "fill-muted-foreground text-xs" }} />
									<YAxis tick={{ className: "fill-muted-foreground text-xs" }} unit="%" />
									<Tooltip contentStyle={{ backgroundColor: "var(--background)", border: "1px solid var(--border)", borderRadius: "6px", fontSize: "12px" }} formatter={(value: number) => `${value}%`} />
									<Bar dataKey="avgCtr" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Avg CTR" />
								</BarChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>

				{/* Quadrant Trend */}
				{quadrantTrend.length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle className="text-sm font-medium">Quadrant Distribution by Cycle</CardTitle>
						</CardHeader>
						<CardContent>
							<div style={{ width: "100%", height: 250 }}>
								<ResponsiveContainer>
									<BarChart data={quadrantTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
										<CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
										<XAxis dataKey="cycle" tick={{ className: "fill-muted-foreground text-xs" }} />
										<YAxis tick={{ className: "fill-muted-foreground text-xs" }} />
										<Tooltip contentStyle={{ backgroundColor: "var(--background)", border: "1px solid var(--border)", borderRadius: "6px", fontSize: "12px" }} />
										<Legend wrapperStyle={{ fontSize: "11px" }} />
										<Bar dataKey="stars" stackId="q" fill="#22c55e" name="Stars" />
										<Bar dataKey="quickWins" stackId="q" fill="#3b82f6" name="Quick Wins" />
										<Bar dataKey="ctrOpportunities" stackId="q" fill="#f59e0b" name="CTR Opps" />
										<Bar dataKey="longTermTargets" stackId="q" fill="#8b5cf6" name="Long-term" />
										<Bar dataKey="earlySignals" stackId="q" fill="#06b6d4" name="Early Signals" />
										<Bar dataKey="dogs" stackId="q" fill="#6b7280" name="Dogs" />
									</BarChart>
								</ResponsiveContainer>
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
