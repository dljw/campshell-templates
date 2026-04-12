import type { Action, Article, Cycle, Domain, Hub, Keyword, Quadrant } from "../types.js";

function formatKeywordList(keywords: Keyword[]): string {
	return keywords
		.map((k) => {
			const parts = [`"${k.term}"`];
			if (k.searchVolume != null) parts.push(`SV: ${k.searchVolume.toLocaleString()}`);
			if (k.keywordDifficulty != null) parts.push(`KD: ${k.keywordDifficulty}`);
			if (k.position != null) parts.push(`pos: ${k.position.toFixed(1)}`);
			return `- ${parts.join(", ")}`;
		})
		.join("\n");
}

function articleFileLine(article: Article, domain?: Domain): string {
	if (article.filePath) {
		const parts: string[] = [];
		if (domain?.basePath) parts.push(domain.basePath);
		if (domain?.articlesDir) parts.push(domain.articlesDir);
		parts.push(article.filePath);
		return `File: ${parts.join("/").replace(/\/+/g, "/")}`;
	}
	return article.pageUrl ? `URL: ${article.pageUrl}` : "";
}

function mpcUpdateArticle(articleId: string, fields: string): string {
	return `\nAfter completing, update the article using:\ncampshell-update-entity(template: "content-strategy", entity: "articles", id: "${articleId}", data: { ${fields} })`;
}

// ---------------------------------------------------------------------------
// Prompt generators
// ---------------------------------------------------------------------------

export function generateCycleAnalysisPrompt(
	cycle: Cycle,
	prevCycle: Cycle | null,
	keywords: Keyword[],
): string {
	const s = cycle.sitewide;
	const qc = cycle.quadrantCounts;
	let prompt = `I'm using Campshell Content Strategy. Here's my latest GSC cycle data:\n\n`;
	prompt += `Period: ${cycle.periodStart} – ${cycle.periodEnd}\n`;
	if (s) {
		prompt += `Impressions: ${s.impressions.toLocaleString()} | Clicks: ${s.clicks} | CTR: ${s.ctr}% | Avg Position: ${s.avgPosition}\n`;
	}
	if (cycle.dailyTrend) {
		prompt += `Trajectory: ${cycle.dailyTrend.trajectory} (${cycle.dailyTrend.firstHalfAvg} → ${cycle.dailyTrend.secondHalfAvg} avg impr/day)\n`;
	}
	if (qc) {
		prompt += `\nQuadrant distribution: ${qc.stars} stars, ${qc.quickWins} quick-wins, ${qc.ctrOpportunities} CTR opps, ${qc.longTermTargets} long-term, ${qc.earlySignals} early signals, ${qc.dogs} dogs\n`;
	}

	if (prevCycle?.sitewide && s) {
		const pctImpr = prevCycle.sitewide.impressions > 0
			? ((s.impressions - prevCycle.sitewide.impressions) / prevCycle.sitewide.impressions * 100).toFixed(1)
			: "N/A";
		prompt += `\nVs previous cycle: impressions ${pctImpr}% change\n`;
	}

	if (cycle.pageSnapshots && cycle.pageSnapshots.length > 0) {
		prompt += `\nTop pages:\n`;
		for (const p of cycle.pageSnapshots.slice(0, 5)) {
			prompt += `- ${p.pageUrl} — ${p.impressions} impr, ${p.clicks} clicks, pos ${p.position.toFixed(1)}\n`;
		}
	}

	prompt += `\nAnalyze this cycle and create optimization actions. For each action specify:\n`;
	prompt += `1. Description of what to do\n2. Which article(s) it affects\n3. Expected outcome (metric + direction)\n4. Priority (high/medium/low)\n\n`;
	prompt += `Use campshell-create-entity(template: "content-strategy", entity: "actions") to create each action.`;

	return prompt;
}

