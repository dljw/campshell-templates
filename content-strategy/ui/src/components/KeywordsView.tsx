import { Card, CardContent, CardHeader, CardTitle } from "@campshell/ui-components";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useMemo, useState } from "react";
import type { UseContentStrategyDataReturn } from "../hooks/useContentStrategyData.js";
import type { Quadrant } from "../types.js";
import { QuadrantBadge } from "./QuadrantBadge.js";
import { KeywordQuadrantChart } from "./KeywordQuadrantChart.js";

interface KeywordsViewProps {
	data: UseContentStrategyDataReturn;
}

const QUADRANT_OPTIONS: Array<{ value: Quadrant | ""; label: string }> = [
	{ value: "", label: "All Quadrants" },
	{ value: "star", label: "Stars" },
	{ value: "quick-win", label: "Quick Wins" },
	{ value: "ctr-opportunity", label: "CTR Opportunities" },
	{ value: "long-term-target", label: "Long-term Targets" },
	{ value: "early-signal", label: "Early Signals" },
	{ value: "dog", label: "Dogs" },
];

export function KeywordsView({ data }: KeywordsViewProps) {
	const [filter, setFilter] = useState<Quadrant | "">("");
	const [search, setSearch] = useState("");

	const filtered = useMemo(() => {
		let kws = data.keywords;
		if (filter) kws = kws.filter((k) => k.quadrant === filter);
		if (search) {
			const lower = search.toLowerCase();
			kws = kws.filter((k) => k.term.toLowerCase().includes(lower));
		}
		return [...kws].sort((a, b) => (b.impressions ?? 0) - (a.impressions ?? 0));
	}, [data.keywords, filter, search]);

	return (
		<div className="space-y-6">
			<h2 className="text-lg font-semibold">Keywords</h2>

			{/* Quadrant chart */}
			<Card>
				<CardHeader>
					<CardTitle className="text-sm font-medium">Keyword Quadrant Map</CardTitle>
				</CardHeader>
				<CardContent>
					<KeywordQuadrantChart keywords={data.keywords} />
				</CardContent>
			</Card>

			{/* Filters */}
			<div className="flex items-center gap-3">
				<select
					value={filter}
					onChange={(e) => setFilter(e.target.value as Quadrant | "")}
					className="rounded-md border border-border bg-background px-3 py-1.5 text-sm"
				>
					{QUADRANT_OPTIONS.map((opt) => (
						<option key={opt.value} value={opt.value}>{opt.label}</option>
					))}
				</select>
				<input
					type="text"
					placeholder="Search keywords..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="rounded-md border border-border bg-background px-3 py-1.5 text-sm w-64"
				/>
				<span className="text-xs text-muted-foreground ml-auto">{filtered.length} keywords</span>
			</div>

			{/* Table */}
			<Card>
				<CardContent className="pt-4">
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b border-border/40 text-left text-xs text-muted-foreground">
									<th className="pb-2 pr-3">Term</th>
									<th className="pb-2 pr-3">Article</th>
									<th className="pb-2 pr-3 text-right">SV</th>
									<th className="pb-2 pr-3 text-right">KD</th>
									<th className="pb-2 pr-3">Intent</th>
									<th className="pb-2 pr-3 text-right">Impr</th>
									<th className="pb-2 pr-3 text-right">Clicks</th>
									<th className="pb-2 pr-3 text-right">CTR</th>
									<th className="pb-2 pr-3 text-right">Position</th>
									<th className="pb-2 pr-3">Delta</th>
									<th className="pb-2">Quadrant</th>
								</tr>
							</thead>
							<tbody>
								{filtered.map((kw) => {
									const article = data.articles.find((a) => a.id === kw.articleId);
									const delta = kw.previousPosition != null && kw.position != null
										? kw.previousPosition - kw.position
										: null;
									return (
										<tr key={kw.id} className="border-b border-border/20">
											<td className="py-2 pr-3 font-medium">{kw.term}</td>
											<td className="py-2 pr-3 text-muted-foreground truncate max-w-[120px]">
												{article?.slug ?? "—"}
											</td>
											<td className="py-2 pr-3 text-right">{kw.searchVolume?.toLocaleString() ?? "—"}</td>
											<td className="py-2 pr-3 text-right">{kw.keywordDifficulty ?? "—"}</td>
											<td className="py-2 pr-3">
												{kw.intent && (
													<span className="text-xs text-muted-foreground">{kw.intent}</span>
												)}
											</td>
											<td className="py-2 pr-3 text-right">{kw.impressions ?? 0}</td>
											<td className="py-2 pr-3 text-right">{kw.clicks ?? 0}</td>
											<td className="py-2 pr-3 text-right">{kw.ctr != null ? `${kw.ctr.toFixed(1)}%` : "—"}</td>
											<td className="py-2 pr-3 text-right">{kw.position?.toFixed(1) ?? "—"}</td>
											<td className="py-2 pr-3">
												{delta != null && delta !== 0 && (
													<span className={`flex items-center text-xs ${delta > 0 ? "text-green-600" : "text-red-500"}`}>
														{delta > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
														{Math.abs(delta).toFixed(1)}
													</span>
												)}
											</td>
											<td className="py-2"><QuadrantBadge quadrant={kw.quadrant} /></td>
										</tr>
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
