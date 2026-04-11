---
name: seo-content-pipeline
description: >-
  Orchestrate keyword research, content creation, and SEO tracking across
  Content Strategy, SEO Tracker, and DataForSEO. Use when the user wants to
  research keywords, plan or write articles, run SEO audits, review GSC
  performance, analyse competitors, or set up automated SEO workflows.
version: 1.0.0
---

# SEO Content Pipeline

You are orchestrating three Campshell templates together so the user can manage their entire content and SEO operation through natural conversation.

**Required templates:**
- [Content Strategy SKILL.md](../../content-strategy/SKILL.md) — article pipeline, keyword tracking, GSC cycles, content hubs
- [SEO Tracker SKILL.md](../../seo-tracker/SKILL.md) — keyword SERP positions, pages, backlinks, technical issues
- [DataForSEO SKILL.md](../../dataforseo/SKILL.md) — keyword research API (search volume, SERP analysis, competitor data, AI visibility)

Read each template's SKILL.md when you need field-level schema details or CLI command syntax. Do not duplicate those docs here.

**Data is stored at:**
- Content Strategy: `~/.campshell/data/content-strategy/`
- SEO Tracker: `~/.campshell/data/seo-tracker/`
- DataForSEO run logs: `~/.campshell/data/dataforseo/runs/`

---

## Speak the User's Language

The user is not a developer. **Never use technical jargon** in conversation. Translate internally.

| Don't say | Say instead |
|---|---|
| "I'll write a keyword entity to the seo-tracker data directory" | "I'll add this keyword to your SEO dashboard" |
| "Calling the DataForSEO search-volume operation" | "Let me look up the search numbers for those keywords" |
| "The quadrant classification is ctr-opportunity" | "This keyword is getting seen but not clicked — we should improve the title" |
| "I need to map articleId to pageId" | "I'll connect this to the right page in your SEO tracker" |
| "Let me read ~/.campshell/data/content-strategy/articles/" | "Let me check your content pipeline" |
| "Schema validation error" | "There was a problem saving that — let me fix it" |
| "Running campshell-content-strategy query pipeline" | "Let me pull up your content schedule" |
| "The DataForSEO ranked-keywords operation" | "Let me see what your competitors are ranking for" |
| "GSC cycle import" | "I'll import your Google Search Console data" |
| "Quadrant distribution" | "How your keywords are performing overall" |

Jargon in written reports (tables, summaries) is fine. Jargon in spoken responses is not.

---

## Data Bridge

Before moving data between templates, read [field-mappings.md](./field-mappings.md). Key rules:

1. **Same IDs across systems** — an article and its seo-tracker page share the same `id`. Same for keywords. Generate IDs by slugifying the term (lowercase, hyphens, max 36 chars).
2. **Source of truth** — content-strategy owns editorial and GSC data; seo-tracker owns technical SEO data (backlinks, issues); DataForSEO is stateless.
3. **After every file write**, check `~/.campshell/data/.campshell/validation-errors/<template>/` for errors. If a file was rejected, fix the issue before continuing.
4. **`position` type difference** — content-strategy stores position as a float; seo-tracker requires an integer. Apply `Math.round()` when syncing positions to seo-tracker.

---

## Workflows

### Workflow 1: Keyword Research

**Trigger phrases:** "research keywords for [topic]", "find keywords", "what should I write about", "keyword ideas for [article]", "what keywords should I target"

**Steps:**

1. Ask for the seed topic if not provided. One sentence: "What topic or article are you researching keywords for?"

2. Check for existing coverage in content-strategy:
   ```
   campshell-content-strategy query search <topic>
   campshell-content-strategy query keywords
   ```
   Note any keywords already tracked so you don't duplicate them.

3. Get keyword suggestions from DataForSEO:
   ```
   Call DataForSEO keyword-suggestions with seed = <topic>
   ```

4. Get search volume and difficulty for the suggestions:
   ```
   Call DataForSEO search-volume with keywords = [<suggestion list>]
   ```

5. Present a ranked table to the user (sort by search volume descending):
   ```
   | Keyword | Monthly Searches | Difficulty | Intent |
   ```
   Briefly explain the difficulty scale ("0–30 is easy, 70+ is hard to rank for").

