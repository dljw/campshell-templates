# Field Mappings — SEO Content Pipeline

This document defines how data translates between the three templates. Read this whenever you need to move data from one system to another.

---

## Core Rule: Same IDs Across Systems

An article in **content-strategy** and its matching page in **seo-tracker** must share the same `id`. Same for keywords. Both systems use the pattern `^[a-z0-9-]{2,36}$`.

**How to generate an ID from a keyword term:**
1. Lowercase the term
2. Replace spaces and special characters with hyphens
3. Remove consecutive hyphens
4. Truncate to 36 characters

Example: `"Best Planner Apps"` → `best-planner-apps`

---

## Source of Truth Rules

| Data category | Owner | Reason |
|---|---|---|
| Article pipeline status, hub, phase, priority | **content-strategy** | This is the editorial system |
| GSC metrics (impressions, clicks, CTR, position) | **content-strategy** | GSC cycles live there |
| Quadrant classification | **content-strategy** | Computed from GSC data |
| Backlinks | **seo-tracker** | Backlink tracking is its purpose |
| Technical issues | **seo-tracker** | Issue tracking is its purpose |
| Keyword difficulty scores | **seo-tracker** | The `difficulty` field is canonical here |
| Raw API data | **DataForSEO** | Stateless — run history is audit log only |

When a conflict exists (e.g., different difficulty scores), trust the owner.

---

## 1. DataForSEO search-volume → content-strategy keyword

DataForSEO's `search-volume` operation returns results per keyword. Map each result to a `~/.campshell/data/content-strategy/keywords/{id}.json` file.

| DataForSEO output field | content-strategy field | Type | Transform |
|---|---|---|---|
| `keyword` | `term` | string | Direct copy |
| slugified `keyword` | `id` | string | Slugify (see rule above) |
| `searchVolume` | `searchVolume` | integer | Direct copy |
| `cpc` | `cpc` | number | Direct copy |
| `competition` | `keywordDifficulty` | integer | `Math.round(competition * 100)` — competition is 0–1 float, difficulty is 0–100 integer |
| *(not available)* | `intent` | enum | Infer from keyword text: questions/how-to → `informational`; brand/navigate → `navigational`; best/compare/vs → `commercial`; buy/price/order → `transactional` |
| *(not available)* | `quadrant` | enum | **Do not set** — quadrant is only valid after GSC data exists |
| *(not available)* | `articleId` | string | Set only if user specifies which article this keyword targets |
| *(not available)* | `status` | enum | Default to `tracking` |
| *(now)* | `createdAt` | date-time | ISO 8601 timestamp at time of write |

**Required fields to write:** `id`, `createdAt`, `term`

---

## 2. DataForSEO search-volume → seo-tracker keyword

Same DataForSEO output, different destination: `~/.campshell/data/seo-tracker/keywords/{id}.json`.

| DataForSEO output field | seo-tracker field | Type | Transform |
|---|---|---|---|
| `keyword` | `term` | string | Direct copy |
| slugified `keyword` | `id` | string | Same ID as content-strategy (critical) |
| `searchVolume` | `searchVolume` | integer | Direct copy |
| `competition` | `difficulty` | integer | `Math.round(competition * 100)` |
| *(not available)* | `intent` | enum | Same inference as above |
| *(not available)* | `pageId` | string | Set only if user specifies a target page |
| *(not available)* | `status` | enum | Default to `tracking` |
| *(now)* | `createdAt` | date-time | ISO 8601 timestamp at time of write |

**Note:** seo-tracker does NOT have `cpc`, `quadrant`, `impressions`, `clicks`, `ctr`, `targetSection`, `occurrences`, or `domainId`. Do not write these fields.

**Required fields to write:** `id`, `createdAt`, `term`

---

## 3. content-strategy article → seo-tracker page

When a content-strategy article reaches `published` status (or earlier, by user request), create or update a matching page in seo-tracker at `~/.campshell/data/seo-tracker/pages/{id}.json`.

