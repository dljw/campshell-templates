---
name: campshell-posthog
description: PostHog integration — event capture, feature flag evaluation, and event listing
version: 1.0.0
---

# PostHog

A Campshell **service template** that wraps the most common PostHog API endpoints: event capture, feature flag evaluation, and event listing.

This is a service template — use `campshell-service` with action `run` to execute operations.

## Required Secrets

| Key | Label | Required | Description |
|-----|-------|----------|-------------|
| `POSTHOG_API_KEY` | Project API Key | Yes | From Project Settings → API Keys |
| `POSTHOG_INSTANCE` | Instance URL | No | Defaults to `https://app.posthog.com`; set to `https://eu.posthog.com` for EU |
| `POSTHOG_PERSONAL_API_KEY` | Personal API Key | No | Required only for `list-events` |
| `POSTHOG_PROJECT_ID` | Project ID | No | Numeric, required only for `list-events` |

Configure secrets via the Campshell dashboard UI. Secrets must never be shared in the AI conversation.

Check configuration status: `campshell-service template="posthog" action="secrets"`

## Operations

### capture-event

Track a custom event for a user via `POST {instance}/capture/`.

**Timeout:** 5000ms — **Rate limit:** 600/min

**Input:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `event` | string | Yes | Event name (max 200 chars) |
| `distinctId` | string | Yes | Unique user identifier |
| `properties` | object | No | Event properties as key/value pairs |
| `timestamp` | string | No | ISO 8601 timestamp; defaults to now |

**Output:** `{ success: boolean, status: integer }`

**MCP call:**
```
campshell-service template="posthog" action="run" operation="capture-event" input={"event":"signup_completed","distinctId":"user_42","properties":{"plan":"pro"}}
```

### get-feature-flags

Evaluate feature flags for a user via `POST {instance}/decide/?v=3`.

**Timeout:** 10000ms — **Rate limit:** 60/min

**Input:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `distinctId` | string | Yes | Unique user identifier |
| `groups` | object | No | Optional group properties for group-based flags |

**Output:** `{ flags: object, featureFlagPayloads: object }`

**MCP call:**
```
campshell-service template="posthog" action="run" operation="get-feature-flags" input={"distinctId":"user_42"}
```

### list-events

List recent events via `GET {instance}/api/projects/{id}/events/`. Uses Bearer auth with the Personal API Key — the Project API Key is not authorized for this endpoint.

**Timeout:** 30000ms — **Rate limit:** 60/min

**Input:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `limit` | integer | No | Max events to return (1–1000, default 100) |
| `after` | string | No | ISO 8601 timestamp; only events after this time |
| `eventName` | string | No | Filter by event name |

**Output:** `{ results: Array<{ id, event, distinctId, timestamp, properties }> }`

**MCP call:**
```
campshell-service template="posthog" action="run" operation="list-events" input={"limit":50,"eventName":"signup_completed"}
```

## Viewing Results

Run results are saved to `~/Campshell/data/posthog/runs/{run-id}.json`.

View run history via MCP:
```
campshell-service template="posthog" action="runs"
```