export function generateArticleWritePrompt(
	article: Article,
	keywords: Keyword[],
	hub?: Hub,
	domain?: Domain,
): string {
	const articleKws = keywords.filter((k) => k.articleId === article.id);
	let prompt = `I'm using Campshell Content Strategy. Please write/improve this article:\n\n`;
	prompt += `Title: ${article.title}\n`;
	const fileLine = articleFileLine(article, domain);
	if (fileLine) prompt += `${fileLine}\n`;
	if (article.pageUrl) prompt += `URL: ${article.pageUrl}\n`;
	if (hub) prompt += `Hub: ${hub.name}\n`;
	if (article.primaryKeyword) prompt += `Primary keyword: "${article.primaryKeyword}"\n`;

	if (articleKws.length > 0) {
		prompt += `\nTarget keywords to include naturally:\n`;
		prompt += formatKeywordList(articleKws);
		prompt += "\n";
	}

	if (domain?.articleFormat) {
		const fmt = domain.articleFormat;
		if (fmt.name) prompt += `\nArticle format: ${fmt.name}\n`;
		if (fmt.defaultWordCount) prompt += `Target word count: ${fmt.defaultWordCount}\n`;
		if (fmt.sections && fmt.sections.length > 0) {
			prompt += `\nExpected sections:\n`;
			for (const s of fmt.sections) {
				prompt += `- ${s.name}${s.required ? " (required)" : ""}`;
				if (s.description) prompt += ` — ${s.description}`;
				prompt += "\n";
				if (s.guidanceNotes) prompt += `  Guidance: ${s.guidanceNotes}\n`;
			}
		}
		if (fmt.frontmatterFields && fmt.frontmatterFields.length > 0) {
			prompt += `\nExpected frontmatter fields: ${fmt.frontmatterFields.join(", ")}\n`;
		}
	}

	prompt += mpcUpdateArticle(article.id, `status: "published", publishDate: "${new Date().toISOString().split("T")[0]}", wordCount: <actual count>`);

	return prompt;
}

export function generateArticleOptimizePrompt(
	article: Article,
	keywords: Keyword[],
	domain?: Domain,
): string {
	const underperforming = keywords
		.filter((k) => k.articleId === article.id && k.position != null && k.position > 20)
		.sort((a, b) => (b.impressions ?? 0) - (a.impressions ?? 0));

	let prompt = `I'm using Campshell Content Strategy. Optimize this article:\n\n`;
	prompt += `Title: ${article.title}\n`;
	const fileLine = articleFileLine(article, domain);
	if (fileLine) prompt += `${fileLine}\n`;
	if (article.pageUrl) prompt += `URL: ${article.pageUrl}\n`;
	prompt += `Current word count: ${article.wordCount ?? "unknown"}\n`;

	if (underperforming.length > 0) {
		prompt += `\nUnderperforming keywords (position >20):\n`;
		prompt += formatKeywordList(underperforming);
		prompt += "\n";
	}

	prompt += `\nSuggest specific content improvements:\n`;
	prompt += `1. Sections to add or expand\n2. Keywords to weave in more naturally\n3. Title/meta description rewrites if needed\n4. Internal linking opportunities\n`;
	prompt += mpcUpdateArticle(article.id, `lastOptimized: "${new Date().toISOString().split("T")[0]}", status: "optimizing"`);

	return prompt;
}

export function generateKeywordActionPrompt(
	quadrant: Quadrant,
	keywords: Keyword[],
	articles: Article[],
	domain?: Domain,
): string {
	const qkws = keywords.filter((k) => k.quadrant === quadrant);
	const labels: Record<Quadrant, string> = {
		star: "Stars (protect & strengthen)",
		"quick-win": "Quick Wins (optimize to push into top 10)",
		"ctr-opportunity": "CTR Opportunities (rewrite titles/meta)",
		"long-term-target": "Long-term Targets (build content & links)",
		"early-signal": "Early Signals (monitor, too early to optimize)",
		dog: "Dogs (deprioritize or investigate)",
	};

	let prompt = `I'm using Campshell Content Strategy. Here are my ${labels[quadrant]} keywords:\n\n`;
	for (const kw of qkws.slice(0, 20)) {
		const article = articles.find((a) => a.id === kw.articleId);
		prompt += `- "${kw.term}" — pos ${kw.position?.toFixed(1) ?? "?"}, ${kw.impressions ?? 0} impr, ${kw.ctr?.toFixed(1) ?? 0}% CTR`;
		if (article) {
			prompt += ` → ${article.slug}`;
			const fileLine = articleFileLine(article, domain);
			if (fileLine) prompt += ` (${fileLine})`;
		}
		prompt += "\n";
	}

	prompt += `\nFor each keyword, suggest a specific optimization action.\n`;
	prompt += `Use campshell-create-entity(template: "content-strategy", entity: "actions") to create each action.`;

	return prompt;
}

