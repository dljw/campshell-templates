export interface QueryOptions {
	dataDir: string;
	frequency?: string;
	categoryId?: string;
	archived?: boolean;
	habitId?: string;
	from?: string;
	to?: string;
	days?: number;
}

export interface Habit {
	id: string;
	createdAt: string;
	updatedAt?: string;
	name: string;
	description?: string;
	emoji?: string;
	color?: "red" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "gray";
	frequency: "daily" | "weekly" | "custom";
	target?: number;
	categoryId?: string;
	archived?: boolean;
}

export interface Completion {
	id: string;
	createdAt: string;
	habitId: string;
	date: string;
	notes?: string;
}

export interface Category {
	id: string;
	createdAt: string;
	name: string;
	emoji?: string;
	color?: string;
}

export interface StreakInfo {
	habitId: string;
	habitName: string;
	current: number;
	best: number;
}

export interface HabitStats {
	completionRate: number;
	totalCompletions: number;
	activeHabits: number;
	bestCurrentStreak: number;
	streaks: StreakInfo[];
}

export class NotFoundError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "NotFoundError";
	}
}
