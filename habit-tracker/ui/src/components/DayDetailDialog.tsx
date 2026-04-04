import {
	Button,
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@campshell/ui-components";
import { Check } from "lucide-react";
import type { Completion, Habit } from "../types.js";

interface DayDetailDialogProps {
	date: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	habits: Habit[];
	completions: Completion[];
}

function formatDate(dateStr: string): string {
	const d = new Date(`${dateStr}T00:00:00`);
	return d.toLocaleDateString("en-US", {
		weekday: "long",
		month: "long",
		day: "numeric",
		year: "numeric",
	});
}

export function DayDetailDialog({
	date,
	open,
	onOpenChange,
	habits,
	completions,
}: DayDetailDialogProps) {
	const dayCompletions = completions.filter((c) => c.date === date);
	const completedIds = new Set(dayCompletions.map((c) => c.habitId));
	const activeHabits = habits.filter((h) => !h.archived);
	const completed = activeHabits.filter((h) => completedIds.has(h.id));
	const missed = activeHabits.filter((h) => !completedIds.has(h.id));

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-sm">
				<DialogHeader>
					<DialogTitle className="text-sm font-medium">{formatDate(date)}</DialogTitle>
				</DialogHeader>

				<div className="space-y-4 py-2">
					{completed.length > 0 && (
						<div className="space-y-1.5">
							<p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
								Completed ({completed.length})
							</p>
							{completed.map((h) => {
								const c = dayCompletions.find((dc) => dc.habitId === h.id);
								return (
									<div
										key={h.id}
										className="flex items-center gap-2.5 py-1.5 px-2 rounded-md bg-emerald-500/5"
									>
										<Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
										<span className="text-sm">
											{h.emoji ? `${h.emoji} ` : ""}
											{h.name}
										</span>
										{c?.notes && (
											<span className="text-xs text-muted-foreground ml-auto truncate max-w-[120px]">
												{c.notes}
											</span>
										)}
									</div>
								);
							})}
						</div>
					)}

					{missed.length > 0 && (
						<div className="space-y-1.5">
							<p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
								Missed ({missed.length})
							</p>
							{missed.map((h) => (
								<div
									key={h.id}
									className="flex items-center gap-2.5 py-1.5 px-2 rounded-md text-muted-foreground/60"
								>
									<span className="h-3.5 w-3.5 shrink-0 rounded-full border border-muted-foreground/20" />
									<span className="text-sm">
										{h.emoji ? `${h.emoji} ` : ""}
										{h.name}
									</span>
								</div>
							))}
						</div>
					)}

					{completed.length === 0 && missed.length === 0 && (
						<p className="text-sm text-muted-foreground text-center py-4">
							No habits tracked on this day.
						</p>
					)}
				</div>

				<DialogFooter>
					<Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
