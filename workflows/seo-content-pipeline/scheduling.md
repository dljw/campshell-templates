# Scheduling — SEO Content Pipeline

Ready-to-use cron recipes for automating the SEO Content Pipeline. Copy the prompts as-is into CronCreate or RemoteTrigger.

---

## Session cron vs. persistent triggers

| Tool | Lifespan | Use when |
|---|---|---|
| `CronCreate` | Current session only (auto-expires) | Trying something out, one-off automations |
| `RemoteTrigger` | Persists across sessions | Permanent recurring automation |

---

## Recipe 1: Weekly Performance Review
**When:** Every Monday at 9:00 AM

**What it does:** Checks for new GSC CSV files, imports them into a cycle, syncs keyword positions and page metrics to seo-tracker, and delivers a natural-language summary of what changed, which keywords moved quadrants, and the top 3 actions to take this week.

**Cron expression:** `3 9 * * 1`

**Prompt:**
```
Run the SEO Content Pipeline performance review workflow. 

Steps:
1. Check ~/.campshell/data/content-strategy/ for any CSV files ready to import (Queries.csv, Pages.csv, Chart.csv).
2. If CSV files are found, import them as a new GSC cycle following the content-strategy SKILL.md import workflow.
3. After import (or if no CSVs), read the latest cycle data and sync updated keyword positions to seo-tracker: for each keyword in content-strategy with a position value, update the matching seo-tracker keyword (same ID) rounding position to integer.
4. Update seo-tracker pages with avgPosition from cycle page snapshots.
5. Summarise in plain language: total impressions and clicks vs previous cycle, keywords that changed quadrant, top 3 quick-win opportunities, and any articles that need refresh.
6. Create content-strategy actions for the top opportunities found.
```

---

## Recipe 2: Daily Position Check
**When:** Every day at 8:00 AM

**What it does:** Scans seo-tracker for keywords whose position dropped more than 5 places since the last update. Flags them as a brief alert with suggested actions.

**Cron expression:** `17 8 * * *`

**Prompt:**
```
Run a quick SEO position check.

Steps:
1. Read all keywords from ~/.campshell/data/seo-tracker/keywords/.
2. For each keyword where position and previousPosition are both set, calculate the delta (position - previousPosition). A positive delta means the position number went up (ranking dropped).
3. List any keywords with a delta greater than 5 — these have dropped significantly.
4. For each dropped keyword, check if there is a matching article in content-strategy (same ID as articleId/pageId) and note its current status.
5. Report the drops in plain language: "Your ranking for '[term]' dropped from position X to Y. It targets the article '[title]'."
6. If any drops are severe (delta > 10), create a seo-tracker issue with priority "high".
```

---

## Recipe 3: Bi-weekly Content Pipeline Review
**When:** Every Monday and Thursday at 9:30 AM

**What it does:** Shows the content pipeline at a glance — what's due, what's overdue, which planned articles are missing keywords, and which article to write next.

**Cron expression:** `47 9 * * 1,4`

**Prompt:**
```
Run a content pipeline review.

Steps:
1. Query the content-strategy pipeline: campshell-content-strategy query pipeline
2. List articles with status "planned" or "briefed" sorted by scheduledDate ascending (overdue first).
3. For each article in the list, check if it has keywords assigned (campshell-content-strategy query keywords --article <id>). Flag any articles with no keywords as "needs keyword research".
4. Highlight the single highest-priority article to work on next, considering: overdue scheduled date first, then priority field (high > medium > low).
5. Report in plain language: what's overdue, what's coming up this week, which articles need keyword research, and a clear recommendation for what to work on today.
```

---

## Recipe 4: Monthly Competitor Scan
**When:** 1st of every month at 10:00 AM

**What it does:** Pulls the latest keywords each competitor ranks for via DataForSEO, cross-references against your own keywords to find gaps, and surfaces the top content opportunities.

**Cron expression:** `23 10 1 * *`

**Prompt:**
```
Run a monthly competitor analysis using the SEO Content Pipeline competitor intelligence workflow.

Steps:
1. Read all competitors from content-strategy: campshell-content-strategy query competitors
2. Read all competitors from seo-tracker: read ~/.campshell/data/seo-tracker/competitors.json
3. Combine the unique competitor domains from both lists.
4. For each competitor domain, call DataForSEO ranked-keywords to get the top keywords they rank for.
5. Read all keywords from content-strategy (campshell-content-strategy query keywords) and seo-tracker.
6. Identify gap keywords: keywords a competitor ranks for (position ≤ 20) that are not in either of our templates.
7. For the top 10 gap keywords by search volume, call DataForSEO search-volume to get accurate volume and difficulty data.
8. Report: "Competitor [domain] ranks for [N] keywords you don't target. Top opportunities:" followed by a table of gap keywords with volume, difficulty, and which competitor ranks for each.
9. Ask the user if they'd like to add any of these keywords to their tracking.
```

---

## Recipe 5: Monthly AI Visibility Check
**When:** 15th of every month at 10:00 AM

**What it does:** Checks how the brand and key topics appear in AI-generated search results (Google AI Overviews, ChatGPT, etc.) and surfaces gaps or opportunities.

**Cron expression:** `23 10 15 * *`

**Prompt:**
```
Run a monthly AI visibility check using the SEO Content Pipeline AI visibility workflow.

Steps:
1. Read the domain name from ~/.campshell/data/content-strategy/domains.json (use the default domain's name field as the brand).
2. Read the top 5 keywords by search volume from content-strategy: campshell-content-strategy query keywords
3. Call DataForSEO llm-mentions for the brand name to see how often it appears in AI platforms.
4. For each of the top 5 keywords, call DataForSEO serp-ai-summary to check if AI Overviews appear and whether our domain is cited.
5. Call DataForSEO ai-search-volume on the top 5 keywords to see AI-era trend data.
6. Summarise in plain language: brand mention rate across AI platforms, which keywords trigger AI Overviews, whether our content is cited in those overviews, and 2–3 recommendations for improving AI visibility.
```

---

## Setting up a persistent schedule with RemoteTrigger

To make any recipe run permanently (survives session restarts), use RemoteTrigger instead of CronCreate:

```
Create a remote trigger with:
- schedule: <cron expression from recipe above>
- prompt: <copy the full prompt from the recipe above>
```

Example: "Create a remote trigger that runs the weekly performance review every Monday at 9am" — then paste Recipe 1's cron and prompt.
