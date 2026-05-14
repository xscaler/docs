---
id: sap-hana
title: SAP HANA
sidebar_label: SAP HANA
slug: /integrations/sap-hana
---

# SAP HANA

Monitor SAP HANA — memory usage, CPU, connection pool, replication, and backup status — using hana_exporter.

**Pattern:** hana_exporter → Prometheus scrape → xScaler remote_write

---

## Prerequisites

- SAP HANA 2.0+
- Monitoring user with `DATA ADMIN` or `MONITORING` role
- Network access from the exporter host to HANA port (default 39013)

---

## Option A — Prometheus Exporter

Run the hana_exporter as a Docker container:

```bash
docker run -d -p 9668:9668 \
  -e HANA_HOST=hana-host \
  -e HANA_PORT=39013 \
  -e HANA_USER=monitor \
  -e HANA_PASSWORD=pass \
  dbsystel/prometheus-hana-exporter
```

Then configure Prometheus to scrape it and forward to xScaler:

```yaml
scrape_configs:
  - job_name: sap-hana
    static_configs:
      - targets: ["localhost:9668"]

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
prometheus.scrape "sap_hana" {
  targets = [{ __address__ = "localhost:9668" }]
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
        - job_name: sap-hana
          static_configs:
            - targets: ["localhost:9668"]

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

## Key metrics

| Metric | Description |
|--------|-------------|
| `hana_cpu_used` | CPU utilization percentage across HANA services |
| `hana_memory_used_mb` | Total memory consumed by HANA in megabytes |
| `hana_connection_count` | Current number of active client connections |
| `hana_backup_status` | Status code of the most recent backup operation |
| `hana_replication_status` | System replication state (active, error, etc.) |
| `hana_service_memory_used_mb` | Memory used per individual HANA service |
