import {
	Badge,
	Button,
	Card,
	CardContent,
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
	Skeleton,
} from "@campshell/ui-components";
import { FolderOpen, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Category, HabitColor } from "../types.js";

interface CategoriesViewProps {
	categories: Category[];
	isLoading: boolean;
	onUpdate: (categories: Category[]) => void;
}

const COLOR_OPTIONS: HabitColor[] = [
	"red", "orange", "yellow", "green", "blue", "purple", "pink", "gray",
];

const COLOR_CLASS: Record<HabitColor, string> = {
	red: "bg-red-500/20 text-red-500 border-red-500/30",
	orange: "bg-orange-500/20 text-orange-500 border-orange-500/30",
	yellow: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
	green: "bg-emerald-500/20 text-emerald-600 border-emerald-500/30",
	blue: "bg-blue-500/20 text-blue-500 border-blue-500/30",
	purple: "bg-purple-500/20 text-purple-500 border-purple-500/30",
	pink: "bg-pink-500/20 text-pink-500 border-pink-500/30",
	gray: "bg-gray-500/20 text-gray-500 border-gray-500/30",
};

function generateId(name: string): string {
	return (
		name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 28) ||
		`cat-${Date.now().toString(36)}`
	);
}

export function CategoriesView({ categories, isLoading, onUpdate }: CategoriesViewProps) {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [newName, setNewName] = useState("");
	const [newEmoji, setNewEmoji] = useState("");
	const [newColor, setNewColor] = useState<HabitColor>("blue");

	function handleAdd() {
		if (!newName.trim()) return;
		const newCategory: Category = {
			id: generateId(newName),
			createdAt: new Date().toISOString(),
			name: newName.trim(),
			...(newEmoji.trim() && { emoji: newEmoji.trim() }),
			color: newColor,
		};
		onUpdate([...categories, newCategory]);
		setNewName("");
		setNewEmoji("");
		setNewColor("blue");
		setDialogOpen(false);
	}

	function handleDelete(id: string) {
		onUpdate(categories.filter((c) => c.id !== id));
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2 text-muted-foreground">
					<FolderOpen className="h-4 w-4" />
					<span className="text-sm">{categories.length} categories</span>
				</div>
				<Button size="sm" onClick={() => setDialogOpen(true)} className="gap-2">
					<Plus className="h-4 w-4" />
					New Category
				</Button>
			</div>

			{isLoading ? (
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
					{Array.from({ length: 8 }).map((_, i) => (
						<Skeleton key={i} className="h-16 rounded-lg" />
					))}
				</div>
			) : categories.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-16 text-center">
					<FolderOpen className="h-10 w-10 text-muted-foreground/50 mb-3" />
					<p className="text-sm text-muted-foreground">No categories yet.</p>
				</div>
			) : (
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
					{categories.map((category) => (
						<Card key={category.id} className="relative group hover:bg-muted/20 transition-colors">
							<CardContent className="flex items-center gap-3 p-4">
								{category.emoji && <span className="text-lg">{category.emoji}</span>}
								<Badge
									variant="outline"
									className={`capitalize ${category.color ? (COLOR_CLASS[category.color as HabitColor] ?? "") : ""}`}
								>
									{category.color ?? "\u2014"}
								</Badge>
								<span className="text-sm font-medium truncate">{category.name}</span>
							</CardContent>
							<button
								className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10"
								onClick={() => handleDelete(category.id)}
							>
								<Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
							</button>
						</Card>
					))}
				</div>
			)}

			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent className="sm:max-w-sm">
					<DialogHeader>
						<DialogTitle>New Category</DialogTitle>
					</DialogHeader>
					<div className="grid gap-4 py-2">
						<div className="grid grid-cols-[1fr_4rem] gap-3">
							<div className="space-y-1.5">
								<Label>Name</Label>
								<Input
									placeholder="e.g. Wellness"
									value={newName}
									onChange={(e) => setNewName(e.target.value)}
									onKeyDown={(e) => e.key === "Enter" && handleAdd()}
								/>
							</div>
							<div className="space-y-1.5">
								<Label>Emoji</Label>
								<Input
									placeholder="\u{1f33f}"
									value={newEmoji}
									onChange={(e) => setNewEmoji(e.target.value)}
									className="text-center"
								/>
							</div>
						</div>
						<div className="space-y-1.5">
							<Label>Color</Label>
							<Select value={newColor} onValueChange={(v) => setNewColor(v as HabitColor)}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{COLOR_OPTIONS.map((color) => (
										<SelectItem key={color} value={color}>
											<span className="capitalize">{color}</span>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDialogOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handleAdd} disabled={!newName.trim()}>
							Create
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
