---
id: regions
title: Regions & Endpoints
sidebar_label: Regions & Endpoints
slug: /regions
---

# Regions & Endpoints

xScaler is deployed in geographically distributed regions. All traffic is **TLS-only** — there is no plaintext HTTP or gRPC option.

## Available regions

| Region ID | Location | Metrics base URL | Logs base URL |
|-----------|----------|-----------------|---------------|
| `euw1-01` | Europe West 1 | `euw1-01.m.xscalerlabs.com` | `euw1-01.l.xscalerlabs.com` |

:::info More regions coming soon
Additional regions are in the roadmap. Contact [support](https://xscalerlabs.com/support) if you need a specific region.
:::

---

## Endpoint reference

Replace `<region>` with your region ID (e.g. `euw1-01`) in every URL below.

### Metrics ingest

| Protocol | Endpoint |
|----------|----------|
| Prometheus `remote_write` (HTTP) | `POST https://<region>.m.xscalerlabs.com/api/v1/push` |
| OTLP/HTTP | `POST https://<region>.m.xscalerlabs.com/otlp/v1/metrics` |
| OTLP/gRPC | `<region>.m.xscalerlabs.com:443` (TLS, headers as gRPC metadata) |

### Logs ingest

| Protocol | Endpoint |
|----------|----------|
| Push (native) | `POST https://<region>.l.xscalerlabs.com/api/v1/logs/push` |
| OTLP/HTTP | `POST https://<region>.l.xscalerlabs.com/otlp/v1/logs` |

### Metrics query (Prometheus HTTP API)

| Operation | Endpoint |
|-----------|----------|
| Instant query | `GET https://<region>.m.xscalerlabs.com/api/v1/query` |
| Range query | `GET https://<region>.m.xscalerlabs.com/api/v1/query_range` |
| Label names | `GET https://<region>.m.xscalerlabs.com/api/v1/labels` |
| Label values | `GET https://<region>.m.xscalerlabs.com/api/v1/label/<name>/values` |
| Series | `POST https://<region>.m.xscalerlabs.com/api/v1/series` |
| Active alerts | `GET https://<region>.m.xscalerlabs.com/api/v1/alerts` |
| Rules list | `GET https://<region>.m.xscalerlabs.com/api/v1/rules` |

### Logs query (LogQL HTTP API)

| Operation | Endpoint |
|-----------|----------|
| Instant query | `GET https://<region>.l.xscalerlabs.com/api/v1/logs/query` |
| Range query | `GET https://<region>.l.xscalerlabs.com/api/v1/logs/query_range` |
| Label names | `GET https://<region>.l.xscalerlabs.com/api/v1/logs/labels` |
| Label values | `GET https://<region>.l.xscalerlabs.com/api/v1/logs/label/<name>/values` |
| Series | `GET https://<region>.l.xscalerlabs.com/api/v1/logs/series` |
| Live tail | `wss://<region>.l.xscalerlabs.com/api/v1/logs/tail` (WebSocket) |

### Grafana data source URLs

When configuring data sources in Grafana:

| Data source type | URL |
|-----------------|-----|
| Prometheus | `https://<region>.m.xscalerlabs.com` |
| Logs (LogQL-compatible) | `https://<region>.l.xscalerlabs.com` |

---

## TLS and ports

| Transport | Port | Notes |
|-----------|------|-------|
| HTTPS | `443` | All HTTP endpoints |
| gRPC over TLS | `443` | OTLP/gRPC ingest |

Self-signed certificates are **not** accepted. `insecure_skip_verify` should remain `false` in all client configurations.

---

## Substitution example

Using region `euw1-01`:

| Placeholder | Substituted value |
|-------------|------------------|
| `<region>.m.xscalerlabs.com` | `euw1-01.m.xscalerlabs.com` |
| `<region>.l.xscalerlabs.com` | `euw1-01.l.xscalerlabs.com` |
| Metrics ingest URL | `https://euw1-01.m.xscalerlabs.com/api/v1/push` |
| Logs ingest URL | `https://euw1-01.l.xscalerlabs.com/api/v1/logs/push` |
| Metrics query base URL | `https://euw1-01.m.xscalerlabs.com` |
| Logs query base URL | `https://euw1-01.l.xscalerlabs.com` |
