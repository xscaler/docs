---
id: label-exploration
title: Log Label Exploration
sidebar_label: Label Exploration
slug: /log-query/label-exploration
---

# Log Label Exploration

Discover available log streams, label names, and label values before writing a query.

---

## Label names

**Endpoint:** `GET https://euw1-01.l.xscalerlabs.com/api/v1/labels`

Returns all label names present across your log streams.

```bash
curl "https://euw1-01.l.xscalerlabs.com/api/v1/labels" \
  -H "Authorization: Bearer <token>" \
  -H "X-Scope-OrgID: <tenant-id>"
```

Response:

```json
{
  "status": "success",
  "data": ["env", "host", "job", "level", "service"]
}
```

### Scoped to a time range

```bash
curl "https://euw1-01.l.xscalerlabs.com/api/v1/labels" \
  -H "Authorization: Bearer <token>" \
  -H "X-Scope-OrgID: <tenant-id>" \
  --data-urlencode 'start=2024-01-01T00:00:00Z' \
  --data-urlencode 'end=2024-01-01T01:00:00Z'
```

---

## Label values

**Endpoint:** `GET https://euw1-01.l.xscalerlabs.com/api/v1/label/<name>/values`

Returns all values for a given label name.

```bash
curl "https://euw1-01.l.xscalerlabs.com/api/v1/label/job/values" \
  -H "Authorization: Bearer <token>" \
  -H "X-Scope-OrgID: <tenant-id>"
```

Response:

```json
{
  "status": "success",
  "data": ["api", "app", "nginx", "worker"]
}
```

---

## Series

**Endpoint:** `GET https://euw1-01.l.xscalerlabs.com/api/v1/series`

Returns all log stream label sets matching a selector, so you can see which streams exist before querying them.

```bash
curl "https://euw1-01.l.xscalerlabs.com/api/v1/series" \
  -H "Authorization: Bearer <token>" \
  -H "X-Scope-OrgID: <tenant-id>" \
  --data-urlencode 'match[]={job="app"}' \
  --data-urlencode 'start=2024-01-01T00:00:00Z' \
  --data-urlencode 'end=2024-01-01T01:00:00Z'
```

Response:

```json
{
  "status": "success",
  "data": [
    { "job": "app", "env": "production", "host": "web-01" },
    { "job": "app", "env": "production", "host": "web-02" },
    { "job": "app", "env": "staging",    "host": "web-stg-01" }
  ]
}
```

---

## Live tail

**Endpoint:** `GET wss://euw1-01.l.xscalerlabs.com/api/v1/tail` (WebSocket)

Stream log lines as they arrive.

```bash
# Using websocat
websocat \
  -H "Authorization: Bearer <token>" \
  -H "X-Scope-OrgID: <tenant-id>" \
  "wss://euw1-01.l.xscalerlabs.com/api/v1/tail?query={job=%22app%22}&limit=10"
```

Each message is a JSON object with a `streams` array containing the new log entries.
