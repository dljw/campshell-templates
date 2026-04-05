import { Card, CardContent } from "@campshell/ui-components";
import { useMemo, useState } from "react";
import type { UseContentStrategyDataReturn } from "../hooks/useContentStrategyData.js";
import type { ActionStatus, ActionType, Domain } from "../types.js";
import { generateActionExecutePrompt } from "../lib/prompt-generators.js";
import { CopyPromptButton } from "./CopyPromptButton.js";
import { StatusBadge } from "./StatusBadge.js";
import { PriorityBadge } from "./PriorityBadge.js";

interface ActionsViewProps {
	data: UseContentStrategyDataReturn;
	domainId: string | null;
	activeDomain: Domain | undefined;
}

const TYPE_LABELS: Record<ActionType, string> = {
	"keyword-addition": "Keyword Addition",
	"meta-rewrite": "Meta Rewrite",
	"content-expansion": "Content Expansion",
	"internal-linking": "Internal Linking",
	"cannibalization-fix": "Cannibalization Fix",
	technical: "Technical",
	"new-content": "New Content",
	other: "Other",
};

export function ActionsView({ data, domainId, activeDomain }: ActionsViewProps) {
	const [statusFilter, setStatusFilter] = useState<ActionStatus | "">("");
	const [typeFilter, setTypeFilter] = useState<ActionType | "">("");

	const filtered = useMemo(() => {
		let actions = data.actions.filter((i) => !domainId || i.domainId === domainId);
		if (statusFilter) actions = actions.filter((a) => a.status === statusFilter);
		if (typeFilter) actions = actions.filter((a) => a.type === typeFilter);
		return [...actions].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
	}, [data.actions, domainId, statusFilter, typeFilter]);

	return (
		<div className="space-y-4">
			<h2 className="text-lg font-semibold">Actions</h2>

			{/* Filters */}
			<div className="flex items-center gap-3">
				<select
					value={statusFilter}
					onChange={(e) => setStatusFilter(e.target.value as ActionStatus | "")}
					className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground"
				>
					<option value="">All Statuses</option>
					<option value="planned">Planned</option>
					<option value="in-progress">In Progress</option>
					<option value="done">Done</option>
					<option value="deferred">Deferred</option>
					<option value="cancelled">Cancelled</option>
				</select>
				<select
					value={typeFilter}
					onChange={(e) => setTypeFilter(e.target.value as ActionType | "")}
					className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground"
				>
					<option value="">All Types</option>
					{Object.entries(TYPE_LABELS).map(([value, label]) => (
						<option key={value} value={value}>{label}</option>
					))}
				</select>
				<span className="text-xs text-muted-foreground ml-auto">{filtered.length} actions</span>
			</div>

			<Card>
				<CardContent className="pt-4">
					{filtered.length === 0 ? (
						<p className="text-sm text-muted-foreground py-4 text-center">No actions match filters</p>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b border-border/40 text-left text-xs text-muted-foreground">
										<th className="pb-2 pr-3">Type</th>
										<th className="pb-2 pr-3">Status</th>
										<th className="pb-2 pr-3">Priority</th>
										<th className="pb-2 pr-3">Description</th>
										<th className="pb-2 pr-3">Articles</th>
										<th className="pb-2 pr-3">Expected</th>
										<th className="pb-2 pr-3">Outcome</th>
										<th className="pb-2" />
									</tr>
								</thead>
								<tbody>
									{filtered.map((action) => {
										const affectedArticles = data.articles.filter(
											(a) => action.articleIds?.includes(a.id),
										);
										return (
											<tr key={action.id} className="border-b border-border/20" data-campshell-entity={`content-strategy/action/actions/${action.id}.json`}>
												<td className="py-2 pr-3">
													<span className="text-xs text-muted-foreground">
														{action.type ? TYPE_LABELS[action.type] ?? action.type : "\u2014"}
													</span>
												</td>
												<td className="py-2 pr-3"><StatusBadge status={action.status} /></td>
												<td className="py-2 pr-3"><PriorityBadge priority={action.priority} /></td>
												<td className="py-2 pr-3 max-w-[300px]">
													<span className="line-clamp-2">{action.description}</span>
												</td>
												<td className="py-2 pr-3 text-xs text-muted-foreground">
													{affectedArticles.map((a) => a.slug).join(", ") || "\u2014"}
												</td>
												<td className="py-2 pr-3 text-xs text-muted-foreground">
													{action.expectedOutcome?.metric
														? `${action.expectedOutcome.metric} ${action.expectedOutcome.direction ?? ""}`
														: "\u2014"}
												</td>
												<td className="py-2 text-xs">
													{action.actualOutcome ? (
														<span className="text-green-600">
															{action.actualOutcome.beforeValue} → {action.actualOutcome.afterValue}
														</span>
													) : (
														<span className="text-muted-foreground">Pending</span>
													)}
												</td>
												<td className="py-2 pl-2">
													<CopyPromptButton
														prompt={generateActionExecutePrompt(action, data.articles, data.keywords, activeDomain)}
													/>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
