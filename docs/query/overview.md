---
id: overview
title: Querying Overview
sidebar_label: Overview
slug: /query/overview
---

# Querying Overview

xScaler exposes the **full Prometheus HTTP API**, so any tool that speaks PromQL works without modification — Grafana, custom dashboards, `curl`, and more.

## Base URL

```
https://euw1-01.m.xscalerlabs.com/prometheus
```

All query endpoints are relative to this base. Replace `euw1-01` with your [region](/regions).

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
| [Instant query](/query/instant-query) | `GET` | `/prometheus/api/v1/query` |
| [Range query](/query/range-query) | `GET` | `/prometheus/api/v1/query_range` |
| [Label names](/query/label-exploration) | `GET` | `/prometheus/api/v1/labels` |
| [Label values](/query/label-exploration) | `GET` | `/prometheus/api/v1/label/<name>/values` |
| [Series search](/query/label-exploration) | `POST` | `/prometheus/api/v1/series` |
| Active alerts | `GET` | `/prometheus/api/v1/alerts` |
| Rules list | `GET` | `/prometheus/api/v1/rules` |

---

## Response envelope

All Prometheus API responses use the same JSON envelope:

```json
{
  "status": "success",
  "data": {
    "resultType": "vector",
    "result": [...]
  }
}
```

On error:

```json
{
  "status": "error",
  "errorType": "bad_data",
  "error": "invalid parameter 'query': ..."
}
```

---

## Query timeout

Queries time out after **2 minutes**. Long-running queries over large time ranges with fine step resolution are most likely to hit this limit. Increase the step or narrow the time range to reduce query cost.

---

## PromQL quick reference

| Pattern | What it computes |
|---------|-----------------|
| `rate(metric[5m])` | Per-second rate over a 5-minute window |
| `sum(metric) by (label)` | Aggregate across all series, grouped by a label |
| `histogram_quantile(0.99, sum(rate(metric_bucket[5m])) by (le))` | 99th-percentile latency from a histogram |
| `topk(10, metric)` | Top 10 series by value |
| `count by (__name__)({__name__=~".+"})` | Series count per metric name |
