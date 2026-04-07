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

Data is managed through MCP tools (`campshell-create-entity`, `campshell-get-entity`, `campshell-update-entity`, `campshell-delete-entity`, `campshell-list-entities`). The data directory is resolved automatically at runtime.

Entity types:
- Entries: one file per entry
- Tags: collection
- Prompts: collection

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

Use `campshell-create-entity` with template `"journal"` and entity `"entries"`. Provide at least `id`, `createdAt`, `title`, `date`. The tool validates and returns the created entity or validation errors.

## How to update a entries

Use `campshell-update-entity` with template `"journal"`, entity `"entries"`, and the entity ID. Provide only the fields to change. `updatedAt` is set automatically.

## How to delete a entries

Use `campshell-delete-entity` with template `"journal"`, entity `"entries"`, and the entity ID.

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

MCP tools validate data automatically. If validation fails, the tool response contains the exact errors. Fix the issue and retry the operation.

## Building the UI

To build a dashboard UI for this template, follow the **campshell-ui-creation** skill at `skills/campshell-ui-creation/SKILL.md`.

Recommended layouts per entity:

- **Entries:** `card-grid`
- **Tags:** `editable-list`
- **Prompts:** `editable-list`

Use a **tabbed layout** to switch between entity views since this template has multiple entities.