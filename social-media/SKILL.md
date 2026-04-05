---
name: campshell-social-media
description: Social Media — Plan, create, and track social media content across Instagram, TikTok, LinkedIn, YouTube, Facebook, and Lemon8 for multiple businesses
version: 1.0.0
---

# Campshell Social Media

A file-based social media content calendar and strategy tracker. Each post is a JSON file. Write a file to create a post, edit it to update, delete it to remove. A dashboard UI reflects changes in real time.

## Dashboard UI

A real-time dashboard visualizes this social media tracker. Changes appear instantly via WebSocket.

- **URL pattern:** `http://localhost:{port}/social-media` (default port is 4000 — check `campshell-install` or `campshell-start` tool responses for the exact URL)
- **Start the dashboard:** Run `campshell dashboard` or use the Campshell desktop app

## Data location

- Businesses: `~/.campshell/data/social-media/businesses/{id}.json` (one file per business)
- Posts: `~/.campshell/data/social-media/posts/{id}.json` (one file per post)
- Pillars: `~/.campshell/data/social-media/pillars.json`
- Campaigns: `~/.campshell/data/social-media/campaigns/{id}.json` (one file per campaign)
- Ideas: `~/.campshell/data/social-media/ideas/{id}.json` (one file per idea)
- Platforms: `~/.campshell/data/social-media/platforms/{id}.json` (one file per platform account)
- Analytics: `~/.campshell/data/social-media/analytics/{id}.json` (one file per analytics record)
- Validation errors: `~/.campshell/data/.campshell/validation-errors/social-media/`

## Businesses fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| id | string | yes | `^[a-z0-9-]{2,36}$` |
| createdAt | string (datetime) | yes | ISO 8601 datetime |
| updatedAt | string (datetime) | no | ISO 8601 datetime |
| name | string | yes | max 200 characters |
| description | string | no | max 2000 characters |
| industry | string | no | max 200 characters |
| logoUrl | string (URL) | no |  |
| website | string (URL) | no |  |
| active | boolean | no |  |
| notes | string | no | max 5000 characters |

No extra fields allowed — any unknown property will fail validation.

## How to create a business

1. Generate a unique ID: 2–36 characters, lowercase letters, digits, and hyphens only.
2. Write a JSON file to `~/.campshell/data/social-media/businesses/{id}.json` with at least `id`, `createdAt`, `name`.
3. Check for validation errors (see **Checking for errors** below).

## How to update a business

1. Read the existing file at `~/.campshell/data/social-media/businesses/{id}.json`.
2. Modify the fields you need. Set `updatedAt` to the current ISO 8601 datetime.
3. Write the full JSON back to the same path.
4. Check for validation errors.

## How to delete a business

Delete the file at `~/.campshell/data/social-media/businesses/{id}.json`.

> **Warning:** Before deleting a business, check for posts, campaigns, ideas, and platforms records that reference it via `businessId`.

## Posts fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| id | string | yes | `^[a-z0-9-]{2,36}$` |
| createdAt | string (datetime) | yes | ISO 8601 datetime |
| updatedAt | string (datetime) | no | ISO 8601 datetime |
| title | string | yes | max 300 characters |
| businessId | string (business ID) | yes | Must be a valid ID from the `businesses` directory |
| scheduledAt | string (datetime) | no | ISO 8601 datetime |
| publishedAt | string (datetime) | no | ISO 8601 datetime |
| platform | string | yes | `instagram`, `tiktok`, `linkedin`, `youtube`, `facebook`, `lemon8` |
| format | string | yes | `reel`, `carousel`, `story`, `static-image`, `short-form-video`, `long-form-video`, `text-post`, `article`, `duet`, `stitch`, `mini-article`, `tutorial`, `list-post` |
| status | string | yes | `idea`, `drafting`, `ready`, `scheduled`, `published`, `archived` |
| pillarId | string (pillar ID) | no | Must be a valid ID from the `pillars` collection |
| campaignId | string (campaign ID) | no | Must be a valid ID from the `campaigns` directory |
| caption | string | no | max 5000 characters |
| hook | string | no | max 500 characters |
| cta | string | no | max 500 characters |
| hashtags | string[] | no | max 30 items |
| contentTier | string | no | `hero`, `hub`, `hygiene` |
| assetUrl | string (URL) | no |  |
| crosspostOf | string (post ID) | no | Must be a valid ID from the `posts` directory |
| notes | string | no | max 5000 characters |

No extra fields allowed — any unknown property will fail validation.

## How to create a post

1. Generate a unique ID: 2–36 characters, lowercase letters, digits, and hyphens only.
2. Write a JSON file to `~/.campshell/data/social-media/posts/{id}.json` with at least `id`, `createdAt`, `title`, `businessId`, `platform`, `format`, `status`.
3. Check for validation errors (see **Checking for errors** below).

## How to update a post

1. Read the existing file at `~/.campshell/data/social-media/posts/{id}.json`.
2. Modify the fields you need. Set `updatedAt` to the current ISO 8601 datetime.
3. Write the full JSON back to the same path.
4. Check for validation errors.

