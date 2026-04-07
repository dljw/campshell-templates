---
name: campshell-dataforseo
description: DataForSEO API integration — search volume, SERP analysis, and keyword research
version: 1.0.0
---

# DataForSEO

A Campshell **service template** that provides programmatic access to DataForSEO's keyword and SERP data APIs.

This is a service template — use `campshell-run-service` to execute operations (not `campshell-create-entity`).

## Dashboard UI

Open the dashboard at `http://localhost:{port}/dataforseo` to:
- Run operations via forms
- View past execution results
- Configure API keys

## Required Secrets

Configure these before running any operations:

| Key | Label | Required | Description |
|-----|-------|----------|-------------|
| `DATAFORSEO_LOGIN` | DataForSEO Login Email | Yes | Your DataForSEO account email |
| `DATAFORSEO_PASSWORD` | DataForSEO API Password | Yes | API password from DataForSEO dashboard |

Set secrets via MCP:
```
campshell-set-secret template="dataforseo" key="DATAFORSEO_LOGIN" value="user@example.com"
campshell-set-secret template="dataforseo" key="DATAFORSEO_PASSWORD" value="your-api-password"
```

Check status: `campshell-secrets-status template="dataforseo"`

## Operations

### search-volume

Get monthly search volume and CPC data for keywords.

**Timeout:** 30000ms
**Rate limit:** 10 calls/minute

**Input:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `keywords` | string[] | Yes | Keywords to look up (max 50 per request) |
| `locationCode` | integer | No | DataForSEO location code (default: 2840 = US) |
| `languageCode` | string | No | Language code (default: en) |

**Output:**

| Field | Type | Description |
|-------|------|-------------|
| `results` | object[] | Array of keyword data with searchVolume, cpc, competition |

**MCP call:**
```
campshell-run-service template="dataforseo" operation="search-volume" input={"keywords":["camping gear","hiking boots"]}
```

### serp-analysis

Analyze top Google search results for a keyword. Returns current live SERP data.

**Timeout:** 60000ms

**Input:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `keyword` | string | Yes | Keyword to analyze SERP for |
| `locationCode` | integer | No | DataForSEO location code (default: 2840 = US) |
| `depth` | integer | No | Number of results to return (default: 10, max: 100) |

**Output:**

| Field | Type | Description |
|-------|------|-------------|
| `results` | object[] | SERP results with position, url, title, description, domain |

**MCP call:**
```
campshell-run-service template="dataforseo" operation="serp-analysis" input={"keyword":"best project management tools"}
```

### keyword-suggestions

Get related keyword ideas based on a seed keyword.

**Timeout:** 30000ms

**Input:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `seed` | string | Yes | Seed keyword to get suggestions for |
| `locationCode` | integer | No | DataForSEO location code (default: 2840 = US) |
| `limit` | integer | No | Max suggestions to return (default: 20, max: 100) |

**Output:**

| Field | Type | Description |
|-------|------|-------------|
| `suggestions` | object[] | Related keywords with searchVolume, cpc, competition |

**MCP call:**
```
campshell-run-service template="dataforseo" operation="keyword-suggestions" input={"seed":"electric vehicles"}
```

## Viewing Results

Run results are saved to `~/Campshell/data/dataforseo/runs/{run-id}.json`.

View run history via MCP:
```
campshell-get-service-runs template="dataforseo"
```

## Common Location Codes

| Country | Code |
|---------|------|
| United States | 2840 |
| United Kingdom | 2826 |
| Canada | 2124 |
| Australia | 2036 |
| Germany | 2276 |
| France | 2250 |
| India | 2356 |
| Japan | 2392 |
