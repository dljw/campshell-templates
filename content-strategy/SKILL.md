# Content Strategy Template

A data-driven content strategy tracker built on Campshell. Plan content, measure GSC performance, optimize with quadrant analysis, and track action outcomes cycle-over-cycle.

## Data Model

All data is stored as JSON files in `~/.campshell/data/content-strategy/`.

### Articles (`articles/{id}.json`)

Tracks content from idea through publication to ongoing optimization.

```json
{
  "id": "best-planner-apps",
  "createdAt": "2026-03-01T00:00:00.000Z",
  "title": "12 Best Planner Apps in 2026",
  "slug": "best-planner-apps",
  "pageUrl": "/blog/best-planner-apps/",
  "status": "published",
  "contentType": "cluster",
  "hubId": "planning-cadence",
  "primaryKeyword": "best planner apps",
  "wordCount": 3200,
  "publishDate": "2026-03-01",
  "scheduledDate": "2026-03-01",
  "phase": "phase-1",
  "priority": "high",
  "notes": "Top traffic driver"
}
```

**Status values:** `idea`, `planned`, `briefed`, `drafting`, `review`, `published`, `optimizing`, `needs-refresh`
**Content types:** `pillar`, `cluster`, `standalone`, `comparison`, `update`
**Phases:** `phase-1`, `phase-2`, `phase-3`
**Priorities:** `high`, `medium`, `low`

### Keywords (`keywords/{id}.json`)

Combines keyword research data with live GSC performance metrics.

```json
{
  "id": "adhd-planner-kw",
  "createdAt": "2026-03-19T00:00:00.000Z",
  "term": "planner apps for adhd",
  "articleId": "planner-apps-adhd",
  "searchVolume": 8100,
  "keywordDifficulty": 0,
  "cpc": 1.80,
  "intent": "commercial",
  "targetSection": "Title & H1",
  "occurrences": 4,
  "impressions": 45,
  "clicks": 0,
  "ctr": 0,
  "position": 17.73,
  "previousPosition": 25.0,
  "quadrant": "ctr-opportunity",
  "status": "tracking"
}
```

**Intent values:** `informational`, `navigational`, `commercial`, `transactional`
**Quadrant values:** `star`, `quick-win`, `ctr-opportunity`, `long-term-target`, `early-signal`, `dog`
**Status values:** `tracking`, `paused`, `achieved`

#### Quadrant Classification

Assign quadrants based on the site's current scale:

| Quadrant | Criteria | Action |
|----------|----------|--------|
| **star** | Position ≤10, high impressions, good CTR | Protect & strengthen |
| **quick-win** | Position 11-30, ≥5 impressions | Optimize content to push into top 10 |
| **ctr-opportunity** | Position ≤20, ≥3 impressions, low CTR | Rewrite title/meta description |
| **long-term-target** | Position >30, ≥10 impressions | Build content & links |
| **early-signal** | Position ≤20, 1-2 impressions | Monitor — too early to optimize |
| **dog** | Position >50, <3 impressions | Deprioritize |

### Content Hubs (`hubs.json`)

Pillar/cluster content architecture. Collection file.

```json
{
  "hubs": [
    {
      "id": "planning-cadence",
      "createdAt": "2026-03-19T00:00:00.000Z",
      "name": "Planning Cadence",
      "description": "Daily, weekly, and monthly planning guides",
      "pillarArticleId": "daily-planner-guide",
      "color": "blue",
      "status": "active"
    }
  ]
}
```

**Colors:** `red`, `orange`, `yellow`, `green`, `blue`, `purple`, `pink`, `gray`
**Status values:** `planning`, `active`, `complete`

### GSC Cycles (`cycles/{id}.json`)

Periodic Google Search Console data snapshots. ID should be the analysis date.

```json
{
  "id": "2026-03-28",
  "createdAt": "2026-03-28T12:00:00.000Z",
  "cycleDate": "2026-03-28",
  "periodStart": "2026-02-26",
  "periodEnd": "2026-03-25",
  "sitewide": {
    "impressions": 858,
    "clicks": 8,
    "ctr": 0.93,
    "avgPosition": 35.2
  },
  "dailyTrend": {
    "firstHalfAvg": 1.2,
    "secondHalfAvg": 64.6,
    "trajectory": "growing",
    "last7dAvg": 64.6
  },
  "quadrantCounts": {
    "stars": 0,
    "quickWins": 0,
    "ctrOpportunities": 2,
    "longTermTargets": 5,
    "earlySignals": 4,
    "dogs": 48
  },
  "pageSnapshots": [
    { "pageUrl": "/blog/best-planner-apps/", "impressions": 624, "clicks": 1, "ctr": 0.16, "position": 36.29, "indexed": true }
  ],
  "querySnapshots": [
    { "query": "best planner apps", "impressions": 30, "clicks": 0, "position": 21.5, "pageUrl": "/blog/best-planner-apps/" }
  ],
  "notIndexedPages": ["/blog/monthly-planner-guide/"],
  "cannibalizationWarnings": 2,
  "notes": "First cycle. Site in early growth phase."
}
```

