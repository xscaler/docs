---
id: label-exploration
title: Label Exploration
sidebar_label: Label Exploration
slug: /query/label-exploration
---

# Label Exploration

Use the labels, label values, and series endpoints to discover what metrics exist in your tenant namespace — useful for building dashboards or debugging cardinality issues.

:::warning Required headers
All requests need both headers:
```
Authorization: Bearer <token>
X-Scope-OrgID: <tenant-id>
```
:::

---

## List all label names

Returns every label key present across all series in your namespace.

```bash
curl "https://euw1-01.m.xscalerlabs.com/prometheus/api/v1/labels" \
  -H "Authorization: Bearer <token>" \
  -H "X-Scope-OrgID: <tenant-id>"
```

**Response:**

```json
{
  "status": "success",
  "data": ["__name__", "job", "instance", "method", "route", "status"]
}
```

---

## List values for a specific label

Returns all values for a given label key.

```bash
curl "https://euw1-01.m.xscalerlabs.com/prometheus/api/v1/label/job/values" \
  -H "Authorization: Bearer <token>" \
  -H "X-Scope-OrgID: <tenant-id>"
```

**Response:**

```json
{
  "status": "success",
  "data": ["api-server", "worker", "scheduler"]
}
```

Replace `job` in the URL path with any label name returned by the labels endpoint.

---

## Find series matching a selector

Use `POST /series` with a `match[]` selector to find all time series that match a given label set.

```bash
curl -X POST "https://euw1-01.m.xscalerlabs.com/prometheus/api/v1/series" \
  -H "Authorization: Bearer <token>" \
  -H "X-Scope-OrgID: <tenant-id>" \
  --data-urlencode 'match[]=http_requests_total{job="api-server"}'
```

**Response:**

```json
{
  "status": "success",
  "data": [
    {
      "__name__": "http_requests_total",
      "job": "api-server",
      "method": "GET",
      "status": "200"
    },
    {
      "__name__": "http_requests_total",
      "job": "api-server",
      "method": "POST",
      "status": "201"
    }
  ]
}
```

---

## Limit results by time range

Both `/labels` and `/series` accept optional `start` and `end` parameters to restrict results to a time range:

```bash
curl "https://euw1-01.m.xscalerlabs.com/prometheus/api/v1/labels" \
  -H "Authorization: Bearer <token>" \
  -H "X-Scope-OrgID: <tenant-id>" \
  --data-urlencode 'start=2024-01-01T00:00:00Z' \
  --data-urlencode 'end=2024-01-02T00:00:00Z'
```

---

## Find high-cardinality metrics

High cardinality — too many unique label value combinations — is a common cause of performance issues. Use this query to identify the top offenders:

```bash
curl "https://euw1-01.m.xscalerlabs.com/prometheus/api/v1/query" \
  -H "Authorization: Bearer <token>" \
  -H "X-Scope-OrgID: <tenant-id>" \
  --data-urlencode 'query=topk(10, count by (__name__)({__name__=~".+"}))'
```

This returns the 10 metric names with the highest number of active time series. If any metric has unexpectedly high cardinality, review which labels are being attached and whether all their values are truly necessary.
