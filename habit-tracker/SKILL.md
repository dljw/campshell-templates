---
name: campshell-habit-tracker
description: Habit Tracker — track daily and weekly habits with streaks, heatmaps, and insights
version: 1.0.0
---

# Campshell Habit Tracker

A file-based habit tracker. Each habit and completion is a JSON file. Habits define what to track, completions record when a habit was done on a given date. Streaks and stats are computed from completions.

## Dashboard UI

- **URL**: `http://localhost:{port}/habit-tracker`
- **Start**: Run `campshell-habit-tracker start`
- **Views**: Today (daily checklist), Calendar (heatmap), Habits (manage), Stats (analytics), Categories

## Data location

Data is managed through MCP tools (`campshell-create-entity`, `campshell-get-entity`, `campshell-update-entity`, `campshell-delete-entity`, `campshell-list-entities`). The data directory is resolved automatically at runtime.

Entity types:
- Habits: one file per habit
- Completions: one file per completion
- Categories: collection

## Habit fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| id | string | yes | Pattern: `^[a-z0-9-]{2,36}$` |
| createdAt | string | yes | ISO 8601 datetime |
| updatedAt | string | no | ISO 8601 datetime |
| name | string | yes | 1–200 characters |
| description | string | no | Max 500 characters |
| emoji | string | no | Max 10 characters |
| color | string | no | One of: red, orange, yellow, green, blue, purple, pink, gray |
| frequency | string | yes | One of: daily, weekly, custom |
| target | integer | no | 1–31, times per period |
| categoryId | string | no | Reference to a category ID |
| archived | boolean | no | Default false |

### Example habit

```json
{
  "id": "morning-run",
  "createdAt": "2026-04-01T00:00:00.000Z",
  "name": "Morning Run",
  "description": "Run 3K before breakfast",
  "emoji": "\ud83c\udfc3",
  "color": "green",
  "frequency": "daily",
  "categoryId": "health"
}
```

## Completion fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| id | string | yes | Convention: `{habitId}-{YYYY-MM-DD}` |
| createdAt | string | yes | ISO 8601 datetime |
| habitId | string | yes | Reference to a habit ID |
| date | string | yes | YYYY-MM-DD |
| notes | string | no | Max 500 characters |

### Example completion

```json
{
  "id": "morning-run-2026-04-04",
  "createdAt": "2026-04-04T06:30:00.000Z",
  "habitId": "morning-run",
  "date": "2026-04-04"
}
```

## Category fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| id | string | yes | Pattern: `^[a-z0-9-]{2,36}$` |
| createdAt | string | yes | ISO 8601 datetime |
| name | string | yes | 1–100 characters |
| emoji | string | no | Max 10 characters |
| color | string | no | Same enum as habit color |

## How to create a habit

Use `campshell-create-entity` with template `"habit-tracker"` and entity `"habits"`. Provide at least `id`, `createdAt`, `name`, and `frequency`.

## How to record a completion (mark habit done)

Use `campshell-create-entity` with template `"habit-tracker"` and entity `"completions"`. Use the ID convention `{habitId}-{YYYY-MM-DD}`:

```json
{
  "id": "morning-run-2026-04-04",
  "createdAt": "2026-04-04T06:30:00.000Z",
  "habitId": "morning-run",
  "date": "2026-04-04"
}
```

## How to remove a completion (unmark)

Use `campshell-delete-entity` with template `"habit-tracker"`, entity `"completions"`, and the completion ID.

## How to archive a habit

Update the habit file and set `"archived": true`.

## Query commands

```bash
# List all habits
campshell-habit-tracker query habits

# Filter by frequency
campshell-habit-tracker query habits --frequency daily

# Get a single habit
campshell-habit-tracker query habit morning-run

# List completions
campshell-habit-tracker query completions --habit morning-run --from 2026-04-01

# Get a single completion
campshell-habit-tracker query completion meditation-2026-04-01

# Get streaks
campshell-habit-tracker query streaks

# Get stats (last 30 days)
campshell-habit-tracker query stats

# Search habits
campshell-habit-tracker query search "morning"

# List categories
campshell-habit-tracker query categories
```

## Checking for errors

MCP tools validate data automatically. If validation fails, the tool response contains the exact errors. Fix the issue and retry the operation.