**Trajectory values:** `growing`, `stable`, `declining`

### Actions (`actions/{id}.json`)

Optimization tasks with before/after tracking.

```json
{
  "id": "keyword-addition-adhd",
  "createdAt": "2026-03-28T12:00:00.000Z",
  "cycleId": "2026-03-28",
  "type": "keyword-addition",
  "status": "done",
  "priority": "high",
  "description": "Added 8 zero-KD ADHD keywords to planner-apps-adhd article",
  "articleIds": ["planner-apps-adhd"],
  "expectedOutcome": {
    "metric": "impressions",
    "direction": "improve",
    "baselineValue": 45,
    "watchQueries": ["adhd planner app", "adhd daily planner"]
  },
  "actualOutcome": null
}
```

**Action types:** `keyword-addition`, `meta-rewrite`, `content-expansion`, `internal-linking`, `cannibalization-fix`, `technical`, `new-content`, `other`
**Status values:** `planned`, `in-progress`, `done`, `deferred`, `cancelled`
**Outcome metrics:** `position`, `ctr`, `impressions`, `clicks`, `new-query`, `consolidation`

### Competitors (`competitors.json`)

Reference data on competing sites. Collection file.

```json
{
  "competitors": [
    {
      "id": "todoist",
      "createdAt": "2026-03-19T00:00:00.000Z",
      "domain": "todoist.com",
      "estimatedTraffic": 478000,
      "topPages": [
        { "url": "/productivity-methods/pomodoro-technique", "traffic": 131000 }
      ],
      "contentThemes": ["productivity methods", "task management"],
      "notes": "Dominates pomodoro keyword"
    }
  ]
}
```

## Relationships

- `keywords.articleId` → articles (each keyword targets one article)
- `articles.hubId` → hubs (each article belongs to one hub)
- `actions.cycleId` → cycles (each action triggered by a cycle)
- `actions.articleIds` → articles (each action affects one or more articles)
- `hubs.pillarArticleId` → articles (each hub has one pillar article)

## CLI Commands

### Lifecycle

```bash
campshell-content-strategy start    # Install and start the template
campshell-content-strategy stop     # Stop the template
campshell-content-strategy reset    # Reset to default data
```

### Queries

```bash
# Articles
campshell-content-strategy query articles [--status <s>] [--hub <id>] [--phase <p>] [--priority <p>] [--type <t>]
campshell-content-strategy query article <id>

# Keywords
campshell-content-strategy query keywords [--article <id>] [--quadrant <q>] [--intent <i>] [--status <s>]
campshell-content-strategy query keyword <id>

# Cycles
campshell-content-strategy query cycles
campshell-content-strategy query cycle <id>

# Actions
campshell-content-strategy query actions [--status <s>] [--type <t>] [--priority <p>] [--cycle <id>]
campshell-content-strategy query action <id>

# Other
campshell-content-strategy query hubs
campshell-content-strategy query competitors
campshell-content-strategy query stats        # Overview metrics
campshell-content-strategy query pipeline     # Articles sorted by scheduled date
campshell-content-strategy query search <term> # Search articles and keywords
```

## Workflow

### Initial Setup

1. Start the template: `campshell-content-strategy start`
2. Create articles in `articles/` for your content plan
3. Assign articles to hubs by setting `hubId`
4. Create keyword files from research, linking via `articleId`
5. Set `scheduledDate` values for the content calendar

### GSC Analysis Cycle (every 2-4 weeks)

**Option 1: Dashboard Import (recommended)**
1. Export GSC data as CSV from Google Search Console → Performance
2. Click "Import GSC Cycle" button on the Overview tab
3. Drop/select Queries.csv + Pages.csv (required), Chart.csv + Filters.csv (optional)
4. Preview the parsed data, confirm import
5. System auto-creates cycle, updates keywords, classifies quadrants

**Option 2: AI-Driven Import**
Follow the steps below in "GSC Data Import (AI Workflow)"

### GSC Data Import (AI Workflow)

When the user wants to import GSC data via AI agent:

#### Step 1: Read the CSV files

The user will provide GSC CSV export files. The standard GSC export format is:

