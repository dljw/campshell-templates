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

- Notes: `~/.campshell/data/brain-vault/notes/{id}.json` (one file per notes)
- Tags: `~/.campshell/data/brain-vault/tags.json`
- Validation errors: `~/.campshell/data/.campshell/validation-errors/brain-vault/`

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

1. Generate a unique ID: 2–36 characters, lowercase letters, digits, and hyphens only.
2. Write a JSON file to `~/.campshell/data/brain-vault/notes/{id}.json` with at least `id`, `createdAt`, `title`.
3. Check for validation errors (see **Checking for errors** below).

## How to update a notes

1. Read the existing file at `~/.campshell/data/brain-vault/notes/{id}.json`.
2. Modify the fields you need. Set `updatedAt` to the current ISO 8601 datetime.
3. Write the full JSON back to the same path.
4. Check for validation errors.

## How to delete a notes

Delete the file at `~/.campshell/data/brain-vault/notes/{id}.json`.

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

After every write, check `~/.campshell/data/.campshell/validation-errors/brain-vault/` for a file matching your record's filename.

**Important:** Invalid files are automatically deleted. If validation fails, your written file will no longer exist. The error record contains the rejected data and the exact errors. Read it, fix the issue, and write a new file.

## Building the UI

To build a dashboard UI for this template, follow the **campshell-ui-creation** skill at `skills/campshell-ui-creation/SKILL.md`.

Recommended layouts per entity:

- **Notes:** `table-detail`
- **Tags:** `editable-list`

Use a **tabbed layout** to switch between entity views since this template has multiple entities.