export function generateActionExecutePrompt(
	action: Action,
	articles: Article[],
	keywords: Keyword[],
	domain?: Domain,
): string {
	const affected = articles.filter((a) => action.articleIds?.includes(a.id));

	let prompt = `I'm using Campshell Content Strategy. Execute this optimization action:\n\n`;
	prompt += `Action: ${action.description}\n`;
	if (action.type) prompt += `Type: ${action.type}\n`;

	for (const article of affected) {
		prompt += `\nArticle: ${article.title}\n`;
		const fileLine = articleFileLine(article, domain);
		if (fileLine) prompt += `${fileLine}\n`;
		const articleKws = keywords.filter((k) => k.articleId === article.id);
		if (articleKws.length > 0) {
			prompt += `Keywords:\n${formatKeywordList(articleKws.slice(0, 10))}\n`;
		}
	}

	if (action.expectedOutcome) {
		prompt += `\nExpected outcome: ${action.expectedOutcome.metric} should ${action.expectedOutcome.direction}`;
		if (action.expectedOutcome.baselineValue != null) {
			prompt += ` (baseline: ${action.expectedOutcome.baselineValue})`;
		}
		prompt += "\n";
	}

	prompt += `\nAfter completing, update the action status:\ncampshell-update-entity(template: "content-strategy", entity: "actions", id: "${action.id}", data: { status: "done" })`;

	return prompt;
}

export function generateHubGapPrompt(
	hub: Hub,
	articles: Article[],
	keywords: Keyword[],
	domain?: Domain,
): string {
	const hubArticles = articles.filter((a) => a.hubId === hub.id);
	const unpublished = hubArticles.filter((a) => a.status !== "published" && a.status !== "optimizing");
	const hubKws = keywords.filter((k) => hubArticles.some((a) => a.id === k.articleId));
	const totalSV = hubKws.reduce((s, k) => s + (k.searchVolume ?? 0), 0);

	let prompt = `I'm using Campshell Content Strategy. Content hub "${hub.name}" needs more content:\n\n`;
	prompt += `Published: ${hubArticles.length - unpublished.length}/${hubArticles.length} articles\n`;
	prompt += `Total keyword SV targeted: ${totalSV.toLocaleString()}\n`;

	if (unpublished.length > 0) {
		prompt += `\nUnpublished articles:\n`;
		for (const a of unpublished) {
			prompt += `- "${a.title}" (${a.status}) — primary KW: ${a.primaryKeyword ?? "none"}`;
			const fileLine = articleFileLine(a, domain);
			if (fileLine) prompt += ` — ${fileLine}`;
			prompt += "\n";
		}
	}

	prompt += `\nSuggest:\n1. Content briefs for unpublished articles\n2. New article ideas to fill gaps in this hub\n3. Internal linking strategy between hub articles\n\n`;
	prompt += `Use campshell-create-entity(template: "content-strategy", entity: "articles") to create new article entries.`;

	return prompt;
}

export function generateMetaRewritePrompt(
	keyword: Keyword,
	article: Article | undefined,
	domain?: Domain,
): string {
	let prompt = `I'm using Campshell Content Strategy. Rewrite the title and meta description for better CTR:\n\n`;
	prompt += `Keyword: "${keyword.term}"\n`;
	prompt += `Position: ${keyword.position?.toFixed(1) ?? "?"} | Impressions: ${keyword.impressions ?? 0} | CTR: ${keyword.ctr?.toFixed(1) ?? 0}%\n`;
	if (article) {
		prompt += `Current title: ${article.title}\n`;
		const fileLine = articleFileLine(article, domain);
		if (fileLine) prompt += `${fileLine}\n`;
		if (article.pageUrl) prompt += `URL: ${article.pageUrl}\n`;
	}

	prompt += `\nProvide:\n1. 3 title tag options (under 60 chars, include keyword naturally)\n2. 3 meta description options (under 155 chars, include CTA)\n3. Explain why each option should improve CTR\n`;

	return prompt;
}
