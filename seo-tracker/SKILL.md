<!-- @generated 5ea663e51f3bdd51 -->
---
name: campshell-seo-tracker
description: SEO Tracker — Track keywords, pages, backlinks, competitors, and technical SEO issues
version: 1.0.0
---

# Campshell SEO Tracker

A file-based seo tracker. Each keywords is a JSON file. Write a file to create a keywords, edit it to update, delete it to remove. A dashboard UI reflects changes in real time.

## Dashboard UI

A real-time dashboard visualizes this seo tracker. Changes appear instantly via WebSocket.

- **URL pattern:** `http://localhost:{port}/seo-tracker` (default port is 4000 — check the install response for the exact URL)
- **Start the dashboard:** Run `campshell dashboard` or use the Campshell desktop app

## Data location

- Keywords: `~/.campshell/data/seo-tracker/keywords/{id}.json` (one file per keywords)
- Pages: `~/.campshell/data/seo-tracker/pages/{id}.json` (one file per pages)
- Backlinks: `~/.campshell/data/seo-tracker/backlinks/{id}.json` (one file per backlinks)
- Competitors: `~/.campshell/data/seo-tracker/competitors.json`
- Issues: `~/.campshell/data/seo-tracker/issues/{id}.json` (one file per issues)
- Validation errors: `~/.campshell/data/.campshell/validation-errors/seo-tracker/`

## Keywords fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| id | string | yes | `^[a-z0-9-]{2,36}$` |
| createdAt | string (datetime) | yes | ISO 8601 datetime |
| updatedAt | string (datetime) | no | ISO 8601 datetime |
| term | string | yes | max 200 characters |
| pageId | string (pages ID) | no | Must be a valid ID from the `pages` directory |
| position | integer | no | 0–999 |
| previousPosition | integer | no | 0–999 |
| searchVolume | integer | no | >= 0 |
| difficulty | integer | no | 0–100 |
| intent | string | no | `informational`, `navigational`, `commercial`, `transactional` |
| status | string | no | `tracking`, `paused`, `achieved` |
| notes | string | no |  |

No extra fields allowed — any unknown property will fail validation.

## How to create a keywords

1. Generate a unique ID: 2–36 characters, lowercase letters, digits, and hyphens only.
2. Write a JSON file to `~/.campshell/data/seo-tracker/keywords/{id}.json` with at least `id`, `createdAt`, `term`.
3. Check for validation errors (see **Checking for errors** below).

## How to update a keywords

1. Read the existing file at `~/.campshell/data/seo-tracker/keywords/{id}.json`.
2. Modify the fields you need. Set `updatedAt` to the current ISO 8601 datetime.
3. Write the full JSON back to the same path.
4. Check for validation errors.

## How to delete a keywords

Delete the file at `~/.campshell/data/seo-tracker/keywords/{id}.json`.

## Pages fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| id | string | yes | `^[a-z0-9-]{2,36}$` |
| createdAt | string (datetime) | yes | ISO 8601 datetime |
| updatedAt | string (datetime) | no | ISO 8601 datetime |
| title | string | yes | max 300 characters |
| pageUrl | string (URL) | yes |  |
| status | string | no | `planned`, `drafting`, `review`, `published`, `needs-refresh` |
| contentType | string | no | `blog`, `landing`, `guide`, `tool`, `other` |
| wordCount | integer | no | >= 0 |
| publishDate | string (date) | no |  |
| lastUpdated | string (date) | no |  |
| organicTraffic | integer | no | >= 0 |
| avgPosition | number | no | 0–999 |
| assignedTo | string | no |  |
| notes | string | no |  |

No extra fields allowed — any unknown property will fail validation.

## How to create a pages

1. Generate a unique ID: 2–36 characters, lowercase letters, digits, and hyphens only.
2. Write a JSON file to `~/.campshell/data/seo-tracker/pages/{id}.json` with at least `id`, `createdAt`, `title`, `pageUrl`.
3. Check for validation errors (see **Checking for errors** below).

## How to update a pages

1. Read the existing file at `~/.campshell/data/seo-tracker/pages/{id}.json`.
2. Modify the fields you need. Set `updatedAt` to the current ISO 8601 datetime.
3. Write the full JSON back to the same path.
4. Check for validation errors.

## How to delete a pages

Delete the file at `~/.campshell/data/seo-tracker/pages/{id}.json`.

> **Warning:** Before deleting a pages, check for keywords records that reference it via `pageId`.
> **Warning:** Before deleting a pages, check for backlinks records that reference it via `targetPageId`.

## Backlinks fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| id | string | yes | `^[a-z0-9-]{2,36}$` |
| createdAt | string (datetime) | yes | ISO 8601 datetime |
| updatedAt | string (datetime) | no | ISO 8601 datetime |
| sourceDomain | string | yes | max 253 characters |
| sourceUrl | string (URL) | yes |  |
| targetPageId | string (pages ID) | no | Must be a valid ID from the `pages` directory |
| anchorText | string | no | max 500 characters |
| linkType | string | no | `dofollow`, `nofollow`, `ugc`, `sponsored` |
| domainAuthority | integer | no | 0–100 |
| dateDiscovered | string (date) | no |  |
| status | string | no | `active`, `lost`, `disavowed` |

