---
id: traefik
title: Traefik
sidebar_label: Traefik
slug: /integrations/traefik
---

# Traefik

Monitor Traefik request rates, latencies, error rates, and open connections per router and service.

![Traefik Dashboard](https://grafana.com/api/dashboards/2240/images/1373/image)

## Key Metrics

| Metric | Description |
|--------|-------------|
| `traefik_router_requests_total` | Total requests per router |
| `traefik_service_requests_total` | Total requests per service |
| `traefik_service_request_duration_seconds` | Request latency histogram |
| `traefik_entrypoint_requests_total` | Requests per entrypoint |
| `traefik_service_open_connections` | Open connections per service |
| `traefik_service_retries_total` | Service retry count |

## Prerequisites

- Traefik v2.x or v3.x
- Prometheus metrics endpoint enabled

## Configuration

**Enable metrics in traefik.yml**

```yaml
metrics:
  prometheus:
    addEntryPointsLabels: true
    addRoutersLabels: true
    addServicesLabels: true
    entryPoint: metrics
```

### Option A — Prometheus scrape

```yaml
scrape_configs:
  - job_name: traefik
    static_configs:
      - targets: ['localhost:8080']
    metrics_path: /metrics

remote_write:
  - url: https://<region>.xscalerlabs.com/api/v1/push
    headers:
      X-Scope-OrgID: <tenant-id>
    basic_auth:
      password: <api-token>
```

### Option B — Grafana Alloy

```alloy
prometheus.scrape "traefik" {
  targets      = [{"__address__" = "localhost:8080"}]
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
        - job_name: traefik
          metrics_path: /metrics
          static_configs:
            - targets: ['localhost:8080']

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
