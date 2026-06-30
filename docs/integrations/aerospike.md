---
id: aerospike
title: Aerospike
sidebar_label: Aerospike
slug: /integrations/aerospike
---

# Aerospike

Monitor Aerospike — namespace stats, cluster health, read/write throughput, and memory usage — using aerospike-prometheus-exporter. Gain real-time visibility into your Aerospike clusters from within xScaler.

**Pattern:** aerospike-prometheus-exporter → Prometheus scrape → xScaler remote_write

---

## Prerequisites

- Aerospike 5.1 or later
- Network access to the Aerospike service port (default: 3000)
- xScaler tenant credentials (token + tenant ID)

---

## Option A — Prometheus Exporter

Download and install the [aerospike-prometheus-exporter](https://github.com/aerospike/aerospike-prometheus-exporter/releases), then configure it to connect to your Aerospike node:

```toml
# /etc/aerospike-prometheus-exporter/ape.toml
[Aerospike]
db_host = "localhost"
db_port = 3000

[Agent]
bind = ":9145"
```

Start the exporter:

```bash
aerospike-prometheus-exporter --config /etc/aerospike-prometheus-exporter/ape.toml
```

The exporter listens on port `9145`. Configure Prometheus to scrape and remote_write:

```yaml
scrape_configs:
  - job_name: aerospike
    static_configs:
      - targets: ["localhost:9145"]

remote_write:
  - url: https://euw1-01.m.xscalerlabs.com/api/v1/push
    authorization:
      type: Bearer
      credentials: <token>
    headers:
      X-Scope-OrgID: "<tenant-id>"
```

## Option B — Grafana Alloy

```river
prometheus.scrape "aerospike" {
  targets    = [{"__address__" = "localhost:9145"}]
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

## Option C — OpenTelemetry Collector

```yaml
receivers:
  prometheus:
    config:
      scrape_configs:
        - job_name: aerospike
          static_configs:
            - targets: ["localhost:9145"]
          scrape_interval: 30s

processors:
  batch: {}

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
      receivers: [prometheus]
      processors: [batch]
      exporters: [otlphttp/xscaler]
```

---

## Logs

Collect Aerospike server log including node events and errors. Add the following to your Alloy config:

```river
local.file_match "aerospike_logs" {
  path_targets = [{
    __address__ = "localhost",
    __path__    = "/var/log/aerospike/aerospike.log",
    instance    = constants.hostname,
    job         = "integrations/aerospike",
  }]
}

loki.source.file "aerospike_logs" {
  targets    = local.file_match.aerospike_logs.targets
  forward_to = [loki.write.xscaler.receiver]
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
| `aerospike_namespace_memory_used_bytes` | Memory used by each namespace in bytes |
| `aerospike_namespace_objects` | Total number of objects stored in each namespace |
| `aerospike_namespace_read_tps` | Read transactions per second for each namespace |
| `aerospike_namespace_write_tps` | Write transactions per second for each namespace |
| `aerospike_node_stats_cluster_size` | Number of nodes currently active in the cluster |
| `aerospike_node_stats_failed_node_joins` | Number of failed node join attempts since startup |
