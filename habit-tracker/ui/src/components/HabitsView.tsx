import { Button, Skeleton } from "@campshell/ui-components";
import { ListChecks, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import type { Category, Completion, Habit } from "../types.js";
import { HabitCard } from "./HabitCard.js";
import { HabitDialog } from "./HabitDialog.js";

interface HabitsViewProps {
	habits: Habit[];
	completions: Completion[];
	categories: Category[];
	isLoading: boolean;
	onCreate: (habit: Habit) => boolean;
	onUpdate: (habit: Habit) => boolean;
	onDelete: (id: string) => boolean;
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

export function HabitsView({
	habits,
	completions,
	categories,
	isLoading,
	onCreate,
	onUpdate,
	onDelete,
}: HabitsViewProps) {
	const [showArchived, setShowArchived] = useState(false);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingHabit, setEditingHabit] = useState<Habit | undefined>();

	const today = new Date().toISOString().slice(0, 10);

	const filtered = useMemo(() => {
		return habits
			.filter((h) => (showArchived ? h.archived : !h.archived))
			.sort((a, b) => a.name.localeCompare(b.name));
	}, [habits, showArchived]);

	function handleSave(habit: Habit): boolean {
		if (editingHabit) {
			return onUpdate(habit);
		}
		return onCreate(habit);
	}

	function handleArchive(habit: Habit) {
		onUpdate({ ...habit, archived: !habit.archived, updatedAt: new Date().toISOString() });
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div className="flex items-center gap-2 text-muted-foreground">
						<ListChecks className="h-4 w-4" />
						<span className="text-sm">{filtered.length} habits</span>
					</div>
					<div className="flex rounded-md border border-border/50 overflow-hidden">
						<button
							type="button"
							className={`px-2.5 py-1 text-xs transition-colors ${
								!showArchived
									? "bg-muted text-foreground"
									: "text-muted-foreground hover:text-foreground"
							}`}
							onClick={() => setShowArchived(false)}
						>
							Active
						</button>
						<button
							type="button"
							className={`px-2.5 py-1 text-xs transition-colors ${
								showArchived
									? "bg-muted text-foreground"
									: "text-muted-foreground hover:text-foreground"
							}`}
							onClick={() => setShowArchived(true)}
						>
							Archived
						</button>
					</div>
				</div>
				<Button
					size="sm"
					onClick={() => {
						setEditingHabit(undefined);
						setDialogOpen(true);
					}}
					className="gap-2"
				>
					<Plus className="h-4 w-4" />
					New Habit
				</Button>
			</div>

			{isLoading ? (
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: 6 }).map((_, i) => (
						<Skeleton key={i} className="h-32 rounded-lg" />
					))}
				</div>
			) : filtered.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-16 text-center">
					<ListChecks className="h-10 w-10 text-muted-foreground/50 mb-3" />
					<p className="text-sm text-muted-foreground">
						{showArchived
							? "No archived habits."
							: "No habits yet. Create your first one!"}
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{filtered.map((habit) => (
						<HabitCard
							key={habit.id}
							habit={habit}
							completions={completions}
							categories={categories}
							streakCurrent={computeCurrentStreak(habit.id, completions, today)}
							onEdit={() => {
								setEditingHabit(habit);
								setDialogOpen(true);
							}}
							onArchive={() => handleArchive(habit)}
							onDelete={() => onDelete(habit.id)}
						/>
					))}
				</div>
			)}

			<HabitDialog
				open={dialogOpen}
				onOpenChange={setDialogOpen}
				habit={editingHabit}
				categories={categories}
				onSave={handleSave}
			/>
		</div>
	);
}
