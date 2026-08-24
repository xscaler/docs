---
id: grafana-logs
title: Logs in Grafana
sidebar_label: Grafana Datasource
slug: /grafana/logs
---

# Logs in Grafana

Connect Grafana to xScaler as a Loki-compatible data source to explore and visualise your logs using LogQL.

Works with **Grafana 9+**. Both self-hosted and Grafana Cloud.

---

## Step 1: Add a Loki data source

1. In Grafana, navigate to **Connections → Data Sources**.
2. Click **Add new data source**.
3. Select **Loki**.

---

## Step 2: Set the server URL

In the **URL** field, enter:

```
https://euw1-01.l.xscalerlabs.com
```

:::tip
Use the host root only. Grafana appends query paths automatically. Do not add any path suffix.
:::

---

## Step 3: Add authentication headers

Scroll down to the **HTTP Headers** section and add two custom headers:

| Header Name | Header Value |
|-------------|-------------|
| `Authorization` | `Bearer <token>` |
| `X-Scope-OrgID` | `<tenant-id>` |

:::danger Do not use Basic Auth or the Authentication section
xScaler uses token-based authentication via the `Authorization: Bearer` header. Do **not** fill in the Basic Auth username/password fields. Use custom HTTP headers only as shown above.
:::

---

## Step 4: Save & Test

Click **Save & Test**. A successful connection displays:

```
Data source connected and labels found.
```

If you see an error, verify:
- The URL is `https://euw1-01.l.xscalerlabs.com` (no path suffix)
- `Authorization` value is exactly `Bearer <token>` (capital B, space before token)
- `X-Scope-OrgID` value matches your tenant ID

---

## Exploring logs in Grafana

### Browse by label

1. Open **Explore** and select the Logs data source.
2. Use the **Label browser** to pick a `job` or `service` label.
3. Grafana generates the stream selector automatically: `{job="app"}`.

### Filter and search

```logql
# Lines containing a string
{job="app"} |= "error"

# Parse JSON and filter on a field
{job="api"} | json | status >= 500

# Parse logfmt
{job="worker"} | logfmt | level="error"

# Regex match
{job="app"} |~ "timeout|refused"
```

### Log volume panel

Add a **Logs** panel or a **Time series** panel with a metric query to visualise log volume over time:

```logql
# Log lines per second by job
sum by (job) (rate({job=~".+"}[5m]))

# Error rate
sum by (service) (rate({job="app"} |= "error" [5m]))
```

### Live tail

In **Explore**, enable the **Live** toggle to stream new log lines as they arrive.

---

## Correlating logs and metrics

With both the Prometheus (metrics) and Loki (logs) data sources configured, you can use **Grafana Correlations** to jump from a metric spike directly to the related log lines.

1. Navigate to **Administration → Correlations**.
2. Create a correlation from the Prometheus data source to the Loki data source.
3. Set the target query to `{job="${job}"}` and map the `job` label from the metric series.

---

## Troubleshooting

**"Bad Gateway" on Save & Test**
- Verify the URL is `https://euw1-01.l.xscalerlabs.com` (HTTPS, host root only, no path suffix).
- Check both `Authorization` and `X-Scope-OrgID` are in the **HTTP Headers** section.

**"Data source connected" but no labels**
- No logs have been ingested yet for this tenant. Send some logs first using [Grafana Alloy](/logs/grafana-alloy) or the [OTel Collector](/logs/opentelemetry-collector).
- Check the time range. The label browser only shows labels active within the selected window.

**"Forbidden" error**
- Your token may be `write`-scoped. Generate a `read` or `read+write` token from the xScaler portal.

**"X-Scope-OrgID" error in query**
- The `X-Scope-OrgID` header must be set in the data source HTTP Headers, not in the query itself.