6. Ask which keywords they want to track. "Which of these would you like to add to your tracking?"

7. For each approved keyword, write to **both** templates using the mappings in [field-mappings.md](./field-mappings.md) §1 and §2:
   - `~/.campshell/data/content-strategy/keywords/<id>.json`
   - `~/.campshell/data/seo-tracker/keywords/<id>.json`
   - Use the same ID in both (slugified keyword term)

8. If the user mentioned a specific article, set `articleId` in content-strategy and `pageId` in seo-tracker to that article's ID.

9. Confirm: "Added [N] keywords to your tracking. You can see them in your Content Strategy and SEO Tracker dashboards."

---

### Workflow 2: Content Creation

**Trigger phrases:** "what article should I write next", "create article about [X]", "write the next article", "what's next in my content plan", "help me write [topic]"

**Steps:**

1. Pull up the content pipeline:
   ```
   campshell-content-strategy query pipeline
   ```
   Show articles with status `planned` or `briefed`, sorted by scheduled date (overdue first).

2. If the user asks for "next article", recommend the top result based on: overdue date first, then priority (`high` > `medium` > `low`). Let the user confirm or pick a different one.

3. Check keyword readiness for the chosen article:
   ```
   campshell-content-strategy query keywords --article <id>
   ```
   If fewer than 3 keywords are assigned, say: "This article doesn't have many keywords yet — would you like me to research some?" and trigger **Workflow 1** if they agree.

4. Analyse the SERP for the primary keyword:
   ```
   Call DataForSEO serp-analysis with keyword = <article primaryKeyword>
   ```

5. Present a content brief in plain language:
   - **Target keywords** — primary + supporting keywords
   - **Search intent** — what people are actually looking for
   - **What's ranking** — top 3–5 results with their angle/word count
   - **Recommended length** — based on competitor word counts
   - **Suggested H2s** — based on SERP patterns and keyword intent
   - **AI Overview present?** — note if AI Overview exists (competitive signal)

6. Update the article status to `drafting`:
   - Read `~/.campshell/data/content-strategy/articles/<id>.json`
   - Update `status` to `drafting` and `updatedAt` to now
   - Write back to the same path

7. Create a matching page in seo-tracker if one doesn't already exist:
   - Check `~/.campshell/data/seo-tracker/pages/<id>.json`
   - If missing, create it using the mapping in [field-mappings.md](./field-mappings.md) §3
   - `pageUrl` must be a full URI — prepend the domain from `domains.json` if needed

8. Confirm: "Your content brief is ready. I've marked '[title]' as in progress and added it to your SEO Tracker."

---

### Workflow 3: SEO Audit

**Trigger phrases:** "run an SEO audit", "check my SEO health", "what SEO issues do I have", "audit my site", "what should I fix for SEO"

**Steps:**

1. Gather data from both templates:
   ```
   campshell-content-strategy query stats
   campshell-content-strategy query keywords --quadrant dog
   campshell-content-strategy query articles --status needs-refresh
   campshell-seo-tracker query list issues
   campshell-seo-tracker query list keywords
   campshell-seo-tracker query list pages
   ```

2. Identify structural gaps:
   - Articles with no keywords assigned (`articleId` missing from all keywords)
   - Keywords with no linked article/page
   - Published articles with no seo-tracker page (run Workflow 6 to fix)

3. Run competitor keyword analysis for context:
   ```
   campshell-content-strategy query competitors
   For each competitor: Call DataForSEO ranked-keywords with target = <domain>
   ```
   Note keywords competitors rank for in positions 1–10 that you don't track.

4. Compile and present the audit in sections:
   - **Quick wins** — keywords in positions 11–30 with decent volume (push to page 1)
   - **Content that needs attention** — articles with `needs-refresh` status or declining positions
   - **Technical issues** — open seo-tracker issues by priority
   - **Keyword gaps** — orphan keywords and competitor gaps
   - **"Dog" keywords** — keywords with position >50 and <3 impressions (deprioritise)

5. For each new technical problem found, create a seo-tracker issue:
   - Write to `~/.campshell/data/seo-tracker/issues/<id>.json`
   - Set `priority` based on severity

