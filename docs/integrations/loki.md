---
id: loki
title: Grafana Loki
sidebar_label: Grafana Loki
slug: /integrations/loki
---

# Grafana Loki

Monitor Grafana Loki — ingestion throughput, query latency, chunk storage, and ingester health — using Loki's built-in Prometheus metrics endpoint.

**Pattern:** Loki /metrics → Prometheus scrape → xScaler `remote_write`

---

## Prerequisites

- Grafana Loki 2.x+
- xScaler tenant credentials (token + tenant ID)

---

## Option A — Prometheus

Loki exposes metrics at `:3100/metrics` by default.

```yaml
scrape_configs:
  - job_name: loki
    static_configs:
      - targets: ['localhost:3100']

remote_write:
  - url: https://euw1-01.m.xscalerlabs.com/api/v1/push
    authorization:
      credentials: <token>
    headers:
      X-Scope-OrgID: <tenant-id>
```

---

## Option B — Grafana Alloy

```river
prometheus.scrape "loki" {
  targets    = [{"__address__" = "localhost:3100"}]
  forward_to = [prometheus.remote_write.xscaler.receiver]
}

prometheus.remote_write "xscaler" {
  endpoint {
    url = "https://euw1-01.m.xscalerlabs.com/api/v1/push"
    authorization {
      type        = "Bearer"
      credentials = "<token>"
    }
    headers = { "X-Scope-OrgID" = "<tenant-id>" }
  }
}
```

---

## Option C — OpenTelemetry Collector

```yaml
receivers:
  prometheus:
    config:
      scrape_configs:
        - job_name: loki
          static_configs:
            - targets: ['localhost:3100']

processors:
  batch:
    timeout: 10s

exporters:
  otlphttp/xscaler:
    endpoint: https://euw1-01.m.xscalerlabs.com
    headers:
      Authorization: "Bearer <token>"
      X-Scope-OrgID: "<tenant-id>"
    compression: gzip

service:
  pipelines:
    metrics:
      receivers:  [prometheus]
      processors: [batch]
      exporters:  [otlphttp/xscaler]
```

---

## Key metrics

| Metric | Description |
|--------|-------------|
| `loki_ingester_chunks_stored_total` | Chunks flushed to storage |
| `loki_distributor_bytes_received_total` | Bytes received by distributor |
| `loki_request_duration_seconds` | Request latency by route |
| `loki_ingester_memory_chunks` | In-memory chunks count |
| `loki_querier_query_duration_seconds` | Query execution latency |
| `loki_boltdb_shipper_queries_total` | BoltDB shipper queries |
| `loki_compactor_runs_total` | Compactor run count |
