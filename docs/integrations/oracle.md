---
id: oracle
title: Oracle Database
sidebar_label: Oracle Database
slug: /integrations/oracle
---

# Oracle Database

Monitor Oracle Database — sessions, SQL throughput, tablespace usage, wait events, and ASM — using oracledb_exporter. Gain deep visibility into your Oracle workloads from within xScaler.

**Pattern:** oracledb_exporter → Prometheus scrape → xScaler remote_write

---

## Prerequisites

- Oracle Database 11g or later
- Monitoring user with `SELECT_CATALOG_ROLE` granted
- xScaler tenant credentials (token + tenant ID)

Create the monitoring user in SQL*Plus or SQL Developer:

```sql
CREATE USER monitor IDENTIFIED BY pass;
GRANT CREATE SESSION, SELECT_CATALOG_ROLE TO monitor;
```

---

## Option A — Prometheus Exporter

Run oracledb_exporter as a Docker container, providing the Oracle connection string via `DATA_SOURCE_NAME`:

```bash
docker run -d \
  -p 9161:9161 \
  -e DATA_SOURCE_NAME="monitor/pass@localhost:1521/ORCL" \
  iamseth/oracledb_exporter
```

The exporter listens on port `9161`. Configure Prometheus to scrape and remote_write:

```yaml
scrape_configs:
  - job_name: oracle
    static_configs:
      - targets: ["localhost:9161"]

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
prometheus.scrape "oracle" {
  targets    = [{"__address__" = "localhost:9161"}]
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
  oracledb:
    endpoint: localhost:1521
    username: monitor
    password: pass
    service: ORCL
    collection_interval: 30s

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
      receivers: [oracledb]
      processors: [batch]
      exporters: [otlphttp/xscaler]
```

---

## Logs

Collect Oracle alert log and trace files. Add the following to your Alloy config:

```river
local.file_match "oracle_logs" {
  path_targets = [{
    __address__ = "localhost",
    __path__    = "/opt/oracle/diag/rdbms/**/*.log",
    instance    = constants.hostname,
    job         = "integrations/oracle",
  }]
}

loki.source.file "oracle_logs" {
  targets    = local.file_match.oracle_logs.targets
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
| `oracledb_sessions_value` | Current number of database sessions by status and type |
| `oracledb_wait_time_application` | Cumulative wait time for application wait events in centiseconds |
| `oracledb_tablespace_used_bytes` | Bytes currently used in each tablespace |
| `oracledb_activity_execute_count` | Total number of SQL statement executions |
| `oracledb_enqueue_deadlocks_value` | Total number of deadlocks detected since instance startup |
| `oracledb_physical_reads_value` | Total number of physical block reads from disk |