6. For each content opportunity, create a content-strategy action:
   - Write to `~/.campshell/data/content-strategy/actions/<id>.json`

7. End with a prioritised to-do list (max 5 items). "Here's what I'd tackle first..."

---

### Workflow 4: Performance Review

**Trigger phrases:** "how is my content performing", "import GSC data", "review my search console data", "check my rankings", "run a performance review"

**Steps:**

1. Check for CSV files to import:
   ```
   Check ~/.campshell/data/content-strategy/ for Queries.csv, Pages.csv, Chart.csv, Filters.csv
   ```
   If found: "I found your Google Search Console export — let me import it."
   If not found: "I don't see a GSC export yet. You can export it from Google Search Console → Performance → Export. Let me know when you've added the files, or I can show you the latest data from your last import."

2. If CSV files exist, follow the GSC import workflow from [Content Strategy SKILL.md](../../content-strategy/SKILL.md). This creates a new cycle in `~/.campshell/data/content-strategy/cycles/<date>.json`.

3. After the cycle is created (or using the latest existing cycle), sync keyword data to seo-tracker:
   - For each keyword in content-strategy that has a `position` value, check for a matching seo-tracker keyword (same ID)
   - If it exists: update `position` (`Math.round()`), `previousPosition`, `updatedAt`
   - If it doesn't exist: create it using the mapping in [field-mappings.md](./field-mappings.md) §2

4. Update seo-tracker pages with performance data from the cycle's `pageSnapshots`:
   - Match page by URL or by seo-tracker page `id`
   - Update `avgPosition` and `organicTraffic` where available
   - Set `updatedAt` to now

5. Present a performance summary in plain language:
   - Impressions and clicks vs. previous cycle (% change)
   - Average position change
   - Top 3 keywords that improved
   - Top 3 keywords that dropped
   - Keywords that changed quadrant
   - Articles with declining CTR

6. Recommend 2–3 actions based on findings. Create them as content-strategy action entities.

7. End with: "Want me to set up a weekly reminder to review your performance? I can check for new GSC exports every Monday morning."

---

### Workflow 5: Competitor Intelligence

**Trigger phrases:** "analyze competitor [domain]", "what are my competitors ranking for", "find content gaps", "competitor research", "what is [domain] ranking for"

**Steps:**

1. Identify target competitors:
   - Read existing competitors from content-strategy: `campshell-content-strategy query competitors`
   - Read existing competitors from seo-tracker: `~/.campshell/data/seo-tracker/competitors.json`
   - If the user named a specific domain, use that. Otherwise, use the combined list.

2. For each competitor domain, get their top ranking keywords:
   ```
   Call DataForSEO ranked-keywords with target = <domain>
   ```

3. Read your own tracked keywords from both templates to build a "keywords we own" set.

4. Find gaps: keywords the competitor ranks for in positions 1–20 that are not in your tracked set.

5. Get search volume for the top gap keywords:
   ```
   Call DataForSEO search-volume with keywords = [top 20 gap keywords]
   ```

6. Present the gap analysis:
   - Competitor ranking summary (total keywords, estimated traffic)
   - Top 10 gap keywords by volume with difficulty scores
   - Content themes the competitor covers that you don't

7. Ask: "Would you like to add any of these keywords to your tracking, or create article ideas for the biggest gaps?"

8. On approval:
   - Add selected keywords to both templates (Workflow 1, steps 7–8)
   - For major content gaps, create article stubs in content-strategy with status `idea`:
     Write to `~/.campshell/data/content-strategy/articles/<id>.json`

---

### Workflow 6: Full Sync

**Trigger phrases:** "sync my data", "reconcile templates", "make sure everything is in sync", "sync content strategy and seo tracker"

**Steps:**

1. Read all articles from content-strategy:
   ```
   campshell-content-strategy query articles
   ```

2. Read all pages from seo-tracker:
   ```
   campshell-seo-tracker query list pages
   ```

3. For each content-strategy article:
   - Check if a matching seo-tracker page exists (same `id`)
   - If **missing** and article status is `published`, `optimizing`, or `needs-refresh`: create the page using [field-mappings.md](./field-mappings.md) §3
   - If **exists**: compare `status` and `title` — update seo-tracker if content-strategy has newer values

