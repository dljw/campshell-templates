import { Card, CardContent, CardHeader, CardTitle } from "@campshell/ui-components";
import { useMemo } from "react";
import type { UseContentStrategyDataReturn } from "../hooks/useContentStrategyData.js";
import type { Color, Domain } from "../types.js";
import { StatusBadge } from "./StatusBadge.js";
import { CopyPromptButton } from "./CopyPromptButton.js";
import { generateHubGapPrompt } from "../lib/prompt-generators.js";

interface HubsViewProps {
	data: UseContentStrategyDataReturn;
	domainId: string | null;
}

const COLOR_BG: Record<Color, string> = {
	red: "border-l-red-500",
	orange: "border-l-orange-500",
	yellow: "border-l-yellow-500",
	green: "border-l-green-500",
	blue: "border-l-blue-500",
	purple: "border-l-purple-500",
	pink: "border-l-pink-500",
	gray: "border-l-gray-500",
};

export function HubsView({ data, domainId }: HubsViewProps) {
	const activeDomain = useMemo(
		() => data.domains.find((d) => d.id === domainId),
		[data.domains, domainId],
	);

	const filteredHubs = useMemo(
		() => data.hubs.filter((i) => !domainId || i.domainId === domainId),
		[data.hubs, domainId],
	);

	const hubDetails = useMemo(() => {
		return filteredHubs.map((hub) => {
			const hubArticles = data.articles.filter((a) => a.hubId === hub.id);
			const pillar = hubArticles.find((a) => a.id === hub.pillarArticleId);
			const clusters = hubArticles.filter((a) => a.id !== hub.pillarArticleId);
			const published = hubArticles.filter(
				(a) => a.status === "published" || a.status === "optimizing",
			).length;
			const hubKeywords = data.keywords.filter((k) =>
				hubArticles.some((a) => a.id === k.articleId),
			);
			const totalSV = hubKeywords.reduce((s, k) => s + (k.searchVolume ?? 0), 0);
			const totalImpr = hubKeywords.reduce((s, k) => s + (k.impressions ?? 0), 0);
			return {
				hub,
				pillar,
				clusters,
				published,
				total: hubArticles.length,
				totalSV,
				totalImpr,
				keywordCount: hubKeywords.length,
				hubArticles,
				hubKeywords,
			};
		});
	}, [filteredHubs, data.articles, data.keywords]);

	return (
		<div className="space-y-4">
			<h2 className="text-lg font-semibold">Content Hubs</h2>

			{hubDetails.length === 0 ? (
				<p className="text-sm text-muted-foreground">No hubs defined yet</p>
			) : (
				<div className="grid md:grid-cols-2 gap-4">
					{hubDetails.map(({ hub, pillar, clusters, published, total, totalSV, totalImpr, keywordCount, hubArticles, hubKeywords }) => (
						<Card key={hub.id} className={`border-l-4 ${COLOR_BG[hub.color ?? "gray"]}`}>
							<CardHeader className="pb-3">
								<div className="flex items-center justify-between">
									<CardTitle className="text-sm font-medium">{hub.name}</CardTitle>
									<div className="flex items-center gap-2">
										<CopyPromptButton
											prompt={generateHubGapPrompt(hub, hubArticles, hubKeywords, activeDomain)}
											label="Gap Analysis"
											variant="ghost"
										/>
										{hub.status && <StatusBadge status={hub.status} />}
									</div>
								</div>
								{hub.description && (
									<p className="text-xs text-muted-foreground mt-1">{hub.description}</p>
								)}
							</CardHeader>
							<CardContent className="space-y-3">
								{/* Progress bar */}
								<div>
									<div className="flex justify-between text-xs text-muted-foreground mb-1">
										<span>Coverage</span>
										<span>{published}/{total} published</span>
									</div>
									<div className="h-2 bg-muted rounded-full overflow-hidden">
										<div
											className="h-full bg-green-500 rounded-full transition-all"
											style={{ width: total > 0 ? `${(published / total) * 100}%` : "0%" }}
										/>
									</div>
								</div>

								{/* Stats */}
								<div className="grid grid-cols-3 gap-2 text-xs">
									<div>
										<span className="text-muted-foreground block">Keywords</span>
										<span className="font-medium">{keywordCount}</span>
									</div>
									<div>
										<span className="text-muted-foreground block">Total SV</span>
										<span className="font-medium">{totalSV.toLocaleString()}</span>
									</div>
									<div>
										<span className="text-muted-foreground block">Impressions</span>
										<span className="font-medium">{totalImpr.toLocaleString()}</span>
									</div>
								</div>

								{/* Pillar */}
								{pillar && (
									<div>
										<span className="text-xs text-muted-foreground">Pillar: </span>
										<span className="text-xs font-medium">{pillar.title}</span>
										<span className="ml-2"><StatusBadge status={pillar.status} /></span>
									</div>
								)}

								{/* Clusters */}
								{clusters.length > 0 && (
									<div>
										<span className="text-xs text-muted-foreground block mb-1">Clusters:</span>
										<ul className="space-y-0.5">
											{clusters.map((c) => (
												<li key={c.id} className="flex items-center gap-2 text-xs">
													<StatusBadge status={c.status} />
													<span className="truncate">{c.title}</span>
												</li>
											))}
										</ul>
									</div>
								)}
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
