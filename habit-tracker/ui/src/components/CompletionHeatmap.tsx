import { useMemo, useState } from "react";
import type { Completion, Habit } from "../types.js";

interface CompletionHeatmapProps {
	completions: Completion[];
	habits: Habit[];
	onDayClick?: (date: string) => void;
}

interface HeatmapCell {
	date: string;
	count: number;
	level: 0 | 1 | 2 | 3 | 4;
}

const LEVEL_CLASSES = [
	"bg-muted/50",
	"bg-emerald-300/50 dark:bg-emerald-800/60",
	"bg-emerald-400/60 dark:bg-emerald-700/70",
	"bg-emerald-500/70 dark:bg-emerald-600/80",
	"bg-emerald-600 dark:bg-emerald-500",
];

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

function intensityToLevel(count: number, maxDaily: number): 0 | 1 | 2 | 3 | 4 {
	if (count === 0 || maxDaily === 0) return 0;
	const ratio = count / maxDaily;
	if (ratio <= 0.25) return 1;
	if (ratio <= 0.5) return 2;
	if (ratio <= 0.75) return 3;
	return 4;
}

export function CompletionHeatmap({ completions, habits, onDayClick }: CompletionHeatmapProps) {
	const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);

	const activeHabitCount = useMemo(
		() => habits.filter((h) => !h.archived && h.frequency === "daily").length,
		[habits],
	);

	const { cells, weeks, monthLabels } = useMemo(() => {
		const today = new Date();
		const endDate = new Date(today);
		// Go back ~52 weeks to the nearest Sunday
		const startDate = new Date(today);
		startDate.setDate(startDate.getDate() - 364);
		// Align to Sunday
		startDate.setDate(startDate.getDate() - startDate.getDay());

		// Build count map
		const countByDate = new Map<string, number>();
		for (const c of completions) {
			countByDate.set(c.date, (countByDate.get(c.date) ?? 0) + 1);
		}

		const cellList: HeatmapCell[] = [];
		const current = new Date(startDate);
		while (current <= endDate) {
			const dateStr = current.toISOString().slice(0, 10);
			const count = countByDate.get(dateStr) ?? 0;
			cellList.push({
				date: dateStr,
				count,
				level: intensityToLevel(count, activeHabitCount),
			});
			current.setDate(current.getDate() + 1);
		}

		// Group into weeks (columns)
		const weekList: HeatmapCell[][] = [];
		for (let i = 0; i < cellList.length; i += 7) {
			weekList.push(cellList.slice(i, i + 7));
		}

		// Compute month labels with positions
		const labels: Array<{ label: string; col: number }> = [];
		let lastMonth = -1;
		for (let w = 0; w < weekList.length; w++) {
			const firstDay = new Date(`${weekList[w][0].date}T00:00:00`);
			const month = firstDay.getMonth();
			if (month !== lastMonth) {
				labels.push({ label: MONTH_LABELS[month], col: w });
				lastMonth = month;
			}
		}

		return { cells: cellList, weeks: weekList, monthLabels: labels };
	}, [completions, activeHabitCount]);

	// Build a lookup of which week index starts a new month
	const monthLabelByWeek = useMemo(() => {
		const lookup = new Map<number, string>();
		for (const m of monthLabels) {
			lookup.set(m.col, m.label);
		}
		return lookup;
	}, [monthLabels]);

	return (
		<div className="space-y-1">
			{/* Month labels — same flex layout as the grid so they align naturally */}
			<div className="flex">
				{/* Spacer matching day labels width */}
				<div className="w-6 mr-1.5 shrink-0" />
				<div className="flex gap-[3px] text-[10px] text-muted-foreground/70">
					{weeks.map((_, wi) => (
						<div key={wi} className="w-[10px] shrink-0 overflow-visible">
							{monthLabelByWeek.has(wi) && (
								<span className="whitespace-nowrap">{monthLabelByWeek.get(wi)}</span>
							)}
						</div>
					))}
				</div>
			</div>

			<div className="flex">
				{/* Day labels */}
				<div className="flex flex-col gap-[3px] mr-1.5 shrink-0">
					{DAY_LABELS.map((label, i) => (
						<div
							key={i}
							className="h-[10px] w-6 text-[10px] text-muted-foreground/60 flex items-center justify-end pr-0.5"
						>
							{label}
						</div>
					))}
				</div>

				{/* Grid */}
				<div className="flex gap-[3px] overflow-x-auto">
					{weeks.map((week, wi) => (
						<div key={wi} className="flex flex-col gap-[3px]">
							{week.map((cell) => (
								<button
									key={cell.date}
									type="button"
									className={`h-[10px] w-[10px] rounded-[2px] transition-all duration-150 hover:ring-1 hover:ring-foreground/20 hover:scale-125 ${LEVEL_CLASSES[cell.level]}`}
									onMouseEnter={() => setHoveredCell(cell)}
									onMouseLeave={() => setHoveredCell(null)}
									onClick={() => onDayClick?.(cell.date)}
								/>
							))}
							{/* Pad if week is incomplete */}
							{week.length < 7 &&
								Array.from({ length: 7 - week.length }).map((_, i) => (
									<div key={`pad-${i}`} className="h-[10px] w-[10px]" />
								))}
						</div>
					))}
				</div>
			</div>

			{/* Tooltip / Legend */}
			<div className="flex items-center justify-between text-[10px] text-muted-foreground/60 pt-1">
				{hoveredCell ? (
					<span>
						{hoveredCell.date} &mdash; {hoveredCell.count} completion{hoveredCell.count !== 1 ? "s" : ""}
					</span>
				) : (
					<span>Hover to see details</span>
				)}
				<div className="flex items-center gap-1">
					<span>Less</span>
					{LEVEL_CLASSES.map((cls, i) => (
						<div key={i} className={`h-[10px] w-[10px] rounded-[2px] ${cls}`} />
					))}
					<span>More</span>
				</div>
			</div>
		</div>
	);
}
