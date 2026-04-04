import { Card, CardContent, Skeleton } from "@campshell/ui-components";
import { useMemo } from "react";
import type { Category, Completion, Habit, HabitColor } from "../types.js";
import { ProgressRing } from "./ProgressRing.js";
import { StreakBadge } from "./StreakBadge.js";

interface TodayViewProps {
	habits: Habit[];
	completions: Completion[];
	categories: Category[];
	isLoading: boolean;
	onComplete: (completion: Completion) => boolean;
	onUncomplete: (completionId: string) => boolean;
}

const COLOR_CHECK: Record<HabitColor, string> = {
	red: "border-red-500 bg-red-500 text-white",
	orange: "border-orange-500 bg-orange-500 text-white",
	yellow: "border-yellow-500 bg-yellow-500 text-white",
	green: "border-emerald-500 bg-emerald-500 text-white",
	blue: "border-blue-500 bg-blue-500 text-white",
	purple: "border-purple-500 bg-purple-500 text-white",
	pink: "border-pink-500 bg-pink-500 text-white",
	gray: "border-gray-500 bg-gray-500 text-white",
};

const COLOR_UNCHECK: Record<HabitColor, string> = {
	red: "border-red-400/40 hover:border-red-400",
	orange: "border-orange-400/40 hover:border-orange-400",
	yellow: "border-yellow-400/40 hover:border-yellow-400",
	green: "border-emerald-400/40 hover:border-emerald-400",
	blue: "border-blue-400/40 hover:border-blue-400",
	purple: "border-purple-400/40 hover:border-purple-400",
	pink: "border-pink-400/40 hover:border-pink-400",
	gray: "border-gray-400/40 hover:border-gray-400",
};

function computeCurrentStreak(
	habitId: string,
	completions: Completion[],
	today: string,
): number {
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

function getGreeting(): string {
	const hour = new Date().getHours();
	if (hour < 12) return "Good morning";
	if (hour < 17) return "Good afternoon";
	return "Good evening";
}

function formatToday(): string {
	return new Date().toLocaleDateString("en-US", {
		weekday: "long",
		month: "long",
		day: "numeric",
	});
}

export function TodayView({
	habits,
	completions,
	categories,
	isLoading,
	onComplete,
	onUncomplete,
}: TodayViewProps) {
	const today = new Date().toISOString().slice(0, 10);
	const activeHabits = useMemo(() => habits.filter((h) => !h.archived), [habits]);

	// Group daily habits that should show today
	const todayHabits = useMemo(() => {
		return activeHabits.filter((h) => {
			if (h.frequency === "daily") return true;
			// Show weekly/custom habits every day — user decides when to check them off
			return true;
		});
	}, [activeHabits]);

	const todayCompletions = useMemo(
		() => completions.filter((c) => c.date === today),
		[completions, today],
	);
	const completedIds = useMemo(
		() => new Set(todayCompletions.map((c) => c.habitId)),
		[todayCompletions],
	);

	const completedCount = todayHabits.filter((h) => completedIds.has(h.id)).length;
	const allDone = completedCount === todayHabits.length && todayHabits.length > 0;

	// Group by category
	const grouped = useMemo(() => {
		const map = new Map<string, Habit[]>();
		for (const h of todayHabits) {
			const key = h.categoryId ?? "__uncategorized";
			if (!map.has(key)) map.set(key, []);
			map.get(key)!.push(h);
		}
		// Sort: categorized first, then uncategorized
		const entries = [...map.entries()].sort((a, b) => {
			if (a[0] === "__uncategorized") return 1;
			if (b[0] === "__uncategorized") return -1;
			return 0;
		});
		return entries;
	}, [todayHabits]);

	function handleToggle(habit: Habit) {
		if (completedIds.has(habit.id)) {
			const completion = todayCompletions.find((c) => c.habitId === habit.id);
			if (completion) onUncomplete(completion.id);
		} else {
			onComplete({
				id: `${habit.id}-${today}`,
				createdAt: new Date().toISOString(),
				habitId: habit.id,
				date: today,
			});
		}
	}

	if (isLoading) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-20 rounded-xl" />
				<Skeleton className="h-12 rounded-lg" />
				<Skeleton className="h-12 rounded-lg" />
				<Skeleton className="h-12 rounded-lg" />
				<Skeleton className="h-12 rounded-lg" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header with greeting and progress */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-lg font-semibold tracking-tight">{getGreeting()}</h2>
					<p className="text-sm text-muted-foreground">{formatToday()}</p>
				</div>
				<ProgressRing value={completedCount} max={todayHabits.length} size={72} />
			</div>

			{/* Celebration banner */}
			{allDone && (
				<Card className="border-emerald-500/30 bg-emerald-500/5">
					<CardContent className="flex items-center gap-3 p-4">
						<span className="text-2xl">{"\u{1f389}"}</span>
						<div>
							<p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
								All habits completed!
							</p>
							<p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">
								You&apos;re on a roll. Keep it up tomorrow!
							</p>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Habit groups */}
			{todayHabits.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-16 text-center">
					<span className="text-4xl mb-3">{"\u2728"}</span>
					<p className="text-sm text-muted-foreground">
						No habits yet. Go to the Habits tab to create your first one.
					</p>
				</div>
			) : (
				<div className="space-y-5">
					{grouped.map(([catId, catHabits]) => {
						const category = categories.find((c) => c.id === catId);
						return (
							<div key={catId} className="space-y-1.5">
								{catId !== "__uncategorized" && category && (
									<p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium px-1 mb-2">
										{category.emoji ? `${category.emoji} ` : ""}{category.name}
									</p>
								)}
								{catId === "__uncategorized" && grouped.length > 1 && (
									<p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium px-1 mb-2">
										Other
									</p>
								)}
								{catHabits.map((habit) => {
									const isDone = completedIds.has(habit.id);
									const streak = computeCurrentStreak(habit.id, completions, today);
									const color = habit.color ?? "gray";

									return (
										<button
											key={habit.id}
											type="button"
											onClick={() => handleToggle(habit)}
											className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-left group ${
												isDone
													? "bg-muted/30"
													: "hover:bg-muted/20"
											}`}
										>
											{/* Custom checkbox */}
											<span
												className={`h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
													isDone
														? COLOR_CHECK[color]
														: COLOR_UNCHECK[color]
												}`}
											>
												{isDone && (
													<svg
														className="h-3 w-3"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
														strokeWidth={3}
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															d="M5 13l4 4L19 7"
														/>
													</svg>
												)}
											</span>

											{/* Emoji */}
											{habit.emoji && (
												<span className={`text-base ${isDone ? "opacity-50" : ""}`}>
													{habit.emoji}
												</span>
											)}

											{/* Name */}
											<span
												className={`text-sm flex-1 ${
													isDone
														? "line-through text-muted-foreground/60"
														: "font-medium"
												}`}
											>
												{habit.name}
											</span>

											{/* Streak */}
											{streak > 0 && <StreakBadge streak={streak} />}
										</button>
									);
								})}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
