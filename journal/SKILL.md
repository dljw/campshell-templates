<!-- @generated 827bad41fb5cc9f6 -->
---
name: campshell-journal
description: Journal — A cozy daily journal with mood tracking, gratitude lists, and writing prompts
version: 1.0.0
---

# Campshell Journal

A file-based journal. Each entries is a JSON file. Write a file to create a entries, edit it to update, delete it to remove. A dashboard UI reflects changes in real time.

## Dashboard UI

A real-time dashboard visualizes this journal. Changes appear instantly via WebSocket.

- **URL pattern:** `http://localhost:{port}/journal` (default port is 4000 — check `campshell-install` or `campshell-start` tool responses for the exact URL)
- **Start the dashboard:** Run `campshell dashboard` or use the Campshell desktop app

## Data location

- Entries: `~/.campshell/data/journal/entries/{id}.json` (one file per entries)
- Tags: `~/.campshell/data/journal/tags.json`
- Prompts: `~/.campshell/data/journal/prompts.json`
- Validation errors: `~/.campshell/data/.campshell/validation-errors/journal/`

## Entries fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| id | string | yes | `^[a-z0-9-]{2,36}$` |
| createdAt | string (datetime) | yes | ISO 8601 datetime |
| updatedAt | string (datetime) | no | ISO 8601 datetime |
| title | string | yes | max 300 characters |
| content | string | no | max 100000 characters |
| date | string (date) | yes |  |
| mood | string | no | `amazing`, `good`, `okay`, `meh`, `rough` |
| moodEmoji | string | no | max 10 characters |
| energy | string | no | `high`, `medium`, `low` |
| tagIds | string[] (tags IDs) | no | Must be a valid ID from the `tags` directory, max 10 items |
| gratitude | string[] | no | max 10 items |
| promptUsed | string | no | max 500 characters |
| weather | string | no | `sunny`, `cloudy`, `rainy`, `snowy`, `stormy`, `windy` |
| highlight | string | no | max 500 characters |
| pinned | boolean | no |  |

No extra fields allowed — any unknown property will fail validation.

## How to create a entries

1. Generate a unique ID: 2–36 characters, lowercase letters, digits, and hyphens only.
2. Write a JSON file to `~/.campshell/data/journal/entries/{id}.json` with at least `id`, `createdAt`, `title`, `date`.
3. Check for validation errors (see **Checking for errors** below).

## How to update a entries

1. Read the existing file at `~/.campshell/data/journal/entries/{id}.json`.
2. Modify the fields you need. Set `updatedAt` to the current ISO 8601 datetime.
3. Write the full JSON back to the same path.
4. Check for validation errors.

## How to delete a entries

Delete the file at `~/.campshell/data/journal/entries/{id}.json`.

## Tags fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| id | string | yes | `^[a-z0-9-]{2,36}$` |
| createdAt | string (datetime) | yes | ISO 8601 datetime |
| updatedAt | string (datetime) | no | ISO 8601 datetime |
| name | string | yes | max 50 characters |
| emoji | string | no | max 10 characters |
| color | string | no | `red`, `orange`, `yellow`, `green`, `blue`, `purple`, `pink`, `gray` |

No extra fields allowed — any unknown property will fail validation.

> **Warning:** Before deleting a tags, check for entries records that reference it via `tagIds`.

## Prompts fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| id | string | yes | `^[a-z0-9-]{2,36}$` |
| createdAt | string (datetime) | yes | ISO 8601 datetime |
| updatedAt | string (datetime) | no | ISO 8601 datetime |
| text | string | yes | max 500 characters |
| category | string | no | `reflection`, `gratitude`, `creativity`, `growth`, `memory`, `dream`, `fun` |

No extra fields allowed — any unknown property will fail validation.

## Query commands

Run queries with `npx @campshell/journal query <command>`. All output is JSON.

**List entries:**
```
npx @campshell/journal query list entries
```
Returns: array of Entries objects.

**Get a single entries:**
```
npx @campshell/journal query get entries <id>
```
Returns: a Entries object, or `{ "error": "not_found" }` if missing.

## Checking for errors

After every write, check `~/.campshell/data/.campshell/validation-errors/journal/` for a file matching your record's filename.

**Important:** Invalid files are automatically deleted. If validation fails, your written file will no longer exist. The error record contains the rejected data and the exact errors. Read it, fix the issue, and write a new file.

## Building the UI

To build a dashboard UI for this template, follow the **campshell-ui-creation** skill at `skills/campshell-ui-creation/SKILL.md`.

Recommended layouts per entity:

- **Entries:** `card-grid`
- **Tags:** `editable-list`
- **Prompts:** `editable-list`

Use a **tabbed layout** to switch between entity views since this template has multiple entities.