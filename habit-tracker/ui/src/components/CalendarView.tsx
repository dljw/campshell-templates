import { Card, CardContent, Skeleton } from "@campshell/ui-components";
import { CalendarDays } from "lucide-react";
import { useState } from "react";
import type { Completion, Habit } from "../types.js";
import { CompletionHeatmap } from "./CompletionHeatmap.js";
import { DayDetailDialog } from "./DayDetailDialog.js";

interface CalendarViewProps {
	habits: Habit[];
	completions: Completion[];
	isLoading: boolean;
}

export function CalendarView({ habits, completions, isLoading }: CalendarViewProps) {
	const [selectedDate, setSelectedDate] = useState<string | null>(null);

	if (isLoading) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-8 w-48 rounded" />
				<Skeleton className="h-40 rounded-xl" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-2 text-muted-foreground">
				<CalendarDays className="h-4 w-4" />
				<span className="text-sm">Activity over the last year</span>
			</div>

			<Card>
				<CardContent className="p-5">
					<CompletionHeatmap
						completions={completions}
						habits={habits}
						onDayClick={(date) => setSelectedDate(date)}
					/>
				</CardContent>
			</Card>

			{/* Monthly summary */}
			<div className="grid grid-cols-3 gap-3">
				{getLastThreeMonths().map((month) => {
					const monthCompletions = completions.filter(
						(c) => c.date.startsWith(month.prefix),
					);
					const daysInMonth = new Date(
						Number.parseInt(month.prefix.slice(0, 4)),
						Number.parseInt(month.prefix.slice(5, 7)),
						0,
					).getDate();
					const dailyHabits = habits.filter(
						(h) => !h.archived && h.frequency === "daily",
					);
					const possible = dailyHabits.length * daysInMonth;
					const rate = possible > 0 ? Math.round((monthCompletions.length / possible) * 100) : 0;

					return (
						<Card key={month.prefix} className="hover:bg-muted/10 transition-colors">
							<CardContent className="p-4 text-center space-y-1">
								<p className="text-xs text-muted-foreground">{month.label}</p>
								<p className="text-2xl font-semibold tabular-nums">{rate}%</p>
								<p className="text-[10px] text-muted-foreground">
									{monthCompletions.length} completions
								</p>
							</CardContent>
						</Card>
					);
				})}
			</div>

			{selectedDate && (
				<DayDetailDialog
					date={selectedDate}
					open={!!selectedDate}
					onOpenChange={(open) => !open && setSelectedDate(null)}
					habits={habits}
					completions={completions}
				/>
			)}
		</div>
	);
}

function getLastThreeMonths(): Array<{ prefix: string; label: string }> {
	const months: Array<{ prefix: string; label: string }> = [];
	const d = new Date();
	for (let i = 0; i < 3; i++) {
		const year = d.getFullYear();
		const month = d.getMonth();
		const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;
		const label = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
		months.push({ prefix, label });
		d.setMonth(d.getMonth() - 1);
	}
	return months;
}
