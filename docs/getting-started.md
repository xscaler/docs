---
id: getting-started
title: Quick Start
sidebar_label: Quick Start
slug: /getting-started
---

# Quick Start

Three steps: check your credentials work, get data in, look at it.

## Prerequisites

Find these three values in the [xScaler portal](https://portal.xscalerlabs.com):

| Value | Where to find it | Description |
|-------|-----------------|-------------|
| **Region** | Shown in write endpoint URLs | e.g. `euw1-01` |
| **Tenant ID** | Organization → Tenants → click tenant | Your `X-Scope-OrgID` value |
| **API token** | Organization → Tenants → click tenant → API keys | Your `Authorization: Bearer` token |

See [Manage API tokens](/portal/api-tokens) for how to find or create a token.

:::warning[Both headers are required on every request]
Every request to xScaler, reads and writes across all signals, must include:

```
Authorization: Bearer <token>
X-Scope-OrgID: <tenant-id>
```

A missing or mismatched `X-Scope-OrgID` returns **401 Unauthorized** with
`x-scope-orgid mismatch`. A missing or invalid `Authorization` returns **401
Unauthorized** too.
:::

---

## Step 1: Verify connectivity

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

A `200` response with `"status": "success"` confirms authentication and
connectivity.

---

## Step 2: Send telemetry

Enroll the OpenTelemetry agent and the portal delivers its pipelines
over OpAMP. The rest of these docs assume that route. Everything else writes to
the same endpoints.

| Starting point | Do this |
|----------------|---------|
| **Nothing yet** | **[Enroll the OpenTelemetry agent](/fleet-management/enroll-agents)** |
| My own OpenTelemetry Collector | [Add the xScaler exporter](/ingest/opentelemetry-collector) |
| Prometheus | [Prometheus remote_write](/ingest/prometheus-remote-write) |
| Grafana Alloy | [Grafana Alloy](/ingest/grafana-alloy) |
| Python / Node.js / Go | [OTel SDKs](/ingest/otel-sdk-python) |
| Kubernetes, no code changes | [eBPF instrumentation](/fleet-management/ebpf-instrumentation) |

### Why the agent

The agent is a standard OpenTelemetry Collector. You write one `opamp`
extension block on the host, and after that every receiver, processor and
exporter arrives from the portal:

```yaml title="otel-collector-config.yaml"
# the only file you edit by hand
extensions:
  opamp:
    server:
      ws:
        endpoint: wss://agents.xscalerlabs.com/v1/opamp
        headers:
          Authorization: "Bearer <enrollment-token>"
```

The enrollment token is bootstrap only. The agent trades it for its own
credential on first connect. Then you assign config templates by label, so
adding a receiver to fifty hosts is one edit in the portal.

Full walkthrough: [Enroll agents](/fleet-management/enroll-agents).

### Per-signal guides

If you would rather wire one signal at a time:
[Metrics](/ingest/opentelemetry-collector) ·
[Logs](/logs/opentelemetry-collector) ·
[Traces](/traces/opentelemetry-collector)

---

## Step 3: Look at your data

Open **Insights** in the portal. Metrics, Logs and Traces each have their own
page, and the Explorer runs several queries at once. There is nothing to
connect.

| Page | Use it for |
|------|-----------|
| [Metrics](/insights/metrics) | Break a metric down by label |
| [Logs](/insights/logs) | Filter a stream, then open the trace a line belongs to |
| [Traces](/insights/traces) | Span waterfall, critical path, service graph |
| [Explorer](/insights/explorer) | Several queries at once, each with its own signal |
| [Dashboards](/insights/dashboards) | Build panels, or import Grafana JSON as-is |
| [Alerting](/insights/alerting) | Rules, contact points, notification policies |

### Or use your own Grafana

The Prometheus-, Loki- and Tempo-compatible APIs stay open, so existing
dashboards keep reading:

| Signal | Data source type | URL |
|--------|-----------------|-----|
| Metrics | Prometheus | `https://euw1-01.m.xscalerlabs.com` |
| Logs | Loki | `https://euw1-01.l.xscalerlabs.com` |
| Traces | Tempo | `https://euw1-01.t.xscalerlabs.com` |

Add `Authorization: Bearer <token>` and `X-Scope-OrgID: <tenant-id>` as custom
HTTP headers on each data source.

Full walkthrough: [Connect Grafana datasources](/grafana-datasources). To have
xScaler run the Grafana for you, see
[Managed Grafana](/platform/managed-grafana).

---

## Common errors

| Error | Cause | Fix |
|-------|-------|-----|
| `401 x-scope-orgid mismatch` | `X-Scope-OrgID` header missing or wrong tenant | Add `-H "X-Scope-OrgID: <tenant-id>"` with the tenant that matches your token |
| `401 Unauthorized` | Token missing or malformed | Check the format: `Bearer <token>`, capital B, one space |
| `403 Forbidden` | Token scope too narrow | Generate a read and write token from the portal |
| `404` on an OTLP write | A path was appended to the exporter endpoint | Set `endpoint` to the base host only. The exporter appends the path |

See [Troubleshooting](/troubleshooting) for a full symptom guide, or
[Agent troubleshooting](/fleet-management/troubleshooting) if the agent itself
is not reporting in.