## How to delete a post

Delete the file at `~/.campshell/data/social-media/posts/{id}.json`.

> **Warning:** Before deleting a post, check for analytics records that reference it via `postId`.
> **Warning:** Before deleting a post, check for other posts that reference it via `crosspostOf`.
> **Warning:** Before deleting a post, check for ideas that reference it via `convertedPostId`.

## Pillars fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| id | string | yes | `^[a-z0-9-]{2,36}$` |
| createdAt | string (datetime) | yes | ISO 8601 datetime |
| updatedAt | string (datetime) | no | ISO 8601 datetime |
| name | string | yes | max 100 characters |
| description | string | no | max 1000 characters |
| color | string | no | `red`, `orange`, `yellow`, `green`, `blue`, `purple`, `pink`, `gray` |
| emoji | string | no | max 10 characters |
| targetMix | integer | no | 0–100 |

No extra fields allowed — any unknown property will fail validation.

## Campaigns fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| id | string | yes | `^[a-z0-9-]{2,36}$` |
| createdAt | string (datetime) | yes | ISO 8601 datetime |
| updatedAt | string (datetime) | no | ISO 8601 datetime |
| name | string | yes | max 300 characters |
| businessId | string (business ID) | yes | Must be a valid ID from the `businesses` directory |
| description | string | no | max 2000 characters |
| status | string | yes | `planning`, `active`, `completed`, `paused` |
| startDate | string (date) | no |  |
| endDate | string (date) | no |  |
| tier | string | no | `hero`, `hub`, `hygiene` |
| platforms | string[] | no | max 6 items |
| goal | string | no | max 500 characters |
| notes | string | no | max 5000 characters |

No extra fields allowed — any unknown property will fail validation.

## How to create a campaign

1. Generate a unique ID: 2–36 characters, lowercase letters, digits, and hyphens only.
2. Write a JSON file to `~/.campshell/data/social-media/campaigns/{id}.json` with at least `id`, `createdAt`, `name`, `businessId`, `status`.
3. Check for validation errors (see **Checking for errors** below).

## How to update a campaign

1. Read the existing file at `~/.campshell/data/social-media/campaigns/{id}.json`.
2. Modify the fields you need. Set `updatedAt` to the current ISO 8601 datetime.
3. Write the full JSON back to the same path.
4. Check for validation errors.

## How to delete a campaign

Delete the file at `~/.campshell/data/social-media/campaigns/{id}.json`.

> **Warning:** Before deleting a campaign, check for posts that reference it via `campaignId`.

## Ideas fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| id | string | yes | `^[a-z0-9-]{2,36}$` |
| createdAt | string (datetime) | yes | ISO 8601 datetime |
| updatedAt | string (datetime) | no | ISO 8601 datetime |
| title | string | yes | max 300 characters |
| businessId | string (business ID) | no | Must be a valid ID from the `businesses` directory |
| description | string | no | max 2000 characters |
| source | string | no | max 500 characters |
| sourceUrl | string (URL) | no |  |
| platform | string | no | `instagram`, `tiktok`, `linkedin`, `youtube`, `facebook`, `lemon8`, `any` |
| format | string | no | `reel`, `carousel`, `story`, `static-image`, `short-form-video`, `long-form-video`, `text-post`, `article`, `duet`, `stitch`, `mini-article`, `tutorial`, `list-post`, `undecided` |
| pillarId | string (pillar ID) | no | Must be a valid ID from the `pillars` collection |
| hook | string | no | max 500 characters |
| priority | string | no | `high`, `medium`, `low` |
| status | string | yes | `captured`, `evaluating`, `approved`, `rejected`, `converted` |
| convertedPostId | string (post ID) | no | Must be a valid ID from the `posts` directory |
| notes | string | no | max 5000 characters |

No extra fields allowed — any unknown property will fail validation.

## How to create an idea

1. Generate a unique ID: 2–36 characters, lowercase letters, digits, and hyphens only.
2. Write a JSON file to `~/.campshell/data/social-media/ideas/{id}.json` with at least `id`, `createdAt`, `title`, `status`.
3. Check for validation errors (see **Checking for errors** below).

## How to update an idea

1. Read the existing file at `~/.campshell/data/social-media/ideas/{id}.json`.
2. Modify the fields you need. Set `updatedAt` to the current ISO 8601 datetime.
3. Write the full JSON back to the same path.
4. Check for validation errors.

## How to delete an idea

Delete the file at `~/.campshell/data/social-media/ideas/{id}.json`.

## Platforms fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| id | string | yes | `^[a-z0-9-]{2,36}$` |
| createdAt | string (datetime) | yes | ISO 8601 datetime |
| updatedAt | string (datetime) | no | ISO 8601 datetime |
| businessId | string (business ID) | yes | Must be a valid ID from the `businesses` directory |
| platform | string | yes | `instagram`, `tiktok`, `linkedin`, `youtube`, `facebook`, `lemon8` |
| active | boolean | no |  |
| handle | string | no | max 100 characters |
| profileUrl | string (URL) | no |  |
| postsPerWeek | integer | no | 0–50 |
| bestTimes | string[] | no | max 7 items |
| primaryFormats | string[] | no | max 10 items |
| followers | integer | no | >= 0 |
| notes | string | no | max 2000 characters |

