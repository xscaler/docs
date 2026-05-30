---
id: tenant-usage
title: Check Tenant Usage
sidebar_label: Check Tenant Usage
slug: /portal/tenant-usage
---

# Check Tenant Usage

The portal shows real-time and historical usage metrics for every tenant. Use these to track series growth, spot ingestion errors, and monitor query load.

---

## Organisation-wide usage

Each signal section (**Metrics**, **Logs**, **Traces**) has an **Overview** tab that shows live aggregate metrics across all tenants. Use the **time range selector** (1h / 6h / 24h / 7d / 14d / 30d / 60d / 90d) to view trends over time.

### Metrics Overview

| Metric | What it tells you |
|--------|------------------|
| **Active series** | Total series being ingested across all tenants |
| **DPM** | Datapoints per minute, workspace total |
| **Query QPS** | 5-minute rolling query request rate |
| **Scrape interval** | Weighted-average scrape interval across all tenants |

Toggle the chart view between **Series**, **DPM**, and **Req/s**.

The right panel shows **Series capacity** (ring gauge of active series vs your plan limit) and a **Live throttle gauge** showing the highest-utilisation tenant relative to its per-tenant cap.

The bottom row shows **Top tenants by active series**, **Discards by reason**, and **Query health**.

### Logs Overview

| Metric | What it tells you |
|--------|------------------|
| **GB ingested · period** | Total bytes ingested in the current billing month |
| **Ingest rate** | Live ingest rate across all tenants (MB/s) |
| **Lines/s** | Log lines per second, live |
| **DPL** | Log bytes per minute (auto-scaled to KiB/MiB) |

Toggle the chart view between the available throughput signals.

The right panel shows **Monthly ingest quota** (ring gauge of GB used vs your plan cap) and a **Throttle gauge** showing the highest-utilisation tenant relative to the runtime rate limit.

The bottom row shows **Top tenants**, **Discards by reason**, and **Query health**.

### Traces Overview

| Metric | What it tells you |
|--------|------------------|
| **GB ingested · period** | Total bytes ingested in the current billing month |
| **Ingest rate** | Live ingest rate across all tenants (MB/s) |
| **Spans/s** | Spans per second, live |
| **DPT** | Spans per minute (k/M abbreviated) |

Toggle the chart view between the available throughput signals.

The right panel and bottom row follow the same layout as Logs (quota ring, throttle gauge, top tenants, discards, query health).

---

## Per-tenant usage

Each signal section has its own tenant detail page. To open one:

1. Go to **Metrics**, **Logs**, or **Traces** in the sidebar.
2. Click the **Tenants** tab.
3. Click a tenant name to open its detail page.

Each detail page has two tabs: **Setup** (credentials and write endpoint) and **Monitoring** (live stats and usage charts).

### Metrics tenant — summary stats

| Metric | Description |
|--------|-------------|
| **Active series** | Unique time series currently being ingested |
| **Samples/s** | Current ingestion rate in samples per second |
| **DPM** | Data points per minute |
| **Scrape interval** | Detected scrape interval for this tenant |
| **Query QPS** | Query requests per second |
| **Query avg latency** | Average query response time |
| **Query error rate** | Percentage of queries returning errors |

Charts show historical trends with a time range selector (1h / 6h / 24h / 7d). Toggle between **Series**, **DPM**, and **Req/s** for ingestion; toggle between **QPS**, **Error %**, and **Latency** for query health.

### Logs tenant — summary stats

| Metric | Description |
|--------|-------------|
| **Ingest rate** | Live bytes per second across all log streams |
| **Lines/s** | Log lines being ingested per second |
| **GB ingested** | Total bytes ingested in the current billing period |

Charts show ingest rate and lines/s over time with a time range selector (1h / 6h / 24h / 7d).

### Traces tenant — summary stats

| Metric | Description |
|--------|-------------|
| **Ingest rate** | Live bytes per second |
| **Spans/s** | Spans being ingested per second |
| **GB ingested** | Total bytes ingested in the current billing period |

Charts show bytes/s, spans/s, bytes ingested, discards, and query RPS with a time range selector (1h / 6h / 24h / 7d).

---

## Checking usage against your plan limit

Your plan defines the maximum number of **active series** allowed across all tenants combined.

| Plan | Series limit |
|------|-------------|
| Pro | 250,000 |
| Scale | 750,000 |
| Enterprise | Custom |

To check how close you are to the limit:

1. Go to **Metrics → Overview** — the **Series capacity** ring gauge and progress bar show total active series vs your plan limit.
2. A warning notification appears in the portal when you approach your limit (configurable in [Notification preferences](/portal/notifications)).
3. If you exceed the limit, new series are throttled. The tenant's health badge changes to **Needs attention**.

If you are consistently near or at your limit, consider [upgrading your plan](/portal/change-plan).

---

## Health status

Each tenant shows a health badge:

| Badge | Meaning |
|-------|---------|
| **Healthy** | Ingestion and queries operating normally |
| **Needs attention** | Series throttling active, elevated error rate, or scrape interval throttled |

A tenant in **Needs attention** state also generates a notification visible in the portal header. Check the [Activity log](/portal/activity) for the triggering event.
