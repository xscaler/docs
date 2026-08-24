---
id: snowflake
title: Snowflake
sidebar_label: Snowflake
slug: /integrations/snowflake
---

# Snowflake

Monitor Snowflake using snowflake-prometheus-exporter: query performance, warehouse credit usage, storage consumption, and login history.

**Pattern:** snowflake-prometheus-exporter → Prometheus scrape → xScaler remote_write

---

## Prerequisites

- Snowflake account with network access from the exporter host
- Role with `MONITOR USAGE` privilege and `USAGE` on the `SNOWFLAKE` database
- Python 3.8+ (for pip-based installation)

---

## Option A: Prometheus Exporter

Install and run the exporter:

```bash
pip install snowflake-prometheus-exporter

snowflake-prometheus-exporter \
  --account myaccount \
  --user monitor \
  --password pass \
  --role SYSADMIN \
  --warehouse COMPUTE_WH
```

The exporter listens on port `9975` by default. Configure Prometheus to scrape it and forward to xScaler:

```yaml
scrape_configs:
  - job_name: snowflake
    static_configs:
      - targets: ["localhost:9975"]

remote_write:
  - url: https://euw1-01.m.xscalerlabs.com/api/v1/push
    authorization:
      credentials: <token>
    headers:
      X-Scope-OrgID: <tenant-id>
```

---

## Option B: Grafana Alloy

```river
prometheus.scrape "snowflake" {
  targets = [{ __address__ = "localhost:9975" }]
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

## Option C: OpenTelemetry Collector

```yaml
receivers:
  prometheus:
    config:
      scrape_configs:
        - job_name: snowflake
          static_configs:
            - targets: ["localhost:9975"]

processors:
  memory_limiter:
    check_interval: 1s
    limit_mib: 256
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
      processors: [memory_limiter, batch]
      exporters:  [otlphttp/xscaler]
```

---

## Logs

Snowflake query history and login history. Query `SNOWFLAKE.ACCOUNT_USAGE` views and forward to xScaler using the OTel Collector.

## Key metrics

| Metric | Description |
|--------|-------------|
| `snowflake_query_count` | Total number of queries executed |
| `snowflake_credits_used_compute` | Compute credits consumed by virtual warehouses |
| `snowflake_storage_bytes` | Total storage used across all databases |
| `snowflake_failed_logins_total` | Cumulative count of failed login attempts |
| `snowflake_warehouse_queued_load` | Number of queries queued waiting for warehouse capacity |
| `snowflake_query_execution_time_avg` | Average query execution time in milliseconds |
