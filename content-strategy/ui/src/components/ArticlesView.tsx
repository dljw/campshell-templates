import { Card, CardContent } from "@campshell/ui-components";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import type { UseContentStrategyDataReturn } from "../hooks/useContentStrategyData.js";
import type { Domain } from "../types.js";
import { StatusBadge } from "./StatusBadge.js";
import { HubBadge } from "./HubBadge.js";
import { QuadrantBadge } from "./QuadrantBadge.js";
import { CopyPromptButton } from "./CopyPromptButton.js";
import { generateArticleWritePrompt, generateArticleOptimizePrompt } from "../lib/prompt-generators.js";

interface ArticlesViewProps {
	data: UseContentStrategyDataReturn;
	domainId: string | null;
	activeDomain: Domain | undefined;
}

export function ArticlesView({ data, domainId, activeDomain }: ArticlesViewProps) {
	const [expandedId, setExpandedId] = useState<string | null>(null);

	const articles = useMemo(() => {
		return [...data.articles]
			.filter((i) => !domainId || i.domainId === domainId)
			.sort((a, b) => {
				// Published first, then by date
				const aPublished = a.status === "published" || a.status === "optimizing" ? 0 : 1;
				const bPublished = b.status === "published" || b.status === "optimizing" ? 0 : 1;
				if (aPublished !== bPublished) return aPublished - bPublished;
				return (b.publishDate ?? b.scheduledDate ?? "").localeCompare(a.publishDate ?? a.scheduledDate ?? "");
			});
	}, [data.articles, domainId]);

	return (
		<div className="space-y-4">
			<h2 className="text-lg font-semibold">Articles</h2>

			<Card>
				<CardContent className="pt-4">
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b border-border/40 text-left text-xs text-muted-foreground">
									<th className="pb-2 w-6" />
									<th className="pb-2 pr-3">Title</th>
									<th className="pb-2 pr-3">Hub</th>
									<th className="pb-2 pr-3">Status</th>
									<th className="pb-2 pr-3">Published</th>
									<th className="pb-2 pr-3 text-right">Impr</th>
									<th className="pb-2 pr-3 text-right">Clicks</th>
									<th className="pb-2 pr-3 text-right">CTR</th>
									<th className="pb-2 pr-3 text-right">Avg Pos</th>
									<th className="pb-2 text-right">Keywords</th>
									<th className="pb-2 w-8" />
								</tr>
							</thead>
							<tbody>
								{articles.map((article) => {
									const isExpanded = expandedId === article.id;
									const articleKeywords = data.keywords.filter((k) => k.articleId === article.id);
									const totalImpr = articleKeywords.reduce((s, k) => s + (k.impressions ?? 0), 0);
									const totalClicks = articleKeywords.reduce((s, k) => s + (k.clicks ?? 0), 0);
									const ctr = totalImpr > 0 ? (totalClicks / totalImpr) * 100 : 0;
									const positions = articleKeywords.filter((k) => k.position != null && k.position > 0);
									const avgPos = positions.length > 0
										? positions.reduce((s, k) => s + (k.position ?? 0), 0) / positions.length
										: 0;
									const articleActions = data.actions.filter((a) => a.articleIds?.includes(article.id));
									const hub = data.hubs.find((h) => h.id === article.hubId);

									return (
										<>
											<tr
												key={article.id}
												className="border-b border-border/20 cursor-pointer hover:bg-muted/50"
												data-campshell-entity={`content-strategy/article/articles/${article.id}.json`}
												onClick={() => setExpandedId(isExpanded ? null : article.id)}
											>
												<td className="py-2">
													{isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
												</td>
												<td className="py-2 pr-3 font-medium">{article.title}</td>
												<td className="py-2 pr-3"><HubBadge hub={hub} /></td>
												<td className="py-2 pr-3"><StatusBadge status={article.status} /></td>
												<td className="py-2 pr-3 text-muted-foreground">{article.publishDate ?? "—"}</td>
												<td className="py-2 pr-3 text-right">{totalImpr}</td>
												<td className="py-2 pr-3 text-right">{totalClicks}</td>
												<td className="py-2 pr-3 text-right">{ctr > 0 ? `${ctr.toFixed(1)}%` : "—"}</td>
												<td className="py-2 pr-3 text-right">{avgPos > 0 ? avgPos.toFixed(1) : "—"}</td>
												<td className="py-2 text-right">{articleKeywords.length}</td>
												<td className="py-2">
													<CopyPromptButton
														label="Write"
														prompt={generateArticleWritePrompt(article, data.keywords, hub, activeDomain)}
													/>
												</td>
											</tr>
											{isExpanded && (
												<tr key={`${article.id}-detail`}>
													<td colSpan={11} className="p-4 bg-muted/30">
														<div className="space-y-4">
															{/* Article metadata */}
															<div className="grid grid-cols-4 gap-4 text-xs">
																<div><span className="text-muted-foreground">Slug: </span>{article.slug}</div>
																<div><span className="text-muted-foreground">URL: </span>{article.pageUrl ?? "—"}</div>
																<div><span className="text-muted-foreground">Type: </span>{article.contentType ?? "—"}</div>
																<div><span className="text-muted-foreground">Words: </span>{article.wordCount ?? "—"}</div>
															</div>

															{/* File path editable field */}
															<div className="flex items-center gap-2 text-xs">
																<span className="text-muted-foreground shrink-0">File path:</span>
																<input
																	type="text"
																	defaultValue={article.filePath ?? ""}
																	placeholder="e.g. content/blog/my-article.mdx"
																	className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground w-80"
																	onBlur={(e) => {
																		const val = e.target.value.trim();
																		if (val !== (article.filePath ?? "")) {
																			data.updateArticle({ ...article, filePath: val || undefined });
																		}
																	}}
																/>
															</div>

															{/* Optimize prompt button */}
															<div className="flex items-center gap-2">
																<CopyPromptButton
																	label="Optimize"
																	variant="outline"
																	prompt={generateArticleOptimizePrompt(article, data.keywords, activeDomain)}
																/>
															</div>

															{/* Keywords for this article */}
															{articleKeywords.length > 0 && (
																<div>
																	<h4 className="text-xs font-medium mb-2 text-muted-foreground">Keywords ({articleKeywords.length})</h4>
																	<table className="w-full text-xs">
																		<thead>
																			<tr className="text-muted-foreground border-b border-border/30">
																				<th className="pb-1 text-left">Term</th>
																				<th className="pb-1 text-right">SV</th>
																				<th className="pb-1 text-right">KD</th>
																				<th className="pb-1 text-right">Impr</th>
																				<th className="pb-1 text-right">Pos</th>
																				<th className="pb-1">Quadrant</th>
																			</tr>
																		</thead>
																		<tbody>
																			{articleKeywords.map((kw) => (
																				<tr key={kw.id} className="border-b border-border/10">
																					<td className="py-1">{kw.term}</td>
																					<td className="py-1 text-right">{kw.searchVolume ?? "—"}</td>
																					<td className="py-1 text-right">{kw.keywordDifficulty ?? "—"}</td>
																					<td className="py-1 text-right">{kw.impressions ?? 0}</td>
																					<td className="py-1 text-right">{kw.position?.toFixed(1) ?? "—"}</td>
																					<td className="py-1"><QuadrantBadge quadrant={kw.quadrant} /></td>
																				</tr>
																			))}
																		</tbody>
																	</table>
																</div>
															)}

															{/* Actions for this article */}
															{articleActions.length > 0 && (
																<div>
																	<h4 className="text-xs font-medium mb-2 text-muted-foreground">Actions ({articleActions.length})</h4>
																	<ul className="space-y-1">
																		{articleActions.map((action) => (
																			<li key={action.id} className="flex items-center gap-2 text-xs">
																				<StatusBadge status={action.status} />
																				<span>{action.description}</span>
																			</li>
																		))}
																	</ul>
																</div>
															)}

															{article.notes && (
																<div>
																	<h4 className="text-xs font-medium mb-1 text-muted-foreground">Notes</h4>
																	<p className="text-xs text-muted-foreground">{article.notes}</p>
																</div>
															)}
														</div>
													</td>
												</tr>
											)}
										</>
									);
								})}
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
