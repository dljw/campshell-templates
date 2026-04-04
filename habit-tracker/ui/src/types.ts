export type HabitColor = "red" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "gray";
export type Frequency = "daily" | "weekly" | "custom";

export interface Habit {
	id: string;
	createdAt: string;
	updatedAt?: string;
	name: string;
	description?: string;
	emoji?: string;
	color?: HabitColor;
	frequency: Frequency;
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
	color?: HabitColor;
}

export interface CategoriesCollection {
	categories: Category[];
}

export interface ValidationErrorDetail {
	template: string;
	file: string;
	errors: Array<{
		keyword: string;
		message?: string;
		instancePath: string;
		params?: Record<string, unknown>;
	}>;
}
