---
id: temporal
title: Temporal
sidebar_label: Temporal
slug: /integrations/temporal
---

# Temporal

Monitor Temporal workflow engine — active workflow counts, activity latency, schedule-to-start times, request rates, and service errors — using Temporal's built-in Prometheus metrics.

**Pattern:** Temporal /metrics → Prometheus scrape → xScaler `remote_write`

---

## Prerequisites

- Temporal 1.x+
- xScaler tenant credentials (token + tenant ID)

---

## Enable Metrics

In `temporal-server.yaml`:

```yaml
global:
  metrics:
    prometheus:
      framework: tally
      listenAddress: "0.0.0.0:8000"
```

Temporal frontend exposes metrics at `:8000/metrics` and workers at `:9091/metrics`.

---

## Option A — Prometheus

```yaml
scrape_configs:
  - job_name: temporal_frontend
    static_configs:
      - targets: ['localhost:8000']
  - job_name: temporal_worker
    static_configs:
      - targets: ['localhost:9091']

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
prometheus.scrape "temporal" {
  targets = [
    {"__address__" = "localhost:8000", job = "temporal_frontend"},
    {"__address__" = "localhost:9091", job = "temporal_worker"},
  ]
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
        - job_name: temporal
          static_configs:
            - targets: ['localhost:8000', 'localhost:9091']

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
| `temporal_workflow_active_thread_count` | Active workflow threads |
| `temporal_activity_schedule_to_start_latency` | Activity schedule-to-start time |
| `temporal_workflow_task_schedule_to_start_latency` | Workflow task latency |
| `temporal_request_latency` | Frontend request latency |
| `temporal_service_errors_total` | Service errors by type |
| `temporal_persistence_requests` | Persistence layer requests |
