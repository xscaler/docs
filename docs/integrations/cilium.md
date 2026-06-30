---
id: cilium
title: Cilium
sidebar_label: Cilium
slug: /integrations/cilium
---

# Cilium

Monitor Cilium eBPF networking — policy enforcement drops, connection tracking, BPF map pressure, and Envoy proxy metrics — using Cilium's built-in Prometheus endpoint.

**Pattern:** Cilium Agent /metrics → Prometheus scrape → xScaler `remote_write`

---

## Prerequisites

- Cilium 1.11+
- Kubernetes cluster
- xScaler tenant credentials (token + tenant ID)

---

## Enable Metrics

Enable metrics in your Helm values:

```yaml
prometheus:
  enabled: true
  port: 9962

operator:
  prometheus:
    enabled: true
    port: 9963
```

Apply with:

```bash
helm upgrade cilium cilium/cilium --reuse-values -f values.yaml
```

---

## Option A — Prometheus

Add a scrape job targeting all cilium-agent pods:

```yaml
scrape_configs:
  - job_name: cilium
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_label_k8s_app]
        regex: cilium
        action: keep
      - source_labels: [__meta_kubernetes_pod_ip]
        target_label: __address__
        replacement: $1:9962

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
discovery.kubernetes "cilium_pods" {
  role = "pod"
}

discovery.relabel "cilium" {
  targets = discovery.kubernetes.cilium_pods.targets
  rule {
    source_labels = ["__meta_kubernetes_pod_label_k8s_app"]
    regex         = "cilium"
    action        = "keep"
  }
  rule {
    source_labels = ["__meta_kubernetes_pod_ip"]
    target_label  = "__address__"
    replacement   = "$1:9962"
  }
}

prometheus.scrape "cilium" {
  targets    = discovery.relabel.cilium.output
  forward_to = [prometheus.remote_write.xscaler.receiver]
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
        - job_name: cilium
          kubernetes_sd_configs:
            - role: pod
          relabel_configs:
            - source_labels: [__meta_kubernetes_pod_label_k8s_app]
              regex: cilium
              action: keep
            - source_labels: [__meta_kubernetes_pod_ip]
              target_label: __address__
              replacement: "$1:9962"

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

Collect Cilium agent and operator logs from Kubernetes pods. Add the following to your Alloy config (run on each node or deploy as a DaemonSet):

```river
discovery.kubernetes "cilium_pods" {
  role = "pod"
}

discovery.relabel "cilium_logs" {
  targets = discovery.kubernetes.cilium_pods.targets
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
    replacement  = "integrations/cilium"
    target_label = "job"
  }
  rule {
    source_labels = ["__meta_kubernetes_pod_uid", "__meta_kubernetes_pod_container_name"]
    separator     = "/"
    target_label  = "__path__"
    replacement   = "/var/log/pods/*$1/*.log"
  }
}

loki.source.file "cilium_logs" {
  targets    = discovery.relabel.cilium_logs.output
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

## Key metrics

| Metric | Description |
|--------|-------------|
| `cilium_drop_count_total` | Packets dropped by policy |
| `cilium_forward_count_total` | Packets forwarded |
| `cilium_policy_endpoint_enforcement_status` | Endpoints with policy enforcement |
| `cilium_bpf_map_ops_total` | BPF map operations |
| `cilium_endpoint_state` | Endpoint states (ready/not-ready) |
| `cilium_controllers_failing` | Failing controllers |
| `cilium_identity_count` | Number of security identities |
