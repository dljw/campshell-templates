export { listHabits, getHabit, searchHabits } from "./habits.js";
export { listCompletions, getCompletion } from "./completions.js";
export { listCategories } from "./categories.js";
export { getStreaks, computeCurrentStreak, computeBestStreak } from "./streaks.js";
export { getStats } from "./stats.js";
export { readCategories } from "./helpers.js";
export { NotFoundError } from "./types.js";
export type {
	Habit,
	Completion,
	Category,
	StreakInfo,
	HabitStats,
	QueryOptions,
} from "./types.js";
