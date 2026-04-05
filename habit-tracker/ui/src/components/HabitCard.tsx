import { Badge, Button, Card, CardContent } from "@campshell/ui-components";
import { Archive, Pencil, Trash2 } from "lucide-react";
import { useMemo } from "react";
import type { Category, Completion, Habit, HabitColor } from "../types.js";
import { StreakBadge } from "./StreakBadge.js";

interface HabitCardProps {
	habit: Habit;
	completions: Completion[];
	categories: Category[];
	streakCurrent: number;
	onEdit: () => void;
	onArchive: () => void;
	onDelete: () => void;
}

const COLOR_DOT: Record<HabitColor, string> = {
	red: "bg-red-500",
	orange: "bg-orange-500",
	yellow: "bg-yellow-500",
	green: "bg-emerald-500",
	blue: "bg-blue-500",
	purple: "bg-purple-500",
	pink: "bg-pink-500",
	gray: "bg-gray-500",
};

const FREQ_BADGE: Record<string, string> = {
	daily: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
	weekly: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
	custom: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
};

export function HabitCard({
	habit,
	completions,
	categories,
	streakCurrent,
	onEdit,
	onArchive,
	onDelete,
}: HabitCardProps) {
	const category = categories.find((c) => c.id === habit.categoryId);

	const completionRate = useMemo(() => {
		const today = new Date();
		const thirtyDaysAgo = new Date(today);
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
		const startStr = thirtyDaysAgo.toISOString().slice(0, 10);

		const recent = completions.filter((c) => c.habitId === habit.id && c.date >= startStr);
		const days = habit.frequency === "daily" ? 30 : habit.frequency === "weekly" ? 4 : 30;
		const target = (habit.target ?? 1) * (habit.frequency === "weekly" ? 1 : 1);
		return Math.min(Math.round((recent.length / (days * target)) * 100), 100);
	}, [completions, habit]);

	return (
		<Card className="relative group hover:bg-muted/20 transition-colors" data-campshell-entity={`habit-tracker/habit/habits/${habit.id}.json`}>
			<CardContent className="p-4 space-y-3">
				<div className="flex items-start justify-between">
					<div className="flex items-center gap-2.5 min-w-0">
						{habit.emoji ? (
							<span className="text-lg shrink-0">{habit.emoji}</span>
						) : (
							<span
								className={`h-3 w-3 rounded-full shrink-0 ${COLOR_DOT[habit.color ?? "gray"]}`}
							/>
						)}
						<div className="min-w-0">
							<h3 className={`text-sm font-medium truncate ${habit.archived ? "line-through text-muted-foreground" : ""}`}>
								{habit.name}
							</h3>
							{habit.description && (
								<p className="text-xs text-muted-foreground truncate mt-0.5">{habit.description}</p>
							)}
						</div>
					</div>
					<StreakBadge streak={streakCurrent} />
				</div>

				<div className="flex items-center gap-2 flex-wrap">
					<Badge
						variant="outline"
						className={`text-[10px] border-0 ${FREQ_BADGE[habit.frequency] ?? ""}`}
					>
						{habit.frequency}
						{habit.target && habit.target > 1 ? ` \u00d7${habit.target}` : ""}
					</Badge>
					{category && (
						<Badge variant="outline" className="text-[10px]">
							{category.emoji ? `${category.emoji} ` : ""}{category.name}
						</Badge>
					)}
					<span className="text-[10px] text-muted-foreground ml-auto tabular-nums">
						{completionRate}% / 30d
					</span>
				</div>

				{/* Completion rate bar */}
				<div className="h-1 bg-muted/40 rounded-full overflow-hidden">
					<div
						className={`h-full rounded-full transition-all duration-500 ${
							completionRate >= 80
								? "bg-emerald-500"
								: completionRate >= 50
									? "bg-yellow-500"
									: "bg-orange-400"
						}`}
						style={{ width: `${completionRate}%` }}
					/>
				</div>
			</CardContent>

			{/* Hover actions */}
			<div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
				<button
					className="p-1 rounded hover:bg-muted/50"
					onClick={onEdit}
					title="Edit"
				>
					<Pencil className="h-3 w-3 text-muted-foreground" />
				</button>
				<button
					className="p-1 rounded hover:bg-muted/50"
					onClick={onArchive}
					title={habit.archived ? "Unarchive" : "Archive"}
				>
					<Archive className="h-3 w-3 text-muted-foreground" />
				</button>
				<button
					className="p-1 rounded hover:bg-destructive/10"
					onClick={onDelete}
					title="Delete"
				>
					<Trash2 className="h-3 w-3 text-muted-foreground" />
				</button>
			</div>
		</Card>
	);
}
