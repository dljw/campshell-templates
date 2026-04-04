import {
	ScatterChart,
	Scatter,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	ReferenceLine,
} from "recharts";
import { useMemo } from "react";
import type { Keyword, Quadrant } from "../types.js";

const QUADRANT_COLORS: Record<Quadrant, string> = {
	star: "#22c55e",
	"quick-win": "#3b82f6",
	"ctr-opportunity": "#f59e0b",
	"long-term-target": "#8b5cf6",
	"early-signal": "#06b6d4",
	dog: "#6b7280",
};

interface KeywordQuadrantChartProps {
	keywords: Keyword[];
}

export function KeywordQuadrantChart({ keywords }: KeywordQuadrantChartProps) {
	const chartData = useMemo(() => {
		return keywords
			.filter((k) => k.position != null && k.impressions != null)
			.map((k) => ({
				term: k.term,
				position: k.position!,
				impressions: Math.max(k.impressions!, 1),
				quadrant: k.quadrant ?? "dog",
				fill: QUADRANT_COLORS[k.quadrant ?? "dog"],
			}));
	}, [keywords]);

	if (chartData.length === 0) {
		return <p className="text-sm text-muted-foreground py-8 text-center">No position/impression data yet</p>;
	}

	const quadrants = Object.entries(QUADRANT_COLORS);
	const grouped = useMemo(() => {
		const map = new Map<string, typeof chartData>();
		for (const d of chartData) {
			const existing = map.get(d.quadrant) ?? [];
			existing.push(d);
			map.set(d.quadrant, existing);
		}
		return map;
	}, [chartData]);

	return (
		<div style={{ width: "100%", height: 350 }}>
			<ResponsiveContainer>
				<ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
					<CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
					<XAxis
						type="number"
						dataKey="position"
						name="Position"
						domain={[0, 100]}
						reversed
						label={{ value: "Position (lower = better)", position: "bottom", offset: 5, className: "fill-muted-foreground text-xs" }}
						tick={{ className: "fill-muted-foreground text-xs" }}
					/>
					<YAxis
						type="number"
						dataKey="impressions"
						name="Impressions"
						scale="log"
						domain={[1, "auto"]}
						label={{ value: "Impressions", angle: -90, position: "insideLeft", className: "fill-muted-foreground text-xs" }}
						tick={{ className: "fill-muted-foreground text-xs" }}
					/>
					<ReferenceLine x={20} stroke="#666" strokeDasharray="5 5" />
					<ReferenceLine y={10} stroke="#666" strokeDasharray="5 5" />
					<Tooltip
						content={({ payload }) => {
							if (!payload?.[0]) return null;
							const d = payload[0].payload;
							return (
								<div className="rounded-md border border-border bg-background px-3 py-2 shadow-sm text-xs">
									<p className="font-medium">{d.term}</p>
									<p className="text-muted-foreground">Pos: {d.position.toFixed(1)} | Impr: {d.impressions}</p>
								</div>
							);
						}}
					/>
					{quadrants.map(([quadrant, color]) => {
						const qData = grouped.get(quadrant);
						if (!qData || qData.length === 0) return null;
						return (
							<Scatter
								key={quadrant}
								name={quadrant}
								data={qData}
								fill={color}
								opacity={0.8}
							/>
						);
					})}
				</ScatterChart>
			</ResponsiveContainer>
		</div>
	);
}
