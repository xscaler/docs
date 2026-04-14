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

The **Overview** page (home) shows aggregate metrics across all tenants:

| Metric | What it tells you |
|--------|------------------|
| **Active series** | Total series being ingested across all tenants, with a per-tenant breakdown (pie chart) |
| **Queries/s** | 5-minute rolling query rate |
| **Avg latency** | Average query latency across the organisation |
| **Error rate** | Ingestion failure rate |
| **Scrape interval** | Organisation-wide aggregate scrape interval |

Use the **time range selector** (1h / 6h / 24h / 7d / 14d / 30d) to view trends over time.

Toggle the chart view between **Series**, **DPM** (data points per minute), and **Req/s**.

---

## Per-tenant usage

1. Go to **Tenants** in the sidebar.
2. Click a tenant name to open its detail page.

### Summary metrics

The top of the tenant detail page shows current values:

| Metric | Description |
|--------|-------------|
| **Active series** | Number of unique time series currently being ingested |
| **Samples/s** | Current ingestion rate in samples per second |
| **DPM** | Data points per minute |
| **Scrape interval** | Detected scrape interval for this tenant |
| **API keys** | Number of API keys associated with this tenant |
| **Query QPS** | Query requests per second |
| **Query avg latency** | Average query response time |
| **Query error rate** | Percentage of queries returning errors |

### Usage charts

Two charts show historical trends with time range tabs (1h / 6h / 24h / 7d):

**Ingestion chart** — toggle between:
- Series over time
- Samples per second
- DPM

**Query chart** — toggle between:
- Requests per second
- Error percentage
- Average latency

---

## Checking usage against your plan limit

Your plan defines the maximum number of **active series** allowed across all tenants combined.

| Plan | Series limit |
|------|-------------|
| Pro | 250,000 |
| Scale | 750,000 |
| Enterprise | Custom |

To check how close you are to the limit:

1. Go to **Overview** — the series usage chart shows total active series.
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
