---
id: getting-started
title: Quick Start
sidebar_label: Quick Start
slug: /getting-started
---

# Quick Start

Get metrics flowing into xScaler in three steps.

## Prerequisites

Before you begin, locate the following in your **xScaler dashboard → Settings → API Tokens**:

| Value | Description |
|-------|-------------|
| **Region endpoint** | e.g. `euw1-01.m.xscalerlabs.com` |
| **Tenant ID** | Your `X-Scope-OrgID` value |
| **API token** | Your `Authorization: Bearer` token |

:::warning Both headers are required on every request
Every request to xScaler — reads and writes — must include:

```
Authorization: Bearer <token>
X-Scope-OrgID: <tenant-id>
```

If `X-Scope-OrgID` is missing, the backend returns **400 Bad Request** ("no org id"). If `Authorization` is missing or invalid, it returns **401 Unauthorized**.
:::

---

## Step 1 — Verify connectivity

Send a test query to confirm your credentials and endpoint work:

```bash
curl "https://euw1-01.m.xscalerlabs.com/prometheus/api/v1/query" \
  -H "Authorization: Bearer <token>" \
  -H "X-Scope-OrgID: <tenant-id>" \
  --data-urlencode 'query=up'
```

A successful response looks like:

```json
{
  "status": "success",
  "data": {
    "resultType": "vector",
    "result": []
  }
}
```

An empty `result` array is expected if you haven't sent any metrics yet — it means authentication succeeded and your tenant namespace is reachable.

---

## Step 2 — Choose your ingest method

Pick the method that matches your stack:

| I use… | Guide |
|--------|-------|
| Prometheus | [Prometheus remote_write](/ingest/prometheus-remote-write) |
| Grafana Alloy | [Grafana Alloy](/ingest/grafana-alloy) |
| OpenTelemetry Collector | [OpenTelemetry Collector](/ingest/opentelemetry-collector) |
| Python application | [OTel SDK — Python](/ingest/otel-sdk-python) |
| Node.js application | [OTel SDK — Node.js](/ingest/otel-sdk-nodejs) |
| Go application | [OTel SDK — Go](/ingest/otel-sdk-go) |

---

## Step 3 — Connect Grafana

Once metrics are flowing, visualise them in Grafana:

- Set the **Prometheus server URL** to `https://euw1-01.m.xscalerlabs.com/prometheus`
- Add `Authorization: Bearer <token>` and `X-Scope-OrgID: <tenant-id>` as custom HTTP headers

See the full walkthrough in [Grafana Integration](/grafana).

---

## Common errors

| Error | Cause | Fix |
|-------|-------|-----|
| `400 no org id` | `X-Scope-OrgID` header missing | Add `-H "X-Scope-OrgID: <tenant-id>"` |
| `401 Unauthorized` | Token missing or malformed | Check format: `Bearer <token>` (capital B, space) |
| `403 Forbidden` | Token scope too narrow | Generate a read+write token from the dashboard |

See [Troubleshooting](/troubleshooting) for a full symptom guide.
