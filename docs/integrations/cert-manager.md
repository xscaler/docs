---
id: cert-manager
title: cert-manager
sidebar_label: cert-manager
slug: /integrations/cert-manager
---

# cert-manager

Monitor cert-manager — certificate expiry, renewal status, ACME request rates, and controller sync health — using cert-manager's built-in Prometheus metrics.

**Pattern:** cert-manager /metrics → Prometheus scrape → xScaler `remote_write`

---

## Prerequisites

- cert-manager 1.5+
- Kubernetes cluster
- xScaler tenant credentials (token + tenant ID)

---

## Enable Metrics

cert-manager exposes metrics on port `9402` of the controller pod by default. No additional configuration is required.

Create a Prometheus `ServiceMonitor` (if using Prometheus Operator):

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: cert-manager
  namespace: cert-manager
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: cert-manager
  endpoints:
    - port: http-metrics
      interval: 60s
```

---

## Option A — Prometheus

```yaml
scrape_configs:
  - job_name: cert_manager
    kubernetes_sd_configs:
      - role: pod
        namespaces:
          names: [cert-manager]
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_label_app_kubernetes_io_name]
        regex: cert-manager
        action: keep
      - source_labels: [__meta_kubernetes_pod_ip]
        target_label: __address__
        replacement: $1:9402

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
discovery.kubernetes "cert_manager" {
  role = "pod"
  namespaces { names = ["cert-manager"] }
}

discovery.relabel "cert_manager" {
  targets = discovery.kubernetes.cert_manager.targets
  rule {
    source_labels = ["__meta_kubernetes_pod_label_app_kubernetes_io_name"]
    regex         = "cert-manager"
    action        = "keep"
  }
  rule {
    source_labels = ["__meta_kubernetes_pod_ip"]
    target_label  = "__address__"
    replacement   = "$1:9402"
  }
}

prometheus.scrape "cert_manager" {
  targets         = discovery.relabel.cert_manager.output
  forward_to      = [prometheus.remote_write.xscaler.receiver]
  scrape_interval = "60s"
}

prometheus.remote_write "xscaler" {
  endpoint {
    url = "https://euw1-01.m.xscalerlabs.com/api/v1/push"
    authorization {
      type        = "Bearer"
      credentials = env("XSCALER_TOKEN")
    }
    headers = { "X-Scope-OrgID" = env("XSCALER_TENANT_ID") }
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
        - job_name: cert_manager
          static_configs:
            - targets: ['cert-manager.cert-manager.svc:9402']
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
| `certmanager_certificate_expiry_seconds` | Time until certificate expiry |
| `certmanager_certificate_ready_status` | Certificate ready condition |
| `certmanager_certificate_renewal_timestamp_seconds` | When renewal is scheduled |
| `certmanager_controller_sync_call_count` | Controller sync invocations |
| `certmanager_http_acme_client_request_count` | ACME API requests |
| `certmanager_clock_time_seconds` | Controller wall clock time |
