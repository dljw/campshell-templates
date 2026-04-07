<!-- @generated 086fc72e2634fa93 -->
---
name: campshell-brain-vault
description: Brain Vault — A personal knowledge base where every idea is a note — capture daily journals, meeting notes, book reviews, and research in one place
version: 1.0.0
---

# Campshell Brain Vault

A file-based brain vault. Each notes is a JSON file. Write a file to create a notes, edit it to update, delete it to remove. A dashboard UI reflects changes in real time.

## Dashboard UI

A real-time dashboard visualizes this brain vault. Changes appear instantly via WebSocket.

- **URL pattern:** `http://localhost:{port}/brain-vault` (default port is 4000 — check `campshell-install` or `campshell-start` tool responses for the exact URL)
- **Start the dashboard:** Run `campshell dashboard` or use the Campshell desktop app

## Data location

Data is managed through MCP tools (`campshell-create-entity`, `campshell-get-entity`, `campshell-update-entity`, `campshell-delete-entity`, `campshell-list-entities`). The data directory is resolved automatically at runtime.

Entity types:
- Notes: one file per note
- Tags: collection

## Notes fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| id | string | yes | `^[a-z0-9-]{2,36}$` |
| createdAt | string (datetime) | yes | ISO 8601 datetime |
| updatedAt | string (datetime) | no | ISO 8601 datetime |
| title | string | yes | max 300 characters |
| content | string | no | max 100000 characters |
| type | string | no | `daily`, `meeting`, `project`, `book`, `article`, `research`, `reference`, `general` |
| status | string | no | `draft`, `in-progress`, `review`, `published`, `archived` |
| tagIds | string[] (tags IDs) | no | Must be a valid ID from the `tags` directory, max 20 items |
| linkedNoteIds | string[] (notes IDs) | no | Must be a valid ID from the `notes` directory, max 50 items |
| source | string | no | max 2000 characters |
| author | string | no | max 200 characters |
| date | string (date) | no |  |
| rating | integer | no | 0–10 |
| summary | string | no | max 2000 characters |
| participants | string[] | no | max 20 items |
| actionItems | object[] | no |  |
| pinned | boolean | no |  |

No extra fields allowed — any unknown property will fail validation.

### actionItems items

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| task | string | no | max 500 characters |
| owner | string | no | max 100 characters |
| done | boolean | no |  |

## How to create a notes

Use `campshell-create-entity` with template `"brain-vault"` and entity `"notes"`. Provide at least `id`, `createdAt`, `title`. The tool validates and returns the created entity or validation errors.

## How to update a notes

Use `campshell-update-entity` with template `"brain-vault"`, entity `"notes"`, and the entity ID. Provide only the fields to change. `updatedAt` is set automatically.

## How to delete a notes

Use `campshell-delete-entity` with template `"brain-vault"`, entity `"notes"`, and the entity ID.

> **Warning:** Before deleting a notes, check for notes records that reference it via `linkedNoteIds`.

## Tags fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| id | string | yes | `^[a-z0-9-]{2,36}$` |
| createdAt | string (datetime) | yes | ISO 8601 datetime |
| updatedAt | string (datetime) | no | ISO 8601 datetime |
| name | string | yes | max 50 characters |
| color | string | no | `red`, `orange`, `yellow`, `green`, `blue`, `purple`, `gray` |

No extra fields allowed — any unknown property will fail validation.

> **Warning:** Before deleting a tags, check for notes records that reference it via `tagIds`.

## Query commands

Run queries with `npx @campshell/brain-vault query <command>`. All output is JSON.

**List notes:**
```
npx @campshell/brain-vault query list notes
```
Returns: array of Notes objects.

**Get a single notes:**
```
npx @campshell/brain-vault query get notes <id>
```
Returns: a Notes object, or `{ "error": "not_found" }` if missing.

## Checking for errors

MCP tools validate data automatically. If validation fails, the tool response contains the exact errors. Fix the issue and retry the operation.

## Building the UI

To build a dashboard UI for this template, follow the **campshell-ui-creation** skill at `skills/campshell-ui-creation/SKILL.md`.

Recommended layouts per entity:

- **Notes:** `table-detail`
- **Tags:** `editable-list`

Use a **tabbed layout** to switch between entity views since this template has multiple entities.