| content-strategy field | seo-tracker field | Transform |
|---|---|---|
| `id` | `id` | Direct copy (same ID, critical) |
| `title` | `title` | Direct copy |
| `pageUrl` | `pageUrl` | Must be a full URI (e.g., `https://example.com/blog/best-planner-apps/`). If content-strategy `pageUrl` is a path (e.g., `/blog/best-planner-apps/`), prepend the domain from `~/.campshell/data/content-strategy/domains.json` (the default domain's `domain` field) |
| `status` | `status` | See status mapping below |
| `contentType` | `contentType` | See contentType mapping below |
| `wordCount` | `wordCount` | Direct copy |
| `publishDate` | `publishDate` | Direct copy (YYYY-MM-DD format, same in both) |
| `createdAt` | `createdAt` | Direct copy |
| `updatedAt` | `updatedAt` | Direct copy, or set to now if updating |

**Status mapping:**

| content-strategy status | seo-tracker status |
|---|---|
| `idea` | `planned` |
| `planned` | `planned` |
| `briefed` | `planned` |
| `drafting` | `drafting` |
| `review` | `review` |
| `published` | `published` |
| `optimizing` | `published` |
| `needs-refresh` | `needs-refresh` |

**contentType mapping:**

| content-strategy contentType | seo-tracker contentType |
|---|---|
| `pillar` | `guide` |
| `cluster` | `blog` |
| `standalone` | `blog` |
| `comparison` | `blog` |
| `update` | `other` |

**Fields that exist only in seo-tracker** (not in content-strategy — leave unset or fill from context):
- `lastUpdated` — set to today when creating
- `organicTraffic` — populated from GSC cycle data during Performance Review workflow
- `avgPosition` — populated from GSC cycle data during Performance Review workflow
- `assignedTo` — set from user context if known
- `notes` — optional, free-form

**Required fields to write:** `id`, `createdAt`, `title`, `pageUrl`

---

## 4. Keyword sync between templates

When syncing keywords that exist in both systems, use these field correspondences.

| content-strategy field | seo-tracker field | Notes |
|---|---|---|
| `id` | `id` | Must match — this is the link |
| `term` | `term` | Must match |
| `searchVolume` | `searchVolume` | Sync latest value |
| `keywordDifficulty` | `difficulty` | **Different field names.** content-strategy is source of truth when DataForSEO was used to populate; seo-tracker is source of truth for manually entered values |
| `intent` | `intent` | Same enum values — sync latest |
| `status` | `status` | Same enum values — content-strategy is source of truth |
| `position` (float) | `position` (integer) | **Type difference.** content-strategy stores GSC float (e.g., `21.5`); seo-tracker requires integer. Apply `Math.round()` when writing to seo-tracker |
| `previousPosition` (float) | `previousPosition` (integer) | Same rounding rule |
| `articleId` | `pageId` | **Different field names.** The referenced entity (article/page) should share the same ID |

**Fields that exist only in content-strategy** (do not write to seo-tracker):
`cpc`, `quadrant`, `impressions`, `clicks`, `ctr`, `targetSection`, `occurrences`, `domainId`

**Fields that exist only in seo-tracker** (do not write to content-strategy):
`notes`

---

## 5. DataForSEO operations quick reference

| Operation | Input | Key output fields | Used in workflow |
|---|---|---|---|
| `search-volume` | `keywords: string[]` | `keyword`, `searchVolume`, `cpc`, `competition` | Keyword Research, Competitor Intelligence |
| `keyword-suggestions` | `seed: string`, optional `limit` | Array of keyword strings | Keyword Research |
| `serp-analysis` | `keyword: string` | Top results with title, URL, description, domain | Content Creation (brief) |
| `ranked-keywords` | `target: string` (domain or URL) | Keywords domain ranks for, with position/volume | Competitor Intelligence, SEO Audit |
| `serp-ai-summary` | `keyword: string` | AI Overview presence, featured snippets | AI Visibility Check |
| `llm-mentions` | `brand: string` or `keyword: string` | Mention counts across AI platforms | AI Visibility Check |
| `ai-search-volume` | `keywords: string[]` | AI-era search volume estimates | AI Visibility Check |
