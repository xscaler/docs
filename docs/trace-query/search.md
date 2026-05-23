---
id: search
title: Trace Search
sidebar_label: Search
slug: /trace-query/search
---

# Trace Search

Search for traces and explore span attributes using the TraceQL search API.

---

## Search traces

**Endpoint:** `GET https://euw1-01.t.xscalerlabs.com/api/search`

### Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `q` | No | TraceQL query string |
| `tags` | No | Space-separated `key=value` pairs (simple search without TraceQL) |
| `minDuration` | No | Minimum trace duration, e.g. `500ms`, `1s` |
| `maxDuration` | No | Maximum trace duration |
| `limit` | No | Maximum number of traces to return. Default: `20`. |
| `start` | No | Range start — Unix timestamp (seconds) |
| `end` | No | Range end — Unix timestamp (seconds) |

### Examples

**Find slow traces**

```bash
curl "https://euw1-01.t.xscalerlabs.com/api/search" \
  -H "Authorization: Bearer <token>" \
  -H "X-Scope-OrgID: <tenant-id>" \
  --data-urlencode 'q={ duration > 1s }' \
  --data-urlencode 'limit=20'
```

**Find error traces from a service**

```bash
curl "https://euw1-01.t.xscalerlabs.com/api/search" \
  -H "Authorization: Bearer <token>" \
  -H "X-Scope-OrgID: <tenant-id>" \
  --data-urlencode 'q={ resource.service.name = "api" && status = error }' \
  --data-urlencode 'start=1716300000' \
  --data-urlencode 'end=1716303600'
```

**Simple tag search (no TraceQL)**

```bash
curl "https://euw1-01.t.xscalerlabs.com/api/search" \
  -H "Authorization: Bearer <token>" \
  -H "X-Scope-OrgID: <tenant-id>" \
  --data-urlencode 'tags=service.name=api http.status_code=500'
```

---

## Fetch a trace by ID

**Endpoint:** `GET https://euw1-01.t.xscalerlabs.com/api/traces/<traceID>`

```bash
curl "https://euw1-01.t.xscalerlabs.com/api/traces/abc123def456" \
  -H "Authorization: Bearer <token>" \
  -H "X-Scope-OrgID: <tenant-id>"
```

Returns the full trace in OTLP JSON format with all spans and their attributes.

---

## Tag names

**Endpoint:** `GET https://euw1-01.t.xscalerlabs.com/api/search/tags`

Returns all indexed span and resource attribute names.

```bash
curl "https://euw1-01.t.xscalerlabs.com/api/search/tags" \
  -H "Authorization: Bearer <token>" \
  -H "X-Scope-OrgID: <tenant-id>"
```

Response:

```json
{
  "tagNames": [
    "http.method",
    "http.route",
    "http.status_code",
    "db.system",
    "service.name"
  ]
}
```

---

## Tag values

**Endpoint:** `GET https://euw1-01.t.xscalerlabs.com/api/search/tag/<tag>/values`

Returns all observed values for a given tag — useful for building search UIs or auto-completing queries.

```bash
curl "https://euw1-01.t.xscalerlabs.com/api/search/tag/service.name/values" \
  -H "Authorization: Bearer <token>" \
  -H "X-Scope-OrgID: <tenant-id>"
```

Response:

```json
{
  "tagValues": ["api", "worker", "payment-service", "notification-service"]
}
```
