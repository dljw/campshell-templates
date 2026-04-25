---
name: campshell-apify-meta
description: Read-only Facebook/Meta analytics via the Apify scraper — page stats and recent posts
version: 1.0.0
---

# Meta Analytics (Apify)

A Campshell **service template** that scrapes public Facebook (Meta) data via the Apify platform.

This is a service template — use `campshell-service` with action `run` to execute operations.

## Dashboard UI

Open the dashboard at `http://localhost:{port}/apify-meta`.

## Required Secrets

| Key | Label | Required | Description |
|-----|-------|----------|-------------|
| `APIFY_TOKEN` | Apify API Token | Yes | Get yours at https://console.apify.com/account/integrations |

## Limitations

- **Sync runs only.** Each operation must complete in under 5 minutes.
- **Public pages only** (no groups, no ads, no profiles).
- **Rate limit:** 5 calls per minute. Apify charges per actor run.

## Operations

### pages-scrape

Scrape public Facebook page stats. Uses actor `apify/facebook-pages-scraper`.

**Timeout:** 180000ms · **Rate limit:** 5/min

**Input:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `pageUrls` | string[] | Yes | Facebook page URLs (max 10 per call) |

**Output:**

| Field | Type | Description |
|-------|------|-------------|
| `pages` | object[] | `pageId, name, followers, likes, category, about, websites, profilePictureUrl` |

**MCP call:**
```
campshell-service template="apify-meta" action="run" operation="pages-scrape" input={"pageUrls":["https://www.facebook.com/nasa"]}
```

### posts-scrape

Scrape recent posts from a public Facebook page. Uses actor `apify/facebook-posts-scraper`.

**Input:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `pageUrl` | string | Yes | Facebook page URL |
| `postsLimit` | integer | No | Max posts to fetch (default: 20, max: 50) |

**Output:**

| Field | Type | Description |
|-------|------|-------------|
| `posts` | object[] | `postId, text, time, likesCount, commentsCount, sharesCount, url, mediaType` |

**MCP call:**
```
campshell-service template="apify-meta" action="run" operation="posts-scrape" input={"pageUrl":"https://www.facebook.com/nasa","postsLimit":10}
```

## Viewing Results

Run results are saved to `~/Campshell/data/apify-meta/runs/{run-id}.json`.
