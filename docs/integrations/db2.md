---
id: db2
title: IBM Db2
sidebar_label: IBM Db2
slug: /integrations/db2
---

# IBM Db2

Monitor IBM Db2 using the Db2 Prometheus exporter: connections, lock waits, buffer pool hit rates, tablespace usage, and log utilisation.

**Pattern:** db2_exporter → Prometheus scrape → xScaler `remote_write`

---

## Prerequisites

- IBM Db2 11.1+
- Monitoring user with SYSMON authority: `GRANT SYSMON TO USER monitor`
- xScaler tenant credentials (token + tenant ID)

---

## Option A: Prometheus Exporter

```bash
docker run -d \
  -p 9953:9953 \
  -e DB2_DSN="DATABASE=MYDB;HOSTNAME=localhost;PORT=50000;UID=monitor;PWD=pass" \
  jplock/db2_exporter
```

Add to `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: db2
    static_configs:
      - targets: ['localhost:9953']

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
prometheus.scrape "db2" {
  targets    = [{"__address__" = "localhost:9953"}]
  forward_to = [prometheus.remote_write.xscaler.receiver]
  scrape_interval = "60s"
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
        - job_name: db2
          static_configs:
            - targets: ['localhost:9953']
          scrape_interval: 60s

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

Collect IBM Db2 diagnostic and notification log via systemd journal. Add the following to your Alloy config:

```river
loki.source.journal "db2_journal" {
  forward_to    = [loki.write.xscaler.receiver]
  relabel_rules = loki.relabel.db2_journal.rules
  labels = {
    job      = "integrations/db2",
    instance = constants.hostname,
  }
}

loki.relabel "db2_journal" {
  forward_to = []
  rule {
    source_labels = ["__journal__systemd_unit"]
    target_label  = "unit"
  }
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
| `db2_connections_current` | Current active connections |
| `db2_lock_wait_time_avg` | Average lock wait time (ms) |
| `db2_buffer_pool_hit_ratio` | Buffer pool cache hit ratio |
| `db2_tablespace_used_pages` | Tablespace pages in use |
| `db2_log_utilization_percent` | Active log utilisation |
| `db2_total_app_commits` | Application commit count |
| `db2_deadlocks_total` | Total deadlocks |
