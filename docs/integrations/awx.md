---
id: awx
title: Ansible AWX
sidebar_label: Ansible AWX
slug: /integrations/awx
---

# Ansible AWX

Monitor Ansible AWX (Tower) using the AWX Prometheus exporter: job status, host inventory size, running and pending jobs, and project sync health.

**Pattern:** awx_prometheus_exporter → Prometheus scrape → xScaler `remote_write`

---

## Prerequisites

- AWX 17+ or Ansible Tower 3.6+
- AWX API token with read access
- xScaler tenant credentials (token + tenant ID)

---

## Option A: Prometheus Exporter

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

## Option B: Grafana Alloy

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

## Option C: OpenTelemetry Collector

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

## Logs

Collect AWX/Ansible Tower task and web container logs. Add the following to your Alloy config:

```river
discovery.docker "awx_containers" {
  host = "unix:///var/run/docker.sock"
  filter {
    name   = "name"
    values = ["awx"]
  }
}

discovery.relabel "awx_logs" {
  targets = discovery.docker.awx_containers.targets
  rule {
    source_labels = ["__meta_docker_container_name"]
    regex         = "/(.*)"
    target_label  = "container"
  }
  rule {
    replacement  = "integrations/awx"
    target_label = "job"
  }
}

loki.source.docker "awx_logs" {
  host       = "unix:///var/run/docker.sock"
  targets    = discovery.relabel.awx_logs.output
  forward_to = [loki.write.xscaler.receiver]
  labels     = { instance = constants.hostname }
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
| `awx_running_jobs_total` | Currently running jobs |
| `awx_pending_jobs_total` | Jobs waiting to run |
| `awx_job_status_total` | Job counts by status |
| `awx_hosts_total` | Total hosts in inventory |
| `awx_inventory_total` | Total inventories |
| `awx_projects_total` | Total projects |
| `awx_schedules_total` | Configured schedules |
