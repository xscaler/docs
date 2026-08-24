---
id: influxdb
title: InfluxDB
sidebar_label: InfluxDB
slug: /integrations/influxdb
---

# InfluxDB

Monitor InfluxDB query throughput, write rates, shard disk usage, and TSM cache performance.

![InfluxDB Dashboard](https://grafana.com/api/dashboards/1500/images/915/image)

## Key metrics

| Metric | Description |
|--------|-------------|
| `influxdb_queryExecutor_queriesExecuted_total` | Total queries executed |
| `influxdb_queryExecutor_queriesActive` | Currently running queries |
| `influxdb_write_pointReqs_total` | Write requests received |
| `influxdb_httpd_clientError_total` | HTTP client errors |
| `influxdb_runtime_HeapInuse` | Heap memory in use |
| `influxdb_shard_diskBytes_gauge` | Disk bytes per shard |

## Prerequisites

- InfluxDB 1.x or 2.x
- HTTP API accessible on port `8086`

## Configuration

InfluxDB 1.x exposes Prometheus metrics at `/metrics` with `[http] pprof-enabled = true`.

### Option A: Prometheus scrape

```yaml
scrape_configs:
  - job_name: influxdb
    metrics_path: /metrics
    static_configs:
      - targets: ['localhost:8086']

remote_write:
  - url: https://<region>.xscalerlabs.com/api/v1/push
    headers:
      X-Scope-OrgID: <tenant-id>
    basic_auth:
      password: <api-token>
```

### Option B: Grafana Alloy

```alloy
prometheus.scrape "influxdb" {
  targets      = [{"__address__" = "localhost:8086"}]
  metrics_path = "/metrics"
  forward_to   = [prometheus.remote_write.xscaler.receiver]
}

prometheus.remote_write "xscaler" {
  endpoint {
    url = "https://<region>.xscalerlabs.com/api/v1/push"
    headers = { "X-Scope-OrgID" = "<tenant-id>" }
    basic_auth { password = "<api-token>" }
  }
}
```

### Option C: OpenTelemetry Collector

```yaml
receivers:
  prometheus:
    config:
      scrape_configs:
        - job_name: influxdb
          metrics_path: /metrics
          static_configs:
            - targets: ['localhost:8086']

exporters:
  prometheusremotewrite:
    endpoint: https://<region>.xscalerlabs.com/api/v1/push
    headers:
      Authorization: Bearer <api-token>
      X-Scope-OrgID: <tenant-id>

service:
  pipelines:
    metrics:
      receivers: [prometheus]
      exporters: [prometheusremotewrite]
```

## Logs

Collect InfluxDB server log. Add the following to your Alloy config:

```river
local.file_match "influxdb_logs" {
  path_targets = [{
    __address__ = "localhost",
    __path__    = "/var/log/influxdb/influxd.log",
    instance    = constants.hostname,
    job         = "integrations/influxdb",
  }]
}

loki.source.file "influxdb_logs" {
  targets    = local.file_match.influxdb_logs.targets
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