No extra fields allowed — any unknown property will fail validation.

## How to create a platform account

1. Generate a unique ID: 2–36 characters, lowercase letters, digits, and hyphens only (e.g. `acme-instagram`).
2. Write a JSON file to `~/.campshell/data/social-media/platforms/{id}.json` with at least `id`, `createdAt`, `businessId`, `platform`.
3. Check for validation errors (see **Checking for errors** below).

## How to update a platform account

1. Read the existing file at `~/.campshell/data/social-media/platforms/{id}.json`.
2. Modify the fields you need. Set `updatedAt` to the current ISO 8601 datetime.
3. Write the full JSON back to the same path.
4. Check for validation errors.

## How to delete a platform account

Delete the file at `~/.campshell/data/social-media/platforms/{id}.json`.

## Analytics fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| id | string | yes | `^[a-z0-9-]{2,36}$` |
| createdAt | string (datetime) | yes | ISO 8601 datetime |
| updatedAt | string (datetime) | no | ISO 8601 datetime |
| postId | string (post ID) | yes | Must be a valid ID from the `posts` directory |
| recordedAt | string (date) | yes |  |
| impressions | integer | no | >= 0 |
| reach | integer | no | >= 0 |
| likes | integer | no | >= 0 |
| comments | integer | no | >= 0 |
| shares | integer | no | >= 0 |
| saves | integer | no | >= 0 |
| clicks | integer | no | >= 0 |
| engagementRate | number | no | 0–100 |
| videoViews | integer | no | >= 0 |
| videoCompletionRate | number | no | 0–100 |
| followerChange | integer | no |  |
| notes | string | no | max 2000 characters |

No extra fields allowed — any unknown property will fail validation.

## How to create an analytics record

1. Generate a unique ID: 2–36 characters, lowercase letters, digits, and hyphens only (e.g. `brand-launch-ig-day1`).
2. Write a JSON file to `~/.campshell/data/social-media/analytics/{id}.json` with at least `id`, `createdAt`, `postId`, `recordedAt`.
3. Check for validation errors (see **Checking for errors** below).

## How to update an analytics record

1. Read the existing file at `~/.campshell/data/social-media/analytics/{id}.json`.
2. Modify the fields you need. Set `updatedAt` to the current ISO 8601 datetime.
3. Write the full JSON back to the same path.
4. Check for validation errors.

## How to delete an analytics record

Delete the file at `~/.campshell/data/social-media/analytics/{id}.json`.

## Query commands

Run queries with `npx @campshell/social-media query <command>`. All output is JSON.

**List businesses:**
```
npx @campshell/social-media query list businesses
```
Returns: array of Business objects.

**Get a single business:**
```
npx @campshell/social-media query get businesses <id>
```
Returns: a Business object, or `{ "error": "not_found" }` if missing.

**List posts:**
```
npx @campshell/social-media query list posts
```
Returns: array of Post objects.

**Get a single post:**
```
npx @campshell/social-media query get posts <id>
```
Returns: a Post object, or `{ "error": "not_found" }` if missing.

**List campaigns:**
```
npx @campshell/social-media query list campaigns
```
Returns: array of Campaign objects.

**Get a single campaign:**
```
npx @campshell/social-media query get campaigns <id>
```
Returns: a Campaign object, or `{ "error": "not_found" }` if missing.

**List ideas:**
```
npx @campshell/social-media query list ideas
```
Returns: array of Idea objects.

**Get a single idea:**
```
npx @campshell/social-media query get ideas <id>
```
Returns: an Idea object, or `{ "error": "not_found" }` if missing.

**List platforms:**
```
npx @campshell/social-media query list platforms
```
Returns: array of Platform objects.

**List analytics:**
```
npx @campshell/social-media query list analytics
```
Returns: array of Analytics objects.

## Checking for errors

After every write, check `~/.campshell/data/.campshell/validation-errors/social-media/` for a file matching your record's filename.

**Important:** Invalid files are automatically deleted. If validation fails, your written file will no longer exist. The error record contains the rejected data and the exact errors. Read it, fix the issue, and write a new file.

## Building the UI

To build a dashboard UI for this template, follow the **campshell-ui-creation** skill at `skills/campshell-ui-creation/SKILL.md`.

This is a **multipage template** — see `campshell-ui-creation` SKILL.md § Multipage Templates.

Recommended layouts per view:

- **Calendar** (`/social-media`): `calendar` (posts by scheduled date)
- **Pipeline** (`/social-media/pipeline`): `kanban` (posts by status)
- **Ideas** (`/social-media/ideas`): `table-detail`
- **Campaigns** (`/social-media/campaigns`): `card-grid`
- **Analytics** (`/social-media/analytics`): `table-detail`
- **Platforms** (`/social-media/platforms`): `table-detail`
- **Businesses** (`/social-media/businesses`): `card-grid`
