---
id: instant-query
title: Instant Query
sidebar_label: Instant Query
slug: /query/instant-query
---

# Instant Query

An instant query evaluates a PromQL expression at a **single point in time** and returns a vector of results — one value per matching time series.

**Endpoint:** `GET https://euw1-01.m.xscalerlabs.com/api/v1/query`

---

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `query` | Yes | PromQL expression |
| `time` | No | RFC3339 or Unix timestamp. Defaults to now. |
| `timeout` | No | Query timeout override. Maximum: `2m`. |

---

## Examples

### Request rate

```bash
curl "https://euw1-01.m.xscalerlabs.com/api/v1/query" \
  -H "Authorization: Bearer <token>" \
  -H "X-Scope-OrgID: <tenant-id>" \
  --data-urlencode 'query=rate(http_requests_total[5m])'
```

### Error rate percentage

```bash
curl "https://euw1-01.m.xscalerlabs.com/api/v1/query" \
  -H "Authorization: Bearer <token>" \
  -H "X-Scope-OrgID: <tenant-id>" \
  --data-urlencode 'query=sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) * 100'
```

### Query at a specific timestamp

```bash
curl "https://euw1-01.m.xscalerlabs.com/api/v1/query" \
  -H "Authorization: Bearer <token>" \
  -H "X-Scope-OrgID: <tenant-id>" \
  --data-urlencode 'query=up' \
  --data-urlencode 'time=2024-06-01T12:00:00Z'
```

---

## Response

```json
{
  "status": "success",
  "data": {
    "resultType": "vector",
    "result": [
      {
        "metric": {
          "__name__": "http_requests_total",
          "job": "api-server",
          "method": "GET",
          "status": "200"
        },
        "value": [
          1704067200,
          "42.3"
        ]
      }
    ]
  }
}
```

Each entry in `result` contains:
- `metric` — the label set identifying the series
- `value` — a `[timestamp, value_string]` tuple (value is always a string, even for numbers)

---

## Common PromQL patterns

```promql
# All up instances
up

# Rate of requests over the last 5 minutes
rate(http_requests_total[5m])

# 5xx error rate as a fraction
sum(rate(http_requests_total{status=~"5.."}[5m]))
/ sum(rate(http_requests_total[5m]))

# p99 latency from histogram
histogram_quantile(0.99,
  sum(rate(http_request_duration_seconds_bucket[5m])) by (le)
)
```
