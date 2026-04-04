import {
	Button,
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	Input,
	Label,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@campshell/ui-components";
import { useState } from "react";
import type { Category, Frequency, Habit, HabitColor } from "../types.js";

interface HabitDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	habit?: Habit;
	categories: Category[];
	onSave: (habit: Habit) => boolean;
}

const COLOR_OPTIONS: HabitColor[] = ["red", "orange", "yellow", "green", "blue", "purple", "pink", "gray"];
const FREQUENCY_OPTIONS: Array<{ value: Frequency; label: string }> = [
	{ value: "daily", label: "Daily" },
	{ value: "weekly", label: "Weekly" },
	{ value: "custom", label: "Custom" },
];

function generateId(name: string): string {
	const slug = name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "")
		.slice(0, 28);
	return slug || `habit-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function HabitDialog({ open, onOpenChange, habit, categories, onSave }: HabitDialogProps) {
	const isEdit = !!habit;
	const [name, setName] = useState(habit?.name ?? "");
	const [description, setDescription] = useState(habit?.description ?? "");
	const [emoji, setEmoji] = useState(habit?.emoji ?? "");
	const [color, setColor] = useState<HabitColor>(habit?.color ?? "green");
	const [frequency, setFrequency] = useState<Frequency>(habit?.frequency ?? "daily");
	const [target, setTarget] = useState(habit?.target?.toString() ?? "1");
	const [categoryId, setCategoryId] = useState(habit?.categoryId ?? "none");

	function handleSave() {
		if (!name.trim()) return;

		const newHabit: Habit = {
			id: habit?.id ?? generateId(name),
			createdAt: habit?.createdAt ?? new Date().toISOString(),
			updatedAt: isEdit ? new Date().toISOString() : undefined,
			name: name.trim(),
			frequency,
			...(description.trim() && { description: description.trim() }),
			...(emoji.trim() && { emoji: emoji.trim() }),
			color,
			...(frequency !== "daily" && target && { target: Number.parseInt(target, 10) }),
			...(categoryId !== "none" && { categoryId }),
		};
		if (onSave(newHabit)) {
			onOpenChange(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{isEdit ? "Edit Habit" : "New Habit"}</DialogTitle>
				</DialogHeader>

				<div className="grid gap-4 py-2">
					<div className="grid grid-cols-[1fr_4rem] gap-3">
						<div className="space-y-1.5">
							<Label>Name</Label>
							<Input
								placeholder="e.g. Morning Run"
								value={name}
								onChange={(e) => setName(e.target.value)}
								onKeyDown={(e) => e.key === "Enter" && handleSave()}
							/>
						</div>
						<div className="space-y-1.5">
							<Label>Emoji</Label>
							<Input
								placeholder="\u{1f3c3}"
								value={emoji}
								onChange={(e) => setEmoji(e.target.value)}
								className="text-center"
							/>
						</div>
					</div>

					<div className="space-y-1.5">
						<Label>Description (optional)</Label>
						<Input
							placeholder="What does this habit involve?"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
						/>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-1.5">
							<Label>Frequency</Label>
							<Select value={frequency} onValueChange={(v) => setFrequency(v as Frequency)}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{FREQUENCY_OPTIONS.map((f) => (
										<SelectItem key={f.value} value={f.value}>
											{f.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						{frequency !== "daily" && (
							<div className="space-y-1.5">
								<Label>Target (times/{frequency === "weekly" ? "week" : "period"})</Label>
								<Input
									type="number"
									min={1}
									max={31}
									value={target}
									onChange={(e) => setTarget(e.target.value)}
								/>
							</div>
						)}
					</div>

					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-1.5">
							<Label>Color</Label>
							<Select value={color} onValueChange={(v) => setColor(v as HabitColor)}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{COLOR_OPTIONS.map((c) => (
										<SelectItem key={c} value={c}>
											<span className="capitalize">{c}</span>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-1.5">
							<Label>Category</Label>
							<Select value={categoryId} onValueChange={setCategoryId}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="none">None</SelectItem>
									{categories.map((c) => (
										<SelectItem key={c.id} value={c.id}>
											{c.emoji ? `${c.emoji} ` : ""}{c.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button onClick={handleSave} disabled={!name.trim()}>
						{isEdit ? "Save Changes" : "Create Habit"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