No extra fields allowed — any unknown property will fail validation.

## How to create a backlinks

1. Generate a unique ID: 2–36 characters, lowercase letters, digits, and hyphens only.
2. Write a JSON file to `~/.campshell/data/seo-tracker/backlinks/{id}.json` with at least `id`, `createdAt`, `sourceDomain`, `sourceUrl`.
3. Check for validation errors (see **Checking for errors** below).

## How to update a backlinks

1. Read the existing file at `~/.campshell/data/seo-tracker/backlinks/{id}.json`.
2. Modify the fields you need. Set `updatedAt` to the current ISO 8601 datetime.
3. Write the full JSON back to the same path.
4. Check for validation errors.

## How to delete a backlinks

Delete the file at `~/.campshell/data/seo-tracker/backlinks/{id}.json`.

## Competitors fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| id | string | yes | `^[a-z0-9-]{2,36}$` |
| createdAt | string (datetime) | yes | ISO 8601 datetime |
| updatedAt | string (datetime) | no | ISO 8601 datetime |
| domain | string | yes | max 253 characters |
| estimatedTraffic | integer | no | >= 0 |
| domainAuthority | integer | no | 0–100 |
| topKeywords | string[] | no | max 20 items |
| backlinkCount | integer | no | >= 0 |
| notes | string | no |  |

No extra fields allowed — any unknown property will fail validation.

## Issues fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| id | string | yes | `^[a-z0-9-]{2,36}$` |
| createdAt | string (datetime) | yes | ISO 8601 datetime |
| updatedAt | string (datetime) | no | ISO 8601 datetime |
| title | string | yes | max 300 characters |
| issueType | string | no | `speed`, `mobile`, `indexing`, `structure`, `security`, `other` |
| affectedPage | string (URL) | no |  |
| description | string | no | max 2000 characters |
| priority | string | no | `critical`, `high`, `medium`, `low` |
| status | string | no | `open`, `in-progress`, `resolved` |

No extra fields allowed — any unknown property will fail validation.

## How to create a issues

1. Generate a unique ID: 2–36 characters, lowercase letters, digits, and hyphens only.
2. Write a JSON file to `~/.campshell/data/seo-tracker/issues/{id}.json` with at least `id`, `createdAt`, `title`.
3. Check for validation errors (see **Checking for errors** below).

## How to update a issues

1. Read the existing file at `~/.campshell/data/seo-tracker/issues/{id}.json`.
2. Modify the fields you need. Set `updatedAt` to the current ISO 8601 datetime.
3. Write the full JSON back to the same path.
4. Check for validation errors.

## How to delete a issues

Delete the file at `~/.campshell/data/seo-tracker/issues/{id}.json`.

## Query commands

Run queries with `npx @campshell/seo-tracker query <command>`. All output is JSON.

**List keywords:**
```
npx @campshell/seo-tracker query list keywords
```
Returns: array of Keywords objects.

**Get a single keywords:**
```
npx @campshell/seo-tracker query get keywords <id>
```
Returns: a Keywords object, or `{ "error": "not_found" }` if missing.

**List pages:**
```
npx @campshell/seo-tracker query list pages
```
Returns: array of Pages objects.

**Get a single pages:**
```
npx @campshell/seo-tracker query get pages <id>
```
Returns: a Pages object, or `{ "error": "not_found" }` if missing.

**List backlinks:**
```
npx @campshell/seo-tracker query list backlinks
```
Returns: array of Backlinks objects.

**Get a single backlinks:**
```
npx @campshell/seo-tracker query get backlinks <id>
```
Returns: a Backlinks object, or `{ "error": "not_found" }` if missing.

**List issues:**
```
npx @campshell/seo-tracker query list issues
```
Returns: array of Issues objects.

**Get a single issues:**
```
npx @campshell/seo-tracker query get issues <id>
```
Returns: a Issues object, or `{ "error": "not_found" }` if missing.

## Checking for errors

After every write, check `~/.campshell/data/.campshell/validation-errors/seo-tracker/` for a file matching your record's filename.

**Important:** Invalid files are automatically deleted. If validation fails, your written file will no longer exist. The error record contains the rejected data and the exact errors. Read it, fix the issue, and write a new file.

## Building the UI

To build a dashboard UI for this template, follow the **campshell-ui-creation** skill at `skills/campshell-ui-creation/SKILL.md`.

This is a **multipage template** — see `campshell-ui-creation` SKILL.md § Multipage Templates.

Recommended layouts per view:

- **Keywords** (`/seo-tracker/keywords`): `table-detail`
- **Pages** (`/seo-tracker/pages`): `kanban`
- **Backlinks** (`/seo-tracker/backlinks`): `table-detail`
- **Competitors** (`/seo-tracker/competitors`): `editable-list`
- **Issues** (`/seo-tracker/issues`): `kanban`