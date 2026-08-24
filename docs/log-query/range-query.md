---
id: range-query
title: Log Range Query
sidebar_label: Range Query
slug: /log-query/range-query
---

# Log Range Query

A log range query evaluates a LogQL expression over a **time range**, returning log streams or a metric matrix suitable for graphing.

**Endpoint:** `GET https://euw1-01.l.xscalerlabs.com/api/v1/query_range`

---

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `query` | Yes | LogQL expression |
| `start` | Yes | Range start: RFC3339 or Unix timestamp |
| `end` | Yes | Range end: RFC3339 or Unix timestamp |
| `limit` | No | Maximum log lines for log queries. Default: `100`. |
| `step` | No | Resolution step for metric queries: e.g. `60s`, `5m`. |
| `direction` | No | `forward` or `backward` (default) for log queries. |
| `timeout` | No | Query timeout override. Maximum: `2m`. |

---

## Examples

### Fetch logs over a time window

```bash
curl "https://euw1-01.l.xscalerlabs.com/api/v1/query_range" \
  -H "Authorization: Bearer <token>" \
  -H "X-Scope-OrgID: <tenant-id>" \
  --data-urlencode 'query={job="app"} |= "error"' \
  --data-urlencode 'start=2024-01-01T00:00:00Z' \
  --data-urlencode 'end=2024-01-01T01:00:00Z' \
  --data-urlencode 'limit=200' \
  --data-urlencode 'direction=forward'
```

### Error rate over the last hour (metric query)

```bash
curl "https://euw1-01.l.xscalerlabs.com/api/v1/query_range" \
  -H "Authorization: Bearer <token>" \
  -H "X-Scope-OrgID: <tenant-id>" \
  --data-urlencode 'query=sum by (service) (rate({job="app"} |= "error" [5m]))' \
  --data-urlencode 'start=2024-01-01T00:00:00Z' \
  --data-urlencode 'end=2024-01-01T01:00:00Z' \
  --data-urlencode 'step=60s'
```

### Log volume by level over 24 hours

```bash
curl "https://euw1-01.l.xscalerlabs.com/api/v1/query_range" \
  -H "Authorization: Bearer <token>" \
  -H "X-Scope-OrgID: <tenant-id>" \
  --data-urlencode 'query=sum by (level) (count_over_time({job="app"} | json [5m]))' \
  --data-urlencode 'start=2024-01-01T00:00:00Z' \
  --data-urlencode 'end=2024-01-02T00:00:00Z' \
  --data-urlencode 'step=5m'
```

---

## Response: log streams

```json
{
  "status": "success",
  "data": {
    "resultType": "streams",
    "result": [
      {
        "stream": { "job": "app", "level": "error" },
        "values": [
          ["1716300123000000000", "database connection failed"],
          ["1716300456000000000", "timeout waiting for upstream"]
        ]
      }
    ]
  }
}
```

## Response: metric matrix

```json
{
  "status": "success",
  "data": {
    "resultType": "matrix",
    "result": [
      {
        "metric": { "service": "api" },
        "values": [
          [1704067200, "1.2"],
          [1704067260, "2.8"],
          [1704067320, "0.9"]
        ]
      }
    ]
  }
}
```

---

## Choosing the right step

| Rule of thumb | Rationale |
|---------------|-----------|
| Aim for 200-400 data points per graph | `step = (end - start) / 300` is a good default. |
| Match the range to at least 4× the step | `rate({...}[5m])` works well with a step of `60s` to `90s`. |
| Wider step = faster query | For long time ranges, increase step to reduce query cost. |

### Example: 24-hour graph

```bash
# 24 hours / 300 points = 288s ≈ 5m step
--data-urlencode 'step=5m'
```

### Example: 7-day graph

```bash
# 7 days / 300 points ≈ 2016s ≈ 30m step
--data-urlencode 'step=30m'
```
