import { readAllCompletions, readAllHabits } from "./helpers.js";
import type { Completion, QueryOptions, StreakInfo } from "./types.js";

function subtractDays(dateStr: string, days: number): string {
	const d = new Date(`${dateStr}T00:00:00Z`);
	d.setUTCDate(d.getUTCDate() - days);
	return d.toISOString().slice(0, 10);
}

export function computeCurrentStreak(
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
		const yesterday = subtractDays(today, 1);
		if (dates[0] !== yesterday) return 0;
		checkDate = yesterday;
	}

	let streak = 0;
	for (const date of dates) {
		if (date === checkDate) {
			streak++;
			checkDate = subtractDays(checkDate, 1);
		} else if (date < checkDate) {
			break;
		}
	}
	return streak;
}

export function computeBestStreak(habitId: string, completions: Completion[]): number {
	const dates = [
		...new Set(completions.filter((c) => c.habitId === habitId).map((c) => c.date)),
	].sort();

	if (dates.length === 0) return 0;

	let best = 1;
	let current = 1;
	for (let i = 1; i < dates.length; i++) {
		const expected = subtractDays(dates[i], 1);
		if (dates[i - 1] === expected) {
			current++;
			best = Math.max(best, current);
		} else {
			current = 1;
		}
	}
	return best;
}

export async function getStreaks(options: QueryOptions): Promise<StreakInfo[]> {
	const habits = await readAllHabits(options.dataDir);
	const completions = await readAllCompletions(options.dataDir);
	const today = new Date().toISOString().slice(0, 10);

	let filtered = habits.filter((h) => !h.archived);
	if (options.habitId) {
		filtered = filtered.filter((h) => h.id === options.habitId);
	}

	return filtered.map((h) => ({
		habitId: h.id,
		habitName: h.name,
		current: computeCurrentStreak(h.id, completions, today),
		best: computeBestStreak(h.id, completions),
	}));
}
