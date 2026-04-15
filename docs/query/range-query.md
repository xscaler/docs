---
id: range-query
title: Range Query
sidebar_label: Range Query
slug: /query/range-query
---

# Range Query

A range query evaluates a PromQL expression over a **time range** at regular intervals, returning a matrix of results suitable for graphing.

**Endpoint:** `GET https://euw1-01.m.xscalerlabs.com/api/v1/query_range`

---

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `query` | Yes | PromQL expression |
| `start` | Yes | Range start — RFC3339 or Unix timestamp |
| `end` | Yes | Range end — RFC3339 or Unix timestamp |
| `step` | Yes | Resolution step — duration string (e.g. `60s`, `5m`) or seconds as a float |
| `timeout` | No | Query timeout override. Maximum: `2m`. |

---

## Example

Request rate over a 1-hour window with 60-second resolution:

```bash
curl "https://euw1-01.m.xscalerlabs.com/api/v1/query_range" \
  -H "Authorization: Bearer <token>" \
  -H "X-Scope-OrgID: <tenant-id>" \
  --data-urlencode 'query=rate(http_requests_total[5m])' \
  --data-urlencode 'start=2024-01-01T00:00:00Z' \
  --data-urlencode 'end=2024-01-01T01:00:00Z' \
  --data-urlencode 'step=60'
```

---

## Response

```json
{
  "status": "success",
  "data": {
    "resultType": "matrix",
    "result": [
      {
        "metric": {
          "job": "api-server",
          "method": "GET"
        },
        "values": [
          [1704067200, "12.5"],
          [1704067260, "13.1"],
          [1704067320, "11.8"]
        ]
      }
    ]
  }
}
```

`values` is an array of `[timestamp, value_string]` pairs at each step interval.

---

## Choosing the right step

The step determines how many data points are returned and how much compute the query uses.

| Rule of thumb | Rationale |
|---------------|-----------|
| `step` ≥ scrape interval | Stepping finer than your scrape interval produces duplicate data points. |
| Aim for ≈ 200–400 data points per graph | `step = (end - start) / 300` is a good default for dashboards. |
| For rate functions, match the range to at least 4× the step | `rate(metric[5m])` works well with a step of `60s`–`90s`. |

### Example: 24-hour graph

```bash
# 24 hours / 300 points = 288s ≈ 5m step
--data-urlencode 'start=2024-01-01T00:00:00Z' \
--data-urlencode 'end=2024-01-02T00:00:00Z' \
--data-urlencode 'step=5m'
```

### Example: 7-day graph

```bash
# 7 days / 300 points ≈ 2016s ≈ 30m step
--data-urlencode 'start=2024-01-01T00:00:00Z' \
--data-urlencode 'end=2024-01-08T00:00:00Z' \
--data-urlencode 'step=30m'
```
