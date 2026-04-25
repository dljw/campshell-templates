---
name: campshell-apify-instagram
description: Read-only Instagram analytics via the Apify scraper — profile stats, posts, hashtag activity
version: 1.0.0
---

# Instagram Analytics (Apify)

A Campshell **service template** that scrapes public Instagram data via the Apify platform.

This is a service template — use `campshell-service` with action `run` to execute operations.

## Dashboard UI

Open the dashboard at `http://localhost:{port}/apify-instagram` to:
- Run scraping operations via forms
- View past run results
- Configure your Apify token

## Required Secrets

| Key | Label | Required | Description |
|-----|-------|----------|-------------|
| `APIFY_TOKEN` | Apify API Token | Yes | Get yours at https://console.apify.com/account/integrations |

Configure secrets via the **Campshell dashboard UI** — never share them in the AI conversation.

Check configuration status: `campshell-service template="apify-instagram" action="secrets"`

## Limitations

- **Sync runs only.** Each operation must complete in under 5 minutes (Apify's sync endpoint ceiling). For large jobs, lower the `postsLimit`.
- **Public data only.** Cannot access private accounts.
- **Rate limit:** 5 calls per minute. Apify charges per actor run — keep an eye on your dashboard.

## Operations

### profile-scrape

Scrape public Instagram profile stats for one or more usernames.

**Timeout:** 180000ms · **Rate limit:** 5/min

**Input:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `usernames` | string[] | Yes | Instagram usernames (no @, max 10 per call) |

**Output:**

| Field | Type | Description |
|-------|------|-------------|
| `profiles` | object[] | One per username: `username, fullName, followersCount, followingCount, postsCount, biography, isVerified, profilePicUrl` |

**MCP call:**
```
campshell-service template="apify-instagram" action="run" operation="profile-scrape" input={"usernames":["nasa","natgeo"]}
```

### posts-scrape

Scrape recent posts from a public Instagram profile, with engagement counts.

**Timeout:** 180000ms · **Rate limit:** 5/min

**Input:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `username` | string | Yes | Instagram username (no @) |
| `postsLimit` | integer | No | Max posts to fetch (default: 20, max: 50) |

**Output:**

| Field | Type | Description |
|-------|------|-------------|
| `posts` | object[] | One per post: `id, shortcode, caption, likesCount, commentsCount, timestamp, mediaUrl, mediaType, url` |

**MCP call:**
```
campshell-service template="apify-instagram" action="run" operation="posts-scrape" input={"username":"nasa","postsLimit":10}
```

### hashtag-scrape

Scrape recent posts using a given hashtag.

**Timeout:** 180000ms · **Rate limit:** 5/min

**Input:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `hashtag` | string | Yes | Hashtag without the # symbol |
| `postsLimit` | integer | No | Max posts to fetch (default: 20, max: 50) |

**Output:**

| Field | Type | Description |
|-------|------|-------------|
| `posts` | object[] | One per post: `id, shortcode, caption, likesCount, commentsCount, timestamp, ownerUsername` |

**MCP call:**
```
campshell-service template="apify-instagram" action="run" operation="hashtag-scrape" input={"hashtag":"travel","postsLimit":20}
```

## Viewing Results

Run results are saved to `~/Campshell/data/apify-instagram/runs/{run-id}.json`.

View run history via MCP:
```
campshell-service template="apify-instagram" action="runs"
```
