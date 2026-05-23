---
id: overview
title: Log Querying Overview
sidebar_label: Overview
slug: /log-query/overview
---

# Log Querying Overview

xScaler exposes the **full LogQL HTTP API**, so any tool that speaks LogQL works without modification — Grafana, `logcli`, `curl`, and more.

## Base URL

```
https://euw1-01.l.xscalerlabs.com
```

All log query endpoints are relative to this base. Replace `euw1-01` with your [region](/regions).

## Required headers

Every query request must include both headers:

```http
Authorization: Bearer <token>
X-Scope-OrgID: <tenant-id>
```

A missing `X-Scope-OrgID` returns `400`. A missing or invalid `Authorization` returns `401`.

---

## API endpoints

| Operation | Method | Path |
|-----------|--------|------|
| [Instant query](/log-query/instant-query) | `GET` | `/api/v1/logs/query` |
| [Range query](/log-query/range-query) | `GET` | `/api/v1/logs/query_range` |
| [Label names](/log-query/label-exploration) | `GET` | `/api/v1/logs/labels` |
| [Label values](/log-query/label-exploration) | `GET` | `/api/v1/logs/label/<name>/values` |
| [Series](/log-query/label-exploration) | `GET` | `/api/v1/logs/series` |
| Tail (live) | `GET` (WebSocket) | `/api/v1/logs/tail` |

---

## LogQL quick reference

LogQL has two query types:

### Log queries — return log lines

```logql
# All logs from a job
{job="app"}

# Filter by string
{job="app"} |= "error"

# Filter by regex
{job="app"} |~ "timeout|refused"

# Exclude lines
{job="app"} != "health check"

# Parse JSON and filter on a field
{job="app"} | json | status >= 500

# Pattern match
{job="nginx"} | pattern `<ip> - - [<_>] "<method> <path> <_>" <status> <bytes>`
```

### Metric queries — compute aggregations over log streams

```logql
# Log rate per minute (lines/sec)
rate({job="app"}[5m])

# Error rate by service
sum by (service) (rate({job="app"} |= "error" [5m]))

# 99th percentile of a parsed duration field
quantile_over_time(0.99, {job="app"} | json | unwrap duration_ms [5m]) by (route)

# Count of log lines by level
sum by (level) (count_over_time({job="app"} | json [5m]))
```

---

## Response envelope

All log query responses use a consistent JSON structure:

```json
{
  "status": "success",
  "data": {
    "resultType": "streams",
    "result": [
      {
        "stream": { "job": "app", "level": "error" },
        "values": [
          ["1716300000000000000", "database connection failed host=db.internal"]
        ]
      }
    ]
  }
}
```

Timestamps in `values` are Unix nanoseconds as strings.

---

## Query timeout

Queries time out after **2 minutes**. Long-range queries over high-volume streams are most likely to hit this. Narrow the time range or add more specific stream selectors to reduce query cost.
