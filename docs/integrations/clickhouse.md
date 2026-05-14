---
id: clickhouse
title: ClickHouse
sidebar_label: ClickHouse
slug: /integrations/clickhouse
---

# ClickHouse

Monitor ClickHouse query rates, insert throughput, memory usage, and replication health.

![ClickHouse Dashboard](https://grafana.com/api/dashboards/14031/images/10034/image)

## Key Metrics

| Metric | Description |
|--------|-------------|
| `ClickHouseMetrics_Query` | Queries currently executing |
| `ClickHouseMetrics_Connection` | Active TCP connections |
| `ClickHouseProfileEvents_Query` | Cumulative query count |
| `ClickHouseProfileEvents_InsertRows` | Rows inserted |
| `ClickHouseAsyncMetrics_MemoryResident` | Resident memory (bytes) |
| `ClickHouseAsyncMetrics_Uptime` | Server uptime (seconds) |

## Prerequisites

- ClickHouse 21.x+
- Built-in Prometheus endpoint enabled

## Configuration

**Enable the Prometheus endpoint in config.xml**

```xml
<prometheus>
    <endpoint>/metrics</endpoint>
    <port>9363</port>
    <metrics>true</metrics>
    <events>true</events>
    <asynchronous_metrics>true</asynchronous_metrics>
</prometheus>
```

### Option A — Prometheus scrape

```yaml
scrape_configs:
  - job_name: clickhouse
    static_configs:
      - targets: ['localhost:9363']

remote_write:
  - url: https://<region>.xscalerlabs.com/api/v1/push
    headers:
      X-Scope-OrgID: <tenant-id>
    basic_auth:
      password: <api-token>
```

### Option B — Grafana Alloy

```alloy
prometheus.scrape "clickhouse" {
  targets    = [{"__address__" = "localhost:9363"}]
  forward_to = [prometheus.remote_write.xscaler.receiver]
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
        - job_name: clickhouse
          static_configs:
            - targets: ['localhost:9363']

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
