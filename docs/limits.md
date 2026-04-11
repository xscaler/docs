---
id: limits
title: Limits & Quotas
sidebar_label: Limits & Quotas
slug: /limits
---

# Limits & Quotas

xScaler enforces per-tenant limits to ensure a stable, consistent experience for all users.

## Limits table

| Limit | Value |
|-------|-------|
| Max active series per tenant | Plan-dependent |
| Max labels per series | 30 |
| Max label name length | 1,024 characters |
| Max label value length | 2,048 characters |
| Max metric name length | 1,024 characters |
| Max samples per `remote_write` request | 2,000 |
| Query timeout | 2 minutes |

:::info Plan-dependent limits
Limits marked "Plan-dependent" vary by your subscription tier. Log in to the [xScaler dashboard](https://xscalerlabs.com) and navigate to **Settings → Limits** to see the exact values for your account.
:::

---

## Max samples per request

The ingest endpoint accepts a maximum of **2,000 samples per request**. This is reflected in the `queue_config.max_samples_per_send` setting in both Prometheus and Grafana Alloy configurations. The default value in those configs is already set to `2000` — do not raise it above this limit.

---

## Query timeout

All queries time out after **2 minutes**. If your query hits this limit:

1. Narrow the time range.
2. Increase the `step` value to reduce the number of data points evaluated.
3. Add label selectors to reduce the number of series scanned.
4. Break long aggregations into recording rules (see [Rules & Alerts](/rules-and-alerts)).

---

## Finding high-cardinality metrics

Unexpectedly high active series counts are usually caused by labels with unbounded values (user IDs, request IDs, session tokens). Use this query to identify the top offenders:

```bash
curl "https://euw1-01.m.xscalerlabs.com/prometheus/api/v1/query" \
  -H "Authorization: Bearer <token>" \
  -H "X-Scope-OrgID: <tenant-id>" \
  --data-urlencode 'query=topk(10, count by (__name__)({__name__=~".+"}))'
```

If a metric has a disproportionately high series count, review which labels are attached to it and remove any that contain unbounded values.

---

## Reducing ingest volume

If you are approaching your series limit, consider:

- **Drop unused metrics at the source** — use `write_relabel_configs` in Prometheus or Alloy to drop metrics before they leave the scrape host (see [Prometheus remote_write](/ingest/prometheus-remote-write#drop-noisy-metrics-before-sending)).
- **Aggregate before shipping** — use recording rules to pre-aggregate high-cardinality metrics and ship only the aggregated series.
- **Review label cardinality** — replace high-cardinality label values (e.g. pod IDs) with coarser ones (e.g. deployment name).
