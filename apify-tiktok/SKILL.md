---
name: campshell-apify-tiktok
description: Read-only TikTok analytics via the Apify scraper — profile stats, videos, hashtag activity
version: 1.0.0
---

# TikTok Analytics (Apify)

A Campshell **service template** that scrapes public TikTok data via the Apify platform.

This is a service template — use `campshell-service` with action `run` to execute operations.

## Dashboard UI

Open the dashboard at `http://localhost:{port}/apify-tiktok`.

## Required Secrets

| Key | Label | Required | Description |
|-----|-------|----------|-------------|
| `APIFY_TOKEN` | Apify API Token | Yes | Get yours at https://console.apify.com/account/integrations |

## Limitations

- **Sync runs only.** Each operation must complete in under 5 minutes. For large jobs, lower the `videosLimit`.
- **Public data only.**
- **Rate limit:** 5 calls per minute. Apify charges per actor run.

## Operations

### profile-scrape

Scrape public TikTok profile stats for one or more usernames.

**Timeout:** 180000ms · **Rate limit:** 5/min

**Input:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `usernames` | string[] | Yes | TikTok usernames (no @, max 10 per call) |

**Output:**

| Field | Type | Description |
|-------|------|-------------|
| `profiles` | object[] | One per username: `username, nickname, followerCount, followingCount, videoCount, heartCount, bio, verified, avatarUrl` |

**MCP call:**
```
campshell-service template="apify-tiktok" action="run" operation="profile-scrape" input={"usernames":["zachking","khaby.lame"]}
```

### videos-scrape

Scrape recent videos from a public TikTok profile.

**Input:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `username` | string | Yes | TikTok username (no @) |
| `videosLimit` | integer | No | Max videos to fetch (default: 20, max: 50) |

**Output:**

| Field | Type | Description |
|-------|------|-------------|
| `videos` | object[] | `id, text, playCount, diggCount, commentCount, shareCount, createTime, webVideoUrl, musicTitle` |

**MCP call:**
```
campshell-service template="apify-tiktok" action="run" operation="videos-scrape" input={"username":"zachking","videosLimit":10}
```

### hashtag-scrape

Scrape recent videos using a given hashtag.

**Input:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `hashtag` | string | Yes | Hashtag without the # symbol |
| `videosLimit` | integer | No | Max videos to fetch (default: 20, max: 50) |

**Output:**

| Field | Type | Description |
|-------|------|-------------|
| `videos` | object[] | `id, text, playCount, diggCount, authorUsername, createTime` |

**MCP call:**
```
campshell-service template="apify-tiktok" action="run" operation="hashtag-scrape" input={"hashtag":"funny","videosLimit":20}
```

## Viewing Results

Run results are saved to `~/Campshell/data/apify-tiktok/runs/{run-id}.json`.
