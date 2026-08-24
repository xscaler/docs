---
id: velero
title: Velero
sidebar_label: Velero
slug: /integrations/velero
---

# Velero

Monitor Velero backup and restore operations using its built-in Prometheus metrics: backup success/failure rates, restore status, schedule health, and volume snapshot counts.

**Pattern:** Velero /metrics → Prometheus scrape → xScaler `remote_write`

---

## Prerequisites

- Velero 1.9+
- Kubernetes cluster
- xScaler tenant credentials (token + tenant ID)

---

## Option A: Prometheus

Velero server exposes metrics at `:8085/metrics` by default.

```yaml
scrape_configs:
  - job_name: velero
    kubernetes_sd_configs:
      - role: pod
        namespaces:
          names: [velero]
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_label_app_kubernetes_io_name]
        regex: velero
        action: keep
      - source_labels: [__meta_kubernetes_pod_ip]
        target_label: __address__
        replacement: $1:8085

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
prometheus.scrape "velero" {
  targets         = [{"__address__" = "velero.velero.svc:8085"}]
  forward_to      = [prometheus.remote_write.xscaler.receiver]
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
        - job_name: velero
          static_configs:
            - targets: ['velero.velero.svc:8085']
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

Collect Velero backup controller pod logs. Add the following to your Alloy config (run on each node or deploy as a DaemonSet):

```river
discovery.kubernetes "velero_pods" {
  role = "pod"
}

discovery.relabel "velero_logs" {
  targets = discovery.kubernetes.velero_pods.targets
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
    replacement  = "integrations/velero"
    target_label = "job"
  }
  rule {
    source_labels = ["__meta_kubernetes_pod_uid", "__meta_kubernetes_pod_container_name"]
    separator     = "/"
    target_label  = "__path__"
    replacement   = "/var/log/pods/*$1/*.log"
  }
}

loki.source.file "velero_logs" {
  targets    = discovery.relabel.velero_logs.output
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
| `velero_backup_success_total` | Successful backup count |
| `velero_backup_failure_total` | Failed backup count |
| `velero_backup_partial_failure_total` | Partially failed backups |
| `velero_restore_success_total` | Successful restores |
| `velero_restore_failure_total` | Failed restores |
| `velero_backup_duration_seconds` | Backup duration histogram |
| `velero_volume_snapshot_success_total` | Successful volume snapshots |
| `velero_backup_last_status` | Status of last backup per schedule |
