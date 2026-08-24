---
id: pgbouncer
title: PgBouncer
sidebar_label: PgBouncer
slug: /integrations/pgbouncer
---

# PgBouncer

Monitor PgBouncer connection pooler using pgbouncer_exporter: active connections, pool utilisation, wait times, and query throughput.

**Pattern:** pgbouncer_exporter → Prometheus scrape → xScaler remote_write

---

## Prerequisites

- PgBouncer 1.12+
- `stats_users` configured in `pgbouncer.ini` to allow the exporter user to query the `pgbouncer` virtual database
- Network access from the exporter host to the PgBouncer admin interface (default port 6432)

---

## Option A: Prometheus Exporter

Run the pgbouncer_exporter as a Docker container:

```bash
docker run -d -p 9127:9127 \
  -e PGBOUNCER_EXPORTER_CONNECTION_STRING="postgres://pgbouncer:pass@localhost:6432/pgbouncer" \
  prometheuscommunity/pgbouncer-exporter
```

Configure Prometheus to scrape and forward to xScaler:

```yaml
scrape_configs:
  - job_name: pgbouncer
    static_configs:
      - targets: ["localhost:9127"]

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
prometheus.scrape "pgbouncer" {
  targets = [{ __address__ = "localhost:9127" }]
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
        - job_name: pgbouncer
          static_configs:
            - targets: ["localhost:9127"]

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

Collect PgBouncer connection pooler log. Add the following to your Alloy config:

```river
local.file_match "pgbouncer_logs" {
  path_targets = [{
    __address__ = "localhost",
    __path__    = "/var/log/postgresql/pgbouncer.log",
    instance    = constants.hostname,
    job         = "integrations/pgbouncer",
  }]
}

loki.source.file "pgbouncer_logs" {
  targets    = local.file_match.pgbouncer_logs.targets
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
| `pgbouncer_pools_cl_active` | Clients currently linked to a server connection |
| `pgbouncer_pools_cl_waiting` | Clients waiting for a free server connection |
| `pgbouncer_pools_sv_idle` | Server connections idle and available for reuse |
| `pgbouncer_stats_total_query_time` | Total time spent executing queries (microseconds) |
| `pgbouncer_pools_maxwait` | Age in seconds of the oldest waiting client |
| `pgbouncer_databases_pool_size` | Configured maximum pool size per database |
