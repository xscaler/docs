---
id: influxdb
title: InfluxDB
sidebar_label: InfluxDB
slug: /integrations/influxdb
---

# InfluxDB

Monitor InfluxDB query throughput, write rates, shard disk usage, and TSM cache performance.

![InfluxDB Dashboard](https://grafana.com/api/dashboards/1500/images/915/image)

## Key Metrics

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

### Option A — Prometheus scrape

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

### Option B — Grafana Alloy

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

### Option C — OpenTelemetry Collector

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
