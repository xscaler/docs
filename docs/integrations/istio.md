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

## Logs

Collect Envoy sidecar proxy access logs from all Istio-injected pods. Add the following to your Alloy config (run on each node or deploy as a DaemonSet):

```river
discovery.kubernetes "istio_pods" {
  role = "pod"
}

discovery.relabel "istio_logs" {
  targets = discovery.kubernetes.istio_pods.targets
  rule {
    source_labels = ["__meta_kubernetes_namespace"]
    target_label  = "namespace"
  }
  rule {
    source_labels = ["__meta_kubernetes_pod_name"]
    target_label  = "pod"
  }
  rule {
    source_labels = ["__meta_kubernetes_pod_container_name"]
    target_label  = "container"
  }
  rule {
    replacement  = "integrations/istio"
    target_label = "job"
  }
  rule {
    source_labels = ["__meta_kubernetes_pod_uid", "__meta_kubernetes_pod_container_name"]
    separator     = "/"
    target_label  = "__path__"
    replacement   = "/var/log/pods/*$1/*.log"
  }
}

loki.source.file "istio_logs" {
  targets    = discovery.relabel.istio_logs.output
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

