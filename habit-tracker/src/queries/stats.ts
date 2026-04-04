import { readAllCompletions, readAllHabits } from "./helpers.js";
import { computeBestStreak, computeCurrentStreak } from "./streaks.js";
import type { HabitStats, QueryOptions } from "./types.js";

function getLast30Days(today: string): string[] {
	const days: string[] = [];
	const d = new Date(`${today}T00:00:00Z`);
	for (let i = 0; i < 30; i++) {
		days.push(d.toISOString().slice(0, 10));
		d.setUTCDate(d.getUTCDate() - 1);
	}
	return days;
}

export async function getStats(options: QueryOptions): Promise<HabitStats> {
	const habits = await readAllHabits(options.dataDir);
	const completions = await readAllCompletions(options.dataDir);
	const today = new Date().toISOString().slice(0, 10);

	const activeHabits = habits.filter((h) => !h.archived);
	const dailyHabits = activeHabits.filter((h) => h.frequency === "daily");
	const days = options.days ?? 30;
	const last30 = getLast30Days(today).slice(0, days);
	const last30Set = new Set(last30);

	const recentCompletions = completions.filter(
		(c) => last30Set.has(c.date) && dailyHabits.some((h) => h.id === c.habitId),
	);

	const completionRate =
		dailyHabits.length > 0 ? recentCompletions.length / (dailyHabits.length * days) : 0;

	const streaks = activeHabits.map((h) => ({
		habitId: h.id,
		habitName: h.name,
		current: computeCurrentStreak(h.id, completions, today),
		best: computeBestStreak(h.id, completions),
	}));

	return {
		completionRate: Math.round(completionRate * 100) / 100,
		totalCompletions: completions.length,
		activeHabits: activeHabits.length,
		bestCurrentStreak: Math.max(0, ...streaks.map((s) => s.current)),
		streaks,
	};
}
