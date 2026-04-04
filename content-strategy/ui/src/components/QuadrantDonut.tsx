const QUADRANT_COLORS: Record<string, string> = {
	star: "#22c55e",
	"quick-win": "#3b82f6",
	"ctr-opportunity": "#f59e0b",
	"long-term-target": "#8b5cf6",
	"early-signal": "#06b6d4",
	dog: "#6b7280",
};

const QUADRANT_LABELS: Record<string, string> = {
	star: "Stars",
	"quick-win": "Quick Wins",
	"ctr-opportunity": "CTR Opps",
	"long-term-target": "Long-term",
	"early-signal": "Early Signals",
	dog: "Dogs",
};

interface QuadrantDonutProps {
	counts: Record<string, number>;
	total: number;
}

export function QuadrantDonut({ counts, total }: QuadrantDonutProps) {
	if (total === 0) {
		return <p className="text-sm text-muted-foreground">No keyword data yet</p>;
	}

	const entries = Object.entries(QUADRANT_COLORS)
		.map(([key, color]) => ({
			key,
			label: QUADRANT_LABELS[key] ?? key,
			color,
			count: counts[key] ?? 0,
		}))
		.filter((e) => e.count > 0);

	// SVG donut
	const size = 120;
	const strokeWidth = 20;
	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;
	let offset = 0;

	return (
		<div className="flex items-center gap-6">
			<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
				{entries.map((entry) => {
					const pct = entry.count / total;
					const dashLength = pct * circumference;
					const dashOffset = -offset;
					offset += dashLength;
					return (
						<circle
							key={entry.key}
							cx={size / 2}
							cy={size / 2}
							r={radius}
							fill="none"
							stroke={entry.color}
							strokeWidth={strokeWidth}
							strokeDasharray={`${dashLength} ${circumference - dashLength}`}
							strokeDashoffset={dashOffset}
							transform={`rotate(-90 ${size / 2} ${size / 2})`}
						/>
					);
				})}
				<text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central" className="fill-foreground text-lg font-bold">
					{total}
				</text>
			</svg>
			<div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
				{entries.map((entry) => (
					<div key={entry.key} className="flex items-center gap-1.5">
						<span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
						<span className="text-muted-foreground">{entry.label}</span>
						<span className="font-medium ml-auto">{entry.count}</span>
					</div>
				))}
			</div>
		</div>
	);
}
