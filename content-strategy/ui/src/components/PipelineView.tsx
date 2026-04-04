import { Card, CardContent, CardHeader, CardTitle, Button } from "@campshell/ui-components";
import { CalendarDays, List } from "lucide-react";
import { useMemo, useState } from "react";
import type { UseContentStrategyDataReturn } from "../hooks/useContentStrategyData.js";
import type { Article, Phase } from "../types.js";
import { StatusBadge } from "./StatusBadge.js";
import { HubBadge } from "./HubBadge.js";
import { PriorityBadge } from "./PriorityBadge.js";

interface PipelineViewProps {
	data: UseContentStrategyDataReturn;
}

const PHASE_LABELS: Record<Phase, string> = {
	"phase-1": "Phase 1 — High Priority",
	"phase-2": "Phase 2 — Optimization & Expansion",
	"phase-3": "Phase 3 — Polish & Fill Gaps",
};

function CalendarMonth({ articles, hubs, year, month }: {
	articles: Article[];
	hubs: UseContentStrategyDataReturn["hubs"];
	year: number;
	month: number;
}) {
	const firstDay = new Date(year, month, 1).getDay();
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const monthLabel = new Date(year, month, 1).toLocaleString("default", { month: "long", year: "numeric" });

	const articlesByDate = useMemo(() => {
		const map = new Map<number, Article[]>();
		for (const a of articles) {
			if (!a.scheduledDate) continue;
			const d = new Date(a.scheduledDate);
			if (d.getFullYear() === year && d.getMonth() === month) {
				const day = d.getDate();
				map.set(day, [...(map.get(day) ?? []), a]);
			}
		}
		return map;
	}, [articles, year, month]);

	return (
		<div>
			<h3 className="text-sm font-medium mb-2">{monthLabel}</h3>
			<div className="grid grid-cols-7 gap-px text-xs">
				{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
					<div key={d} className="text-center text-muted-foreground py-1 font-medium">{d}</div>
				))}
				{Array.from({ length: firstDay }).map((_, i) => (
					<div key={`empty-${i}`} />
				))}
				{Array.from({ length: daysInMonth }).map((_, i) => {
					const day = i + 1;
					const dayArticles = articlesByDate.get(day) ?? [];
					return (
						<div key={day} className="min-h-[60px] border border-border/30 rounded p-1">
							<span className="text-muted-foreground">{day}</span>
							{dayArticles.map((a) => {
								const hub = hubs.find((h) => h.id === a.hubId);
								return (
									<div key={a.id} className="mt-0.5 truncate text-[10px] leading-tight" title={a.title}>
										{hub && <HubBadge hub={hub} />}
										<span className="ml-1">{a.slug}</span>
									</div>
								);
							})}
						</div>
					);
				})}
			</div>
		</div>
	);
}

export function PipelineView({ data }: PipelineViewProps) {
	const [view, setView] = useState<"list" | "calendar">("list");

	const grouped = useMemo(() => {
		const groups: Record<string, Article[]> = { "phase-1": [], "phase-2": [], "phase-3": [], unassigned: [] };
		for (const a of data.articles) {
			const key = a.phase ?? "unassigned";
			if (!groups[key]) groups[key] = [];
			groups[key].push(a);
		}
		for (const key of Object.keys(groups)) {
			groups[key].sort((a, b) => (a.scheduledDate ?? "").localeCompare(b.scheduledDate ?? ""));
		}
		return groups;
	}, [data.articles]);

	const now = new Date();

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-semibold">Content Pipeline</h2>
				<div className="flex gap-1">
					<Button variant={view === "list" ? "secondary" : "ghost"} size="sm" onClick={() => setView("list")}>
						<List className="h-4 w-4 mr-1" /> List
					</Button>
					<Button variant={view === "calendar" ? "secondary" : "ghost"} size="sm" onClick={() => setView("calendar")}>
						<CalendarDays className="h-4 w-4 mr-1" /> Calendar
					</Button>
				</div>
			</div>

			{view === "list" ? (
				<div className="space-y-6">
					{(["phase-1", "phase-2", "phase-3", "unassigned"] as const).map((phase) => {
						const articles = grouped[phase];
						if (!articles || articles.length === 0) return null;
						return (
							<Card key={phase}>
								<CardHeader>
									<CardTitle className="text-sm font-medium">
										{PHASE_LABELS[phase as Phase] ?? "Unassigned"}
										<span className="ml-2 text-muted-foreground font-normal">({articles.length})</span>
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="overflow-x-auto">
										<table className="w-full text-sm">
											<thead>
												<tr className="border-b border-border/40 text-left text-xs text-muted-foreground">
													<th className="pb-2 pr-4">Title</th>
													<th className="pb-2 pr-4">Status</th>
													<th className="pb-2 pr-4">Hub</th>
													<th className="pb-2 pr-4">Primary KW</th>
													<th className="pb-2 pr-4">Scheduled</th>
													<th className="pb-2">Priority</th>
												</tr>
											</thead>
											<tbody>
												{articles.map((a) => (
													<tr key={a.id} className="border-b border-border/20">
														<td className="py-2 pr-4 font-medium">{a.title}</td>
														<td className="py-2 pr-4"><StatusBadge status={a.status} /></td>
														<td className="py-2 pr-4"><HubBadge hub={data.hubs.find((h) => h.id === a.hubId)} /></td>
														<td className="py-2 pr-4 text-muted-foreground">{a.primaryKeyword ?? "—"}</td>
														<td className="py-2 pr-4 text-muted-foreground">{a.scheduledDate ?? "—"}</td>
														<td className="py-2"><PriorityBadge priority={a.priority} /></td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>
			) : (
				<Card>
					<CardContent className="pt-6">
						<CalendarMonth articles={data.articles} hubs={data.hubs} year={now.getFullYear()} month={now.getMonth()} />
					</CardContent>
				</Card>
			)}
		</div>
	);
}
