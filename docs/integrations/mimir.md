---
id: mimir
title: Grafana Mimir
sidebar_label: Grafana Mimir
slug: /integrations/mimir
---

# Grafana Mimir

Monitor Grafana Mimir — sample ingestion rates, compaction health, query throughput, and store-gateway block loading — using Mimir's built-in Prometheus metrics endpoint.

**Pattern:** Mimir /metrics → Prometheus scrape → xScaler `remote_write`

---

## Prerequisites

- Grafana Mimir 2.x+
- xScaler tenant credentials (token + tenant ID)

---

## Option A — Prometheus

Mimir exposes metrics at `:8080/metrics`.

```yaml
scrape_configs:
  - job_name: mimir
    static_configs:
      - targets: ['localhost:8080']

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
prometheus.scrape "mimir" {
  targets    = [{"__address__" = "localhost:8080"}]
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
        - job_name: mimir
          static_configs:
            - targets: ['localhost:8080']

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

Collect Mimir component logs from the container. Add the following to your Alloy config:

```river
discovery.docker "mimir_containers" {
  host = "unix:///var/run/docker.sock"
  filter {
    name   = "name"
    values = ["mimir"]
  }
}

discovery.relabel "mimir_logs" {
  targets = discovery.docker.mimir_containers.targets
  rule {
    source_labels = ["__meta_docker_container_name"]
    regex         = "/(.*)"
    target_label  = "container"
  }
  rule {
    replacement  = "integrations/mimir"
    target_label = "job"
  }
}

loki.source.docker "mimir_logs" {
  host       = "unix:///var/run/docker.sock"
  targets    = discovery.relabel.mimir_logs.output
  forward_to = [loki.write.xscaler.receiver]
  labels     = { instance = constants.hostname }
}

loki.write "xscaler" {
  endpoint {
    url = "https://euw1-01.l.xscalerlabs.com/api/v1/push"

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
| `mimir_ingester_samples_in_total` | Samples received by ingester |
| `mimir_distributor_received_samples_total` | Samples received by distributor |
| `mimir_compactor_blocks_cleaned_total` | Blocks cleaned by compactor |
| `mimir_ruler_evaluations_total` | Rule evaluations |
| `mimir_store_gateway_blocks_loaded` | Blocks loaded by store-gateway |
| `mimir_querier_query_duration_seconds` | Query duration histogram |
| `mimir_request_duration_seconds` | API request duration |
