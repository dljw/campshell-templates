import { Button } from "@campshell/ui-components";
import { BarChart3, CalendarDays, CalendarCheck, FolderOpen, ListChecks } from "lucide-react";
import { useState } from "react";
import type { UseHabitDataReturn } from "./hooks/useHabitData.js";
import { CalendarView } from "./components/CalendarView.js";
import { CategoriesView } from "./components/CategoriesView.js";
import { ConnectionStatus } from "./components/ConnectionStatus.js";
import { HabitsView } from "./components/HabitsView.js";
import { StatsView } from "./components/StatsView.js";
import { TodayView } from "./components/TodayView.js";

type Tab = "today" | "calendar" | "habits" | "stats" | "categories";

interface AppProps {
	data: UseHabitDataReturn;
}

const TABS: Array<{ id: Tab; label: string; icon: React.ReactNode }> = [
	{ id: "today", label: "Today", icon: <CalendarCheck className="h-4 w-4" /> },
	{ id: "calendar", label: "Calendar", icon: <CalendarDays className="h-4 w-4" /> },
	{ id: "habits", label: "Habits", icon: <ListChecks className="h-4 w-4" /> },
	{ id: "stats", label: "Stats", icon: <BarChart3 className="h-4 w-4" /> },
	{ id: "categories", label: "Categories", icon: <FolderOpen className="h-4 w-4" /> },
];

export function App({ data }: AppProps) {
	const [tab, setTab] = useState<Tab>("today");

	return (
		<div className="flex flex-col h-full bg-background text-foreground">
			{/* Header */}
			<header className="flex items-center px-6 py-3 border-b border-border/40 shrink-0 gap-6">
				<h1 className="text-base font-semibold tracking-tight">Habit Tracker</h1>
				<nav className="flex items-center gap-1">
					{TABS.map((t) => (
						<Button
							key={t.id}
							variant={tab === t.id ? "secondary" : "ghost"}
							size="sm"
							onClick={() => setTab(t.id)}
							className="gap-1.5"
						>
							{t.icon}
							<span className="hidden sm:inline">{t.label}</span>
						</Button>
					))}
				</nav>
			</header>

			{/* Content */}
			<main className="flex-1 overflow-auto p-6">
				<div className="max-w-6xl mx-auto">
					{tab === "today" && (
						<TodayView
							habits={data.habits}
							completions={data.completions}
							categories={data.categories}
							isLoading={data.isLoading}
							onComplete={data.createCompletion}
							onUncomplete={data.deleteCompletion}
						/>
					)}
					{tab === "calendar" && (
						<CalendarView
							habits={data.habits}
							completions={data.completions}
							isLoading={data.isLoading}
						/>
					)}
					{tab === "habits" && (
						<HabitsView
							habits={data.habits}
							completions={data.completions}
							categories={data.categories}
							isLoading={data.isLoading}
							onCreate={data.createHabit}
							onUpdate={data.updateHabit}
							onDelete={data.deleteHabit}
						/>
					)}
					{tab === "stats" && (
						<StatsView
							habits={data.habits}
							completions={data.completions}
							categories={data.categories}
							isLoading={data.isLoading}
						/>
					)}
					{tab === "categories" && (
						<CategoriesView
							categories={data.categories}
							isLoading={data.isLoading}
							onUpdate={data.updateCategories}
						/>
					)}
				</div>
			</main>

			<ConnectionStatus status={data.status} />
		</div>
	);
}