- `Queries.csv`: `"Top queries,Clicks,Impressions,CTR,Position"` — e.g. `"best planner app,0,26,0%,78.62"`
- `Pages.csv`: `"Top pages,Clicks,Impressions,CTR,Position"` — e.g. `"https://example.com/blog/post/,1,624,0.16%,36.29"`
- `Chart.csv`: `"Date,Clicks,Impressions,CTR,Position"` — e.g. `"2026-02-27,0,1,0%,6"` (CTR/Position may be empty when Impressions=0)
- `Filters.csv`: `"Filter,Value"` — e.g. `"Search type,Web"` and `"Date,Last 28 days"`

Users can place CSV files in `~/.campshell/data/content-strategy/imports/` for the AI agent to find.

#### Step 2: Create a new cycle

Use `campshell-create-entity` with template `"content-strategy"`, entity `"cycles"`:

```json
{
  "cycleDate": "2026-03-28",
  "periodStart": "2026-02-26",
  "periodEnd": "2026-03-25",
  "sitewide": {
    "impressions": 858,
    "clicks": 8,
    "ctr": 0.93,
    "avgPosition": 35.2
  },
  "pageSnapshots": [
    { "pageUrl": "/blog/best-planner-apps/", "impressions": 624, "clicks": 1, "ctr": 0.16, "position": 36.29 }
  ],
  "querySnapshots": [
    { "query": "best planner app", "impressions": 26, "clicks": 0, "position": 78.62 }
  ],
  "dailyTrend": {
    "firstHalfAvg": 1.2,
    "secondHalfAvg": 64.6,
    "trajectory": "growing",
    "last7dAvg": 64.6
  },
  "quadrantCounts": {
    "stars": 0, "quickWins": 0, "ctrOpportunities": 2,
    "longTermTargets": 5, "earlySignals": 4, "dogs": 48
  }
}
```

**Computing sitewide metrics:**
- `impressions` = sum of all Queries.csv Impressions
- `clicks` = sum of all Queries.csv Clicks
- `ctr` = (clicks / impressions) * 100
- `avgPosition` = weighted average (sum of position * impressions / total impressions)

**Computing dailyTrend from Chart.csv:**
- Split daily impressions into first/second halves
- `firstHalfAvg` / `secondHalfAvg` = average impressions per half
- `trajectory` = "growing" if secondHalf > firstHalf * 1.2, "declining" if < 0.8, else "stable"
- `last7dAvg` = average of last 7 days

#### Step 3: Update existing keywords

For each query in Queries.csv:
1. Search existing keywords: `campshell-list-entities` with search by term
2. If found: `campshell-update-entity` to set `previousPosition` (from old position), then update `position`, `impressions`, `clicks`, `ctr`, `quadrant`
3. If not found: `campshell-create-entity` with term + GSC metrics + quadrant, status "tracking"

**Keyword ID convention:** Slugify the query term — e.g. "best planner app" → `"best-planner-app"`

**CTR parsing:** Strip the "%" suffix and parse as float — e.g. "14.29%" → 14.29

#### Step 4: Classify quadrants

Use these default thresholds (adjust for site scale):

| Quadrant | Criteria |
|----------|----------|
| **star** | position ≤ 10 AND impressions ≥ 50 AND ctr > 2% |
| **quick-win** | position 11-30 AND impressions ≥ 5 |
| **ctr-opportunity** | position ≤ 20 AND impressions ≥ 3 AND ctr ≤ 2% |
| **early-signal** | position ≤ 20 AND impressions ≤ 2 |
| **long-term-target** | position > 30 AND impressions ≥ 10 |
| **dog** | everything else |

#### Step 5: Suggest actions

After import, analyze the data and create action entities:
- **CTR opportunities** → suggest meta title/description rewrites
- **Quick wins** → suggest content optimization to push into top 10
- **New high-volume queries** not yet linked to articles → suggest new content
- **Position drops** (previousPosition < position) → investigate and fix

### Content Creation

1. Check pipeline (`query pipeline`) for next article to write
2. Move article through statuses: `idea` → `planned` → `briefed` → `drafting` → `review` → `published`
3. After publishing, set `publishDate` and add keywords
4. Review hub coverage for gaps

## Dashboard

The dashboard (http://localhost:4000/content-strategy) has 7 tabs:

- **Overview** — Metric cards (impressions, clicks, position, pipeline), quadrant donut, recent actions, daily trend
- **Pipeline** — Content calendar with list and calendar views, grouped by phase
- **Keywords** — Keyword quadrant scatter chart + filterable data table
- **Articles** — Expandable article list with per-article keywords and actions
- **Trends** — Charts: impressions/clicks over cycles, position distribution, CTR by position, quadrant trends
- **Actions** — Filterable action list with expected/actual outcome tracking
- **Hubs** — Hub cards with pillar/cluster articles, keyword coverage, and progress bars
