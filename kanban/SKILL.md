---
name: campshell-kanban
description: Kanban board — create and manage task cards across columns
version: 1.0.0
---

# Campshell Kanban Board

A file-based kanban board. Each card is a JSON file. Use MCP tools to create, update, and delete cards. A dashboard UI reflects changes in real time.

## Dashboard UI

A real-time dashboard visualizes this board. Changes appear instantly via WebSocket.

- **URL pattern:** `http://localhost:{port}/kanban` (default port is 4000 — check `campshell-install` or `campshell-start` tool responses for the exact URL)
- **Start the dashboard:** Run `campshell dashboard` or use the Campshell desktop app
- **When to suggest:** After installing the template, after creating/modifying cards, or when the user wants to see their board

## Data location

Data is managed through MCP tools (`campshell-create-entity`, `campshell-get-entity`, `campshell-update-entity`, `campshell-delete-entity`, `campshell-list-entities`). The data directory is resolved automatically at runtime.

Entity types:
- Cards: one file per card
- Columns: collection

## Card fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| id | string | yes | `^[a-z0-9-]{8,36}$` |
| title | string | yes | 1–500 characters |
| column | string | yes | Use a column ID from `columns.json` |
| createdAt | string | yes | ISO 8601 datetime (`YYYY-MM-DDTHH:mm:ss.sssZ`) |
| description | string | no | Max 5,000 characters |
| labels | string[] | no | Max 10 items |
| priority | string | no | `low`, `medium`, `high`, or `urgent` |
| dueDate | string | no | Date format (`YYYY-MM-DD`) |
| assignee | string | no | |
| order | integer | no | >= 0, controls position within column |
| updatedAt | string | no | ISO 8601 datetime |

No extra fields allowed — any unknown property will fail validation.

## Complete card example

```json
{
  "id": "redesign-homepage-01",
  "title": "Redesign the homepage layout",
  "description": "Update hero section and navigation for the new brand guidelines.",
  "column": "todo",
  "labels": ["design", "frontend"],
  "priority": "high",
  "dueDate": "2026-04-01",
  "assignee": "alice",
  "order": 0,
  "createdAt": "2026-03-21T10:00:00.000Z"
}
```

## How to create a card

Use `campshell-create-entity` with template `"kanban"` and entity `"cards"`. Provide at least `id`, `title`, `column`, and `createdAt`. The tool validates and returns the created entity or validation errors.

## How to update a card

Use `campshell-update-entity` with template `"kanban"`, entity `"cards"`, and the card ID. Provide only the fields to change. `updatedAt` is set automatically.

## How to delete a card

Use `campshell-delete-entity` with template `"kanban"`, entity `"cards"`, and the card ID.

## How to move a card

Use `campshell-update-entity` with template `"kanban"`, entity `"cards"`, the card ID, and `{ "column": "<target-column-id>" }`.

## Columns

Use `campshell-list-entities` with template `"kanban"` and entity `"columns"` to get the current board columns. The default initial set is:

| ID | Name |
|----|------|
| backlog | Backlog |
| todo | To Do |
| in-progress | In Progress |
| review | Review |
| done | Done |

## Query commands

Run queries with `npx @campshell/kanban query <command>`. All output is JSON. Every subcommand accepts `--data-dir <dir>` to override the default data location.

The `--column` flag accepts a column ID or display name (case-insensitive). For example, `--column "In Progress"` and `--column in-progress` are equivalent.

**List cards** — filter by column or priority:
```
npx @campshell/kanban query list [--column <name-or-id>] [--priority <level>]
```
Returns: array of Card objects.

**Get a single card:**
```
npx @campshell/kanban query get <id>
```
Returns: a Card object, or `{ "error": "not_found", "message": "..." }` if missing.

**List columns with card counts:**
```
npx @campshell/kanban query columns
```
Returns: array of column objects, each with an added `cardCount` field.

**Find overdue cards** (past their `dueDate`):
```
npx @campshell/kanban query overdue [--column <name-or-id>]
```
Returns: array of Card objects, each with an added `daysOverdue` field.

**Search cards** by title or description:
```
npx @campshell/kanban query search <term> [--column <name-or-id>]
```
Returns: array of `{ id, title, description, column, matchedIn }` where `matchedIn` lists which fields matched (`"title"` and/or `"description"`).

## Checking for errors

MCP tools validate data automatically. If validation fails, the tool response contains the exact errors. Fix the issue and retry the operation.
