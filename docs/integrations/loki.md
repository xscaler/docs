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

## Logs

Collect Loki ingester, distributor, and query-frontend logs. Add the following to your Alloy config:

```river
discovery.docker "loki_containers" {
  host = "unix:///var/run/docker.sock"
  filter {
    name   = "name"
    values = ["loki"]
  }
}

discovery.relabel "loki_logs" {
  targets = discovery.docker.loki_containers.targets
  rule {
    source_labels = ["__meta_docker_container_name"]
    regex         = "/(.*)"
    target_label  = "container"
  }
  rule {
    replacement  = "integrations/loki"
    target_label = "job"
  }
}

loki.source.docker "loki_logs" {
  host       = "unix:///var/run/docker.sock"
  targets    = discovery.relabel.loki_logs.output
  forward_to = [loki.write.xscaler.receiver]
  labels     = { instance = constants.hostname }
}

loki.write "xscaler" {
  endpoint {
    url = "https://euw1-01.l.xscalerlabs.com/api/v1/logs/push"

    http_client_config {
      authorization {
        type        = "Bearer"
        credentials = env("XSCALER_TOKEN")
      }
    }

    headers = { "X-Scope-OrgID" = env("XSCALER_TENANT_ID") }
  }
}
```

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
