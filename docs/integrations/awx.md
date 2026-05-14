---
id: awx
title: Ansible AWX
sidebar_label: Ansible AWX
slug: /integrations/awx
---

# Ansible AWX

Monitor Ansible AWX (Tower) — job status, host inventory size, running and pending jobs, and project sync health — using the AWX Prometheus exporter.

**Pattern:** awx_prometheus_exporter → Prometheus scrape → xScaler `remote_write`

---

## Prerequisites

- AWX 17+ or Ansible Tower 3.6+
- AWX API token with read access
- xScaler tenant credentials (token + tenant ID)

---

## Option A — Prometheus Exporter

```bash
docker run -d \
  -p 9538:9538 \
  -e AWX_HOST=http://awx.example.com \
  -e AWX_TOKEN=your_token \
  mamercad/awx-prometheus-exporter
```

Add to `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: awx
    static_configs:
      - targets: ['localhost:9538']

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
prometheus.scrape "awx" {
  targets    = [{"__address__" = "localhost:9538"}]
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

## Option C — OpenTelemetry Collector

```yaml
receivers:
  prometheus:
    config:
      scrape_configs:
        - job_name: awx
          static_configs:
            - targets: ['localhost:9538']
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

## Key metrics

| Metric | Description |
|--------|-------------|
| `awx_running_jobs_total` | Currently running jobs |
| `awx_pending_jobs_total` | Jobs waiting to run |
| `awx_job_status_total` | Job counts by status |
| `awx_hosts_total` | Total hosts in inventory |
| `awx_inventory_total` | Total inventories |
| `awx_projects_total` | Total projects |
| `awx_schedules_total` | Configured schedules |
