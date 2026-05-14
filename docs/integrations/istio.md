---
id: istio
title: Istio
sidebar_label: Istio
slug: /integrations/istio
---

# Istio

Monitor Istio service mesh request rates, latencies, error rates, and control plane health.

![Istio Dashboard](https://grafana.com/api/dashboards/7645/images/16446/image)

## Key Metrics

| Metric | Description |
|--------|-------------|
| `istio_requests_total` | Total requests through the mesh |
| `istio_request_duration_milliseconds` | Request latency histogram |
| `istio_request_bytes` | Request body size |
| `istio_response_bytes` | Response body size |
| `istio_tcp_connections_opened_total` | TCP connections opened |
| `pilot_xds_pushes` | Envoy xDS config pushes by control plane |

## Prerequisites

- Istio 1.9+ installed on Kubernetes
- Prometheus scraping enabled in the Istio mesh config

## Configuration

### Option A — Prometheus scrape (in-cluster)

Istio sidecars expose metrics on port `15020`.

```yaml
scrape_configs:
  - job_name: istio-mesh
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: "true"

remote_write:
  - url: https://<region>.xscalerlabs.com/api/v1/push
    headers:
      X-Scope-OrgID: <tenant-id>
    basic_auth:
      password: <api-token>
```

### Option B — Grafana Alloy

```alloy
discovery.kubernetes "istio_pods" {
  role = "pod"
}

prometheus.scrape "istio" {
  targets    = discovery.kubernetes.istio_pods.targets
  forward_to = [prometheus.remote_write.xscaler.receiver]
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
        - job_name: istio
          kubernetes_sd_configs:
            - role: pod
          relabel_configs:
            - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
              action: keep
              regex: "true"

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
