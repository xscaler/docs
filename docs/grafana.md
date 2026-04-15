---
id: grafana
title: Grafana Integration
sidebar_label: Grafana Integration
slug: /grafana
---

# Grafana Integration

Connect Grafana to xScaler as a Prometheus data source to visualise your metrics using PromQL.

Works with **Grafana 9+** — both self-hosted and Grafana Cloud.

---

## Step 1 — Add a Prometheus data source

1. In Grafana, navigate to **Connections → Data Sources**.
2. Click **Add new data source**.
3. Select **Prometheus**.

---

## Step 2 — Set the server URL

In the **Prometheus server URL** field, enter:

```
https://euw1-01.m.xscalerlabs.com
```

:::tip
Use the host root only — Grafana appends `/api/v1/query` automatically. Do not add any path suffix.
:::

---

## Step 3 — Add authentication headers

Scroll down to the **HTTP Headers** section and add two custom headers:

| Header Name | Header Value |
|-------------|-------------|
| `Authorization` | `Bearer <token>` |
| `X-Scope-OrgID` | `<tenant-id>` |

:::danger Do not use Basic Auth or the Authentication section
xScaler uses token-based authentication via the `Authorization: Bearer` header. Do **not** fill in the Basic Auth username/password fields or the Grafana Authentication section — use custom HTTP headers only as shown above.
:::

---

## Step 4 — Save & Test

Click **Save & Test**. A successful connection displays:

```
Data source is working
```

If you see an error, verify:
- The URL ends in `/prometheus`
- `Authorization` value is exactly `Bearer <token>` (capital B, space before token)
- `X-Scope-OrgID` value matches your tenant ID from the dashboard

---

## Starter PromQL queries

Copy these into a new Grafana panel to build your first service dashboard.

### Request rate by route

```promql
sum(rate(http_requests_total[5m])) by (route)
```

### p99 latency by route

```promql
histogram_quantile(0.99,
  sum(rate(http_request_duration_seconds_bucket[5m])) by (le, route)
)
```

### 5xx error rate

```promql
sum(rate(http_requests_total{status=~"5.."}[5m]))
/ sum(rate(http_requests_total[5m]))
```

### Queue depth

```promql
job_queue_depth
```

---

## Troubleshooting

**"Bad Gateway" on Save & Test**
- Verify the URL is `https://euw1-01.m.xscalerlabs.com` (HTTPS, host root only — no path suffix).
- Check that both `Authorization` and `X-Scope-OrgID` headers are in the **HTTP Headers** section, not the Authentication section.

**Empty results after connecting**
- Use [Explore](/query/instant-query) with query `up` to confirm the connection works.
- Check the time range selector — make sure it covers when your metrics were sent.

**"Forbidden" error**
- Your token may be `write`-scoped. Generate a `read` or `read+write` token from the xScaler dashboard.
