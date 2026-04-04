import { Card, CardContent, Skeleton } from "@campshell/ui-components";
import { BarChart3, Flame, ListChecks, Target, Trophy } from "lucide-react";
import { useMemo } from "react";
import type { Category, Completion, Habit } from "../types.js";
import { StreakBadge } from "./StreakBadge.js";

interface StatsViewProps {
	habits: Habit[];
	completions: Completion[];
	categories: Category[];
	isLoading: boolean;
}

function computeCurrentStreak(habitId: string, completions: Completion[], today: string): number {
	const dates = [
		...new Set(completions.filter((c) => c.habitId === habitId).map((c) => c.date)),
	].sort().reverse();

	if (dates.length === 0) return 0;

	let checkDate = today;
	if (dates[0] !== today) {
		const d = new Date(`${today}T00:00:00Z`);
		d.setUTCDate(d.getUTCDate() - 1);
		const yesterday = d.toISOString().slice(0, 10);
		if (dates[0] !== yesterday) return 0;
		checkDate = yesterday;
	}

	let streak = 0;
	for (const date of dates) {
		if (date === checkDate) {
			streak++;
			const d = new Date(`${checkDate}T00:00:00Z`);
			d.setUTCDate(d.getUTCDate() - 1);
			checkDate = d.toISOString().slice(0, 10);
		} else if (date < checkDate) {
			break;
		}
	}
	return streak;
}

function getLast7Days(): string[] {
	const days: string[] = [];
	const d = new Date();
	for (let i = 6; i >= 0; i--) {
		const day = new Date(d);
		day.setDate(day.getDate() - i);
		days.push(day.toISOString().slice(0, 10));
	}
	return days;
}

function getDayLabel(dateStr: string): string {
	const d = new Date(`${dateStr}T00:00:00`);
	return d.toLocaleDateString("en-US", { weekday: "short" });
}

