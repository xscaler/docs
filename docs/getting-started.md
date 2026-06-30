---
id: getting-started
title: Quick Start
sidebar_label: Quick Start
slug: /getting-started
---

# Quick Start

Get telemetry flowing into xScaler in a few steps. xScaler accepts **metrics, logs, and traces** — start with whichever signal matters most to you.

## Prerequisites

Before you begin, locate the following in your **xScaler portal**:

| Value | Where to find it | Description |
|-------|-----------------|-------------|
| **Region** | Shown in write endpoint URLs | e.g. `euw1-01` |
| **Tenant ID** | Organization → Tenants → click tenant | Your `X-Scope-OrgID` value |
| **API token** | Organization → Tenants → click tenant → API keys | Your `Authorization: Bearer` token |

See [Manage API Tokens](/portal/api-tokens) for step-by-step instructions on finding or creating a token.

:::warning Both headers are required on every request
Every request to xScaler — reads and writes, all signals — must include:

```
Authorization: Bearer <token>
X-Scope-OrgID: <tenant-id>
```

If `X-Scope-OrgID` is missing, the backend returns **400 Bad Request** ("no org id"). If `Authorization` is missing or invalid, it returns **401 Unauthorized**.
:::

---

## Step 1 — Verify connectivity

Send a test query to confirm your credentials work:

```bash
# Metrics
curl "https://euw1-01.m.xscalerlabs.com/api/v1/query" \
  -H "Authorization: Bearer <token>" \
  -H "X-Scope-OrgID: <tenant-id>" \
  --data-urlencode 'query=up'

# Logs
curl "https://euw1-01.l.xscalerlabs.com/api/v1/labels" \
  -H "Authorization: Bearer <token>" \
  -H "X-Scope-OrgID: <tenant-id>"
```

A `200` response with `"status": "success"` confirms authentication and connectivity.

---

## Step 2 — Send telemetry

### Metrics

| I use… | Guide |
|--------|-------|
| Prometheus | [Prometheus remote_write](/ingest/prometheus-remote-write) |
| Grafana Alloy | [Grafana Alloy](/ingest/grafana-alloy) |
| OpenTelemetry Collector | [OpenTelemetry Collector](/ingest/opentelemetry-collector) |
| Python / Node.js / Go | [OTel SDKs](/ingest/otel-sdk-python) |

### Logs

| I use… | Guide |
|--------|-------|
| Grafana Alloy | [Grafana Alloy](/logs/grafana-alloy) |
| OpenTelemetry Collector | [OpenTelemetry Collector](/logs/opentelemetry-collector) |
| Python / Node.js / Go | [OTel SDKs](/logs/otel-sdk-python) |

### Traces

| I use… | Guide |
|--------|-------|
| Grafana Alloy | [Grafana Alloy](/traces/grafana-alloy) |
| OpenTelemetry Collector | [OpenTelemetry Collector](/traces/opentelemetry-collector) |
| Python / Node.js / Go | [OTel SDKs](/traces/otel-sdk-python) |

---

## Step 3 — Connect Grafana

Once telemetry is flowing, visualise it in Grafana:

| Signal | Data source type | URL |
|--------|-----------------|-----|
| Metrics | Prometheus | `https://euw1-01.m.xscalerlabs.com` |
| Logs | Loki | `https://euw1-01.l.xscalerlabs.com` |
| Traces | Tempo | `https://euw1-01.t.xscalerlabs.com` |

Add `Authorization: Bearer <token>` and `X-Scope-OrgID: <tenant-id>` as custom HTTP headers on each data source.

See the full walkthrough: [Metrics](/grafana/metrics) · [Logs](/grafana/logs) · [Traces](/grafana/traces)

---

## Common errors

| Error | Cause | Fix |
|-------|-------|-----|
| `400 no org id` | `X-Scope-OrgID` header missing | Add `-H "X-Scope-OrgID: <tenant-id>"` |
| `401 Unauthorized` | Token missing or malformed | Check format: `Bearer <token>` (capital B, space) |
| `403 Forbidden` | Token scope too narrow | Generate a read+write token from the portal |

See [Troubleshooting](/troubleshooting) for a full symptom guide.
