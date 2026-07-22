---
id: endpoints
title: Endpoints Reference
sidebar_label: Endpoints
slug: /endpoints
---

# Endpoints Reference

A complete reference of every ingest and query endpoint xScaler exposes, across
all three signals. For a walkthrough of connecting your first source, see the
[Quick Start](/getting-started).

:::info
Every request — both writes and reads, for all signals — must include the
`Authorization: Bearer <token>` and `X-Scope-OrgID: <tenant-id>` headers. See
[Authentication](/authentication) for details.
:::

## Sending data

### Metrics

| Method | Protocol | Endpoint |
|--------|----------|----------|
| Prometheus `remote_write` | HTTP | `POST /api/v1/push` |
| OpenTelemetry Collector | OTLP/HTTP | `POST /otlp/v1/metrics` |
| OpenTelemetry Collector | OTLP/gRPC | `:443` (TLS) |
| Grafana Alloy | HTTP (`remote_write`) | `POST /api/v1/push` |
| OTel SDK (Python / Node.js / Go) | OTLP/HTTP | `POST /otlp/v1/metrics` |

### Logs

| Method | Protocol | Endpoint |
|--------|----------|----------|
| Grafana Alloy | HTTP (push) | `POST /api/v1/push` |
| OpenTelemetry Collector | OTLP/HTTP | `POST /otlp/v1/logs` |
| OpenTelemetry Collector | OTLP/gRPC | `:443` (TLS) |
| OTel SDK (Python / Node.js / Go) | OTLP/HTTP | `POST /otlp/v1/logs` |

### Traces

| Method | Protocol | Endpoint |
|--------|----------|----------|
| OpenTelemetry Collector | OTLP/HTTP | `POST /otlp/v1/traces` |
| OpenTelemetry Collector | OTLP/gRPC | `:443` (TLS) |
| Grafana Alloy | OTLP/HTTP | `POST /otlp/v1/traces` |
| OTel SDK (Python / Node.js / Go) | OTLP/HTTP | `POST /otlp/v1/traces` |

## Querying data

| Signal | Query language | Base URL |
|--------|---------------|----------|
| Metrics | PromQL | `https://<region>.m.xscalerlabs.com` |
| Logs | LogQL | `https://<region>.l.xscalerlabs.com` |
| Traces | TraceQL | `https://<region>.t.xscalerlabs.com` |

See [Regions & Endpoints](/regions) for the full list of regional hostnames.
