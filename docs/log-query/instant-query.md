---
id: instant-query
title: Log Instant Query
sidebar_label: Instant Query
slug: /log-query/instant-query
---

# Log Instant Query

An instant log query evaluates a LogQL expression at a **single point in time** and returns a vector of log streams or metric values.

**Endpoint:** `GET https://euw1-01.l.xscalerlabs.com/api/v1/query`

---

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `query` | Yes | LogQL expression |
| `limit` | No | Maximum number of log lines to return. Default: `100`. |
| `time` | No | RFC3339 or Unix timestamp. Defaults to now. |
| `direction` | No | `forward` or `backward` (default). |
| `timeout` | No | Query timeout override. Maximum: `2m`. |

---

## Examples

### Fetch recent error logs

```bash
curl "https://euw1-01.l.xscalerlabs.com/api/v1/query" \
  -H "Authorization: Bearer <token>" \
  -H "X-Scope-OrgID: <tenant-id>" \
  --data-urlencode 'query={job="app"} |= "error"' \
  --data-urlencode 'limit=50'
```

### Parse JSON logs and filter on a field

```bash
curl "https://euw1-01.l.xscalerlabs.com/api/v1/query" \
  -H "Authorization: Bearer <token>" \
  -H "X-Scope-OrgID: <tenant-id>" \
  --data-urlencode 'query={job="api"} | json | status >= 500' \
  --data-urlencode 'limit=100'
```

### Metric query: current error rate

```bash
curl "https://euw1-01.l.xscalerlabs.com/api/v1/query" \
  -H "Authorization: Bearer <token>" \
  -H "X-Scope-OrgID: <tenant-id>" \
  --data-urlencode 'query=sum by (service) (rate({job="app"} |= "error" [5m]))'
```

---

## Response: log streams

When the query returns log lines (`resultType: "streams"`):

```json
{
  "status": "success",
  "data": {
    "resultType": "streams",
    "result": [
      {
        "stream": { "job": "app", "level": "error", "host": "web-01" },
        "values": [
          ["1716300123000000000", "database connection failed host=db.internal"],
          ["1716300456000000000", "timeout waiting for upstream"]
        ]
      }
    ]
  }
}
```

Each entry in `values` is a `[nanosecond_timestamp, log_line]` pair. Timestamps are Unix nanoseconds as strings.

## Response: metric vector

When the query is a metric expression (`resultType: "vector"`):

```json
{
  "status": "success",
  "data": {
    "resultType": "vector",
    "result": [
      {
        "metric": { "service": "api" },
        "value": [1716300000, "3.14"]
      }
    ]
  }
}
```

---

## Common LogQL patterns

```logql
# All logs from a job
{job="app"}

# Multiple label filters
{job="app", env="production"}

# Contains a string
{job="app"} |= "error"

# Matches a regex
{job="app"} |~ "timeout|connection refused"

# Parse JSON, filter on status field
{job="api"} | json | status >= 500

# Parse logfmt
{job="worker"} | logfmt | level="error"
```
