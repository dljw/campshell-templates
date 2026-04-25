---
name: campshell-apify-youtube
description: Read-only YouTube analytics via the Apify scraper — channel stats, recent videos, search results
version: 1.0.0
---

# YouTube Analytics (Apify)

A Campshell **service template** that scrapes public YouTube data via the Apify platform.

This is a service template — use `campshell-service` with action `run` to execute operations.

## Dashboard UI

Open the dashboard at `http://localhost:{port}/apify-youtube`.

## Required Secrets

| Key | Label | Required | Description |
|-----|-------|----------|-------------|
| `APIFY_TOKEN` | Apify API Token | Yes | Get yours at https://console.apify.com/account/integrations |

## Limitations

- **Sync runs only.** Each operation must complete in under 5 minutes. For large jobs, lower the `maxVideos`/`maxResults`.
- **Public data only.**
- **Rate limit:** 5 calls per minute. Apify charges per actor run.

## Operations

### channel-scrape

Scrape public YouTube channel stats. Uses actor `streamers/youtube-scraper`.

**Timeout:** 180000ms · **Rate limit:** 5/min

**Input:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `channelUrls` | string[] | Yes | YouTube channel URLs (max 10 per call) |

**Output:**

| Field | Type | Description |
|-------|------|-------------|
| `channels` | object[] | `channelId, channelName, subscriberCount, videosCount, viewCount, description, channelUrl` |

**MCP call:**
```
campshell-service template="apify-youtube" action="run" operation="channel-scrape" input={"channelUrls":["https://www.youtube.com/@MrBeast"]}
```

### videos-scrape

Scrape recent videos from a public YouTube channel.

**Input:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `channelUrl` | string | Yes | YouTube channel URL |
| `maxVideos` | integer | No | Max videos to fetch (default: 20, max: 50) |

**Output:**

| Field | Type | Description |
|-------|------|-------------|
| `videos` | object[] | `videoId, title, viewCount, likesCount, commentsCount, durationSeconds, publishedAt, url, thumbnailUrl` |

**MCP call:**
```
campshell-service template="apify-youtube" action="run" operation="videos-scrape" input={"channelUrl":"https://www.youtube.com/@MrBeast","maxVideos":10}
```

### search-scrape

Scrape YouTube search results for a query.

**Input:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `query` | string | Yes | Search query |
| `maxResults` | integer | No | Max results to fetch (default: 20, max: 50) |

**Output:**

| Field | Type | Description |
|-------|------|-------------|
| `results` | object[] | `videoId, title, channelName, viewCount, publishedAt, url` |

**MCP call:**
```
campshell-service template="apify-youtube" action="run" operation="search-scrape" input={"query":"react tutorial","maxResults":20}
```

## Viewing Results

Run results are saved to `~/Campshell/data/apify-youtube/runs/{run-id}.json`.