export function StatsView({ habits, completions, categories, isLoading }: StatsViewProps) {
	const today = new Date().toISOString().slice(0, 10);

	const stats = useMemo(() => {
		const activeHabits = habits.filter((h) => !h.archived);
		const dailyHabits = activeHabits.filter((h) => h.frequency === "daily");

		// 30-day completion rate
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
		const startStr = thirtyDaysAgo.toISOString().slice(0, 10);
		const recentCompletions = completions.filter(
			(c) => c.date >= startStr && dailyHabits.some((h) => h.id === c.habitId),
		);
		const completionRate =
			dailyHabits.length > 0
				? Math.round((recentCompletions.length / (dailyHabits.length * 30)) * 100)
				: 0;

		// Streaks
		const streaks = activeHabits.map((h) => ({
			...h,
			streak: computeCurrentStreak(h.id, completions, today),
		}));
		const bestStreak = Math.max(0, ...streaks.map((s) => s.streak));

		// Per-habit 30d rates
		const habitRates = activeHabits.map((h) => {
			const hCompletions = completions.filter(
				(c) => c.habitId === h.id && c.date >= startStr,
			);
			const possible = h.frequency === "daily" ? 30 : h.frequency === "weekly" ? 4 : 30;
			const rate = Math.min(
				Math.round((hCompletions.length / (possible * (h.target ?? 1))) * 100),
				100,
			);
			return { ...h, rate, completionCount: hCompletions.length };
		}).sort((a, b) => b.rate - a.rate);

		// Weekly chart data
		const weekDays = getLast7Days();
		const weekData = weekDays.map((date) => ({
			date,
			label: getDayLabel(date),
			count: completions.filter((c) => c.date === date).length,
		}));
		const weekMax = Math.max(1, ...weekData.map((d) => d.count));

		// Category breakdown
		const catBreakdown = categories
			.map((cat) => {
				const catHabits = activeHabits.filter((h) => h.categoryId === cat.id);
				const catCompletions = completions.filter(
					(c) =>
						c.date >= startStr && catHabits.some((h) => h.id === c.habitId),
				);
				return {
					...cat,
					habitCount: catHabits.length,
					completionCount: catCompletions.length,
				};
			})
			.filter((c) => c.habitCount > 0)
			.sort((a, b) => b.completionCount - a.completionCount);

		return {
			completionRate,
			totalCompletions: completions.length,
			activeHabitCount: activeHabits.length,
			bestStreak,
			streaks: streaks.sort((a, b) => b.streak - a.streak).slice(0, 5),
			habitRates: habitRates.slice(0, 5),
			weekData,
			weekMax,
			catBreakdown,
		};
	}, [habits, completions, categories, today]);

	if (isLoading) {
		return (
			<div className="space-y-4">
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
					{Array.from({ length: 4 }).map((_, i) => (
						<Skeleton key={i} className="h-24 rounded-lg" />
					))}
				</div>
				<Skeleton className="h-48 rounded-lg" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Summary cards */}
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
				<Card>
					<CardContent className="p-4 text-center space-y-1">
						<Target className="h-4 w-4 text-emerald-500 mx-auto" />
						<p className="text-2xl font-semibold tabular-nums">{stats.completionRate}%</p>
						<p className="text-[10px] text-muted-foreground">30-day rate</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4 text-center space-y-1">
						<Flame className="h-4 w-4 text-orange-500 mx-auto" />
						<p className="text-2xl font-semibold tabular-nums">{stats.bestStreak}</p>
						<p className="text-[10px] text-muted-foreground">Best streak</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4 text-center space-y-1">
						<BarChart3 className="h-4 w-4 text-blue-500 mx-auto" />
						<p className="text-2xl font-semibold tabular-nums">{stats.totalCompletions}</p>
						<p className="text-[10px] text-muted-foreground">Total completions</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4 text-center space-y-1">
						<ListChecks className="h-4 w-4 text-purple-500 mx-auto" />
						<p className="text-2xl font-semibold tabular-nums">{stats.activeHabitCount}</p>
						<p className="text-[10px] text-muted-foreground">Active habits</p>
					</CardContent>
				</Card>
			</div>

			{/* This week chart */}
			<Card>
				<CardContent className="p-5 space-y-3">
					<p className="text-xs font-medium text-muted-foreground">This Week</p>
					<div className="flex items-end gap-2 h-28">
						{stats.weekData.map((d) => {
							const height = (d.count / stats.weekMax) * 100;
							const isToday = d.date === today;
							return (
								<div key={d.date} className="flex-1 flex flex-col items-center gap-1.5">
									<span className="text-[10px] tabular-nums text-muted-foreground">
										{d.count || ""}
									</span>
									<div className="w-full flex-1 flex items-end">
										<div
											className={`w-full rounded-t-sm transition-all duration-500 ${
												isToday
													? "bg-emerald-500"
													: d.count > 0
														? "bg-emerald-500/40"
														: "bg-muted/40"
											}`}
											style={{
												height: d.count > 0 ? `${Math.max(height, 8)}%` : "4px",
											}}
										/>
									</div>
									<span
										className={`text-[10px] ${
											isToday
												? "font-semibold text-foreground"
												: "text-muted-foreground/60"
										}`}
									>
										{d.label}
									</span>
								</div>
							);
						})}
					</div>
				</CardContent>
			</Card>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				{/* Most consistent */}
				<Card>
					<CardContent className="p-5 space-y-3">
						<p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
							<Trophy className="h-3.5 w-3.5" />
							Most Consistent (30d)
						</p>
						{stats.habitRates.length === 0 ? (
							<p className="text-sm text-muted-foreground/50 py-4 text-center">
								No data yet
							</p>
						) : (
							<div className="space-y-2.5">
								{stats.habitRates.map((h) => (
									<div key={h.id} className="space-y-1">
										<div className="flex items-center justify-between">
											<span className="text-sm truncate">
												{h.emoji ? `${h.emoji} ` : ""}{h.name}
											</span>
											<span className="text-xs tabular-nums text-muted-foreground ml-2">
												{h.rate}%
											</span>
										</div>
										<div className="h-1 bg-muted/40 rounded-full overflow-hidden">
											<div
												className={`h-full rounded-full transition-all duration-500 ${
													h.rate >= 80
														? "bg-emerald-500"
														: h.rate >= 50
															? "bg-yellow-500"
															: "bg-orange-400"
												}`}
												style={{ width: `${h.rate}%` }}
											/>
										</div>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Streak leaders */}
				<Card>
					<CardContent className="p-5 space-y-3">
						<p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
							<Flame className="h-3.5 w-3.5" />
							Streak Leaders
						</p>
						{stats.streaks.length === 0 || stats.streaks[0].streak === 0 ? (
							<p className="text-sm text-muted-foreground/50 py-4 text-center">
								No active streaks
							</p>
						) : (
							<div className="space-y-2">
								{stats.streaks
									.filter((s) => s.streak > 0)
									.map((h) => (
										<div
											key={h.id}
											className="flex items-center justify-between py-1"
										>
											<span className="text-sm truncate">
												{h.emoji ? `${h.emoji} ` : ""}{h.name}
											</span>
											<StreakBadge streak={h.streak} />
										</div>
									))}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Category breakdown */}
				{stats.catBreakdown.length > 0 && (
					<Card className="sm:col-span-2">
						<CardContent className="p-5 space-y-3">
							<p className="text-xs font-medium text-muted-foreground">
								Category Breakdown (30d)
							</p>
							<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
								{stats.catBreakdown.map((cat) => (
									<div
										key={cat.id}
										className="flex items-center gap-2.5 p-2.5 rounded-md bg-muted/10"
									>
										{cat.emoji && <span>{cat.emoji}</span>}
										<div className="min-w-0">
											<p className="text-sm font-medium truncate">{cat.name}</p>
											<p className="text-[10px] text-muted-foreground">
												{cat.completionCount} completions &middot; {cat.habitCount} habit{cat.habitCount !== 1 ? "s" : ""}
											</p>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
