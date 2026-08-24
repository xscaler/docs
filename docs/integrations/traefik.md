---
id: traefik
title: Traefik
sidebar_label: Traefik
slug: /integrations/traefik
---

# Traefik

Monitor Traefik request rates, latencies, error rates, and open connections per router and service.

![Traefik Dashboard](https://grafana.com/api/dashboards/2240/images/1373/image)

## Key metrics

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

### Option A: Prometheus scrape

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

### Option B: Grafana Alloy

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

### Option C: OpenTelemetry Collector

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

## Logs

Collect Traefik access log and error log from the container. Add the following to your Alloy config:

```river
discovery.docker "traefik_containers" {
  host = "unix:///var/run/docker.sock"
  filter {
    name   = "name"
    values = ["traefik"]
  }
}

discovery.relabel "traefik_logs" {
  targets = discovery.docker.traefik_containers.targets
  rule {
    source_labels = ["__meta_docker_container_name"]
    regex         = "/(.*)"
    target_label  = "container"
  }
  rule {
    replacement  = "integrations/traefik"
    target_label = "job"
  }
}

loki.source.docker "traefik_logs" {
  host       = "unix:///var/run/docker.sock"
  targets    = discovery.relabel.traefik_logs.output
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