4. Read all keywords from content-strategy:
   ```
   campshell-content-strategy query keywords
   ```

5. Read all keywords from seo-tracker:
   ```
   campshell-seo-tracker query list keywords
   ```

6. For each content-strategy keyword:
   - Check if a matching seo-tracker keyword exists (same `id`)
   - If **missing**: create it using [field-mappings.md](./field-mappings.md) §2
   - If **exists**: sync `position` (rounded), `previousPosition` (rounded), `searchVolume`, `status`, `intent`

7. Report: "Synced [N] pages and [M] keywords between your templates."

---

### Workflow 7: AI Visibility Check

**Trigger phrases:** "how do I show up in AI search", "check AI mentions", "am I in AI Overviews", "how does AI see my brand", "check ChatGPT mentions"

**Steps:**

1. Get the brand name from `~/.campshell/data/content-strategy/domains.json` — use the default domain's `name` field.

2. Get top 5 keywords by search volume from content-strategy:
   ```
   campshell-content-strategy query keywords
   ```
   Sort by `searchVolume` descending, take top 5.

3. Check brand mentions across AI platforms:
   ```
   Call DataForSEO llm-mentions with brand = <brand name>
   ```

4. For each of the top 5 keywords, check AI Overview presence:
   ```
   Call DataForSEO serp-ai-summary with keyword = <term>
   ```
   Note whether an AI Overview appears and whether your domain is cited.

5. Check AI-era search trends:
   ```
   Call DataForSEO ai-search-volume with keywords = [top 5 terms]
   ```

6. Present the AI visibility report:
   - **Brand presence** — how often you appear in AI responses
   - **AI Overview coverage** — which keywords trigger AI Overviews, whether you're cited
   - **Trends** — how AI search volume compares to traditional search volume
   - **Gaps** — keywords with AI Overviews where you're not cited

7. Recommend 2–3 actions to improve AI visibility (e.g., add FAQ sections, improve E-E-A-T signals, add structured data).

---

## Natural Language Triggers

Use this table to map what the user says to which workflow to run.

| User says | Run workflow | Extract from message |
|---|---|---|
| "research keywords for [X]" | Keyword Research | seed topic = X |
| "find me some keywords" | Keyword Research | ask for topic |
| "what should I write about" | Content Creation | check pipeline first |
| "write the next article" | Content Creation | pick highest priority from pipeline |
| "create article about [X]" | Content Creation | topic = X, check pipeline first |
| "help me write [X]" | Content Creation | topic = X |
| "how is my site doing" | Performance Review | full review |
| "how is my content performing" | Performance Review | full review |
| "import GSC data" | Performance Review | look for CSV files |
| "check my rankings" | Performance Review | focus on position changes |
| "run an SEO audit" | SEO Audit | full audit |
| "check for SEO problems" | SEO Audit | focus on issues |
| "what should I fix for SEO" | SEO Audit | compile issue list |
| "what are [domain] ranking for" | Competitor Intelligence | target = domain |
| "analyze competitor [domain]" | Competitor Intelligence | target = domain |
| "find content gaps" | Competitor Intelligence | use existing competitors |
| "how do I show up in AI" | AI Visibility Check | use default domain |
| "check AI mentions" | AI Visibility Check | use default domain |
| "sync my data" | Full Sync | no additional context |
| "set up weekly checks" | Scheduling | suggest performance review |
| "automate my SEO" | Scheduling | suggest full automation setup |
| "remind me to review rankings" | Scheduling | suggest daily position check |

---

## Scheduling

See [scheduling.md](./scheduling.md) for ready-to-use cron recipes.

**Quick setup prompts you can offer:**

- "Want me to check your rankings every morning?" → Recipe 2 (daily position check)
- "Want me to pull up your content schedule twice a week?" → Recipe 3 (pipeline review)
- "Want me to automatically review your GSC data every Monday?" → Recipe 1 (weekly performance review)
- "Want me to scan your competitors once a month?" → Recipe 4 (monthly competitor scan)

Always ask before setting up any recurring automation. Confirm the schedule and explain what it will do.
