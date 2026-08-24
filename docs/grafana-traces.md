---
id: grafana-traces
title: Traces in Grafana
sidebar_label: Grafana Datasource
slug: /grafana/traces
---

# Traces in Grafana

Connect Grafana to xScaler as a Tempo-compatible data source to explore and visualise distributed traces using TraceQL.

Works with **Grafana 9.1+**. Both self-hosted and Grafana Cloud.

---

## Step 1: Add a Tempo data source

1. In Grafana, navigate to **Connections → Data Sources**.
2. Click **Add new data source**.
3. Select **Tempo**.

---

## Step 2: Set the server URL

In the **URL** field, enter:

```
https://euw1-01.t.xscalerlabs.com
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
Data source connected and trace backend is ready.
```

---

## Exploring traces in Grafana

### Search by service and duration

1. Open **Explore** and select the Traces data source.
2. Use the **Search** tab to filter by service name, span name, tags, and duration.
3. Click any trace result to open the **flame graph** and **span details** view.

### TraceQL queries

Switch to the **TraceQL** tab to write structured queries:

```traceql
# All error spans from the API service
{ resource.service.name = "api" && status = error }

# Slow database calls
{ span.db.system = "postgresql" && duration > 200ms }

# Traces touching both frontend and payment service
{ resource.service.name = "frontend" } >> { resource.service.name = "payment-service" }
```

---

## Correlate traces with metrics and logs

With all three data sources configured, Grafana can link signals together:

### Trace to logs

In the Tempo data source settings, scroll to **Trace to logs** and configure:

| Field | Value |
|-------|-------|
| Data source | Your Logs data source |
| Tags | `service.name` |
| Filter by trace ID | Enabled |

This adds a **Logs** button on every span that jumps to the correlated log lines in the same time window.

### Trace to metrics

In the Tempo data source settings, scroll to **Trace to metrics** and configure:

| Field | Value |
|-------|-------|
| Data source | Your Metrics data source |
| Query | `rate(traces_spanmetrics_duration_bucket{service="$__span.service}[$__rate_interval])` |

This adds a **Metrics** button on spans that opens the related RED metrics panel.

---

## Monitor traces in the portal

The xScaler portal has a dedicated **Traces** section (marked **Beta**) for monitoring ingest health without leaving the portal.

### Traces → Overview tab

Go to **Traces** in the sidebar and open the **Overview** tab to see workspace-wide KPIs:

| KPI | Description |
|-----|-------------|
| **GB ingested · period** | Total bytes ingested in the current billing month |
| **Ingest rate** | Live bytes/s across all tenants |
| **Spans/s** | Spans being received per second |
| **DPT** | Spans per minute (data points for traces) |

The **Ingest and query load** chart lets you visualise throughput over time (1h to 90d). The right panel shows your **Monthly ingest quota** ring gauge and a **Throttle gauge** for the highest-utilisation tenant.

The bottom row shows **Top tenants by ingest**, **Discards by reason**, and **Query health**.

### Traces → Tenants tab

Click the **Tenants** tab to see per-tenant ingest rates and bytes ingested. Click a tenant name to open its detail page.

### Traces tenant detail page

The tenant detail page has two tabs:

- **Setup**. Write endpoint (OTLP/HTTP and gRPC), Tenant ID, and API keys.
- **Monitoring**. Live KPI cards (ingest rate, bytes ingested, retention), monthly ingest quota card, time-range charts for ingest rate, span rate, bytes ingested, discarded spans, and query traffic.

---

## Troubleshooting

**"Bad Gateway" on Save & Test**
- Verify the URL is `https://euw1-01.t.xscalerlabs.com` (no path suffix).
- Check both `Authorization` and `X-Scope-OrgID` are in the **HTTP Headers** section.

**No traces found**
- Confirm traces have been ingested. Use the **Search** tab with a wide time range and no filters.
- Check the time range picker. It must cover the period when traces were sent.

**"Forbidden" error**
- Your token may be `write`-scoped. Generate a `read` or `read+write` token: go to **Organization → Tenants** in the portal, open the tenant, and create a new API key in the **API keys** section.
