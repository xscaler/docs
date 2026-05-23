---
id: minio
title: MinIO
sidebar_label: MinIO
slug: /integrations/minio
---

# MinIO

Monitor MinIO object storage — request rates, replication lag, bucket usage, and node health — using MinIO's built-in Prometheus endpoint. Track the health of your S3-compatible storage alongside the rest of your stack in xScaler.

**Pattern:** MinIO /minio/v2/metrics/cluster → Prometheus scrape → xScaler remote_write

---

## Prerequisites

- MinIO RELEASE.2021-01-05 or later
- `mc` (MinIO Client) configured for your cluster
- xScaler tenant credentials (token + tenant ID)

---

## Option A — Prometheus Exporter

MinIO exposes a native Prometheus metrics endpoint. Generate a bearer token using the MinIO Client and configure Prometheus to scrape it:

```bash
# Generate a Prometheus scrape configuration and token
mc admin prometheus generate <alias>
```

This outputs a ready-made Prometheus scrape config. Add the remote_write block to ship metrics to xScaler:

```yaml
scrape_configs:
  - job_name: minio
    bearer_token: <generated-token>
    metrics_path: /minio/v2/metrics/cluster
    scheme: http
    static_configs:
      - targets: ["minio-host:9000"]

remote_write:
  - url: https://euw1-01.m.xscalerlabs.com/api/v1/push
    authorization:
      type: Bearer
      credentials: <token>
    headers:
      X-Scope-OrgID: "<tenant-id>"
```

## Option B — Grafana Alloy

```river
prometheus.scrape "minio" {
  targets = [{
    "__address__"  = "minio-host:9000",
    "__metrics_path__" = "/minio/v2/metrics/cluster",
  }]
  bearer_token   = "<generated-minio-token>"
  forward_to     = [prometheus.remote_write.xscaler.receiver]
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

## Option C — OpenTelemetry Collector

```yaml
receivers:
  prometheus:
    config:
      scrape_configs:
        - job_name: minio
          bearer_token: <generated-minio-token>
          metrics_path: /minio/v2/metrics/cluster
          static_configs:
            - targets: ["minio-host:9000"]
          scrape_interval: 30s

processors:
  batch: {}

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
      receivers: [prometheus]
      processors: [batch]
      exporters: [otlphttp/xscaler]
```

---

## Logs

Collect MinIO server access and error logs from the container or service. Add the following to your Alloy config:

```river
discovery.docker "minio_containers" {
  host = "unix:///var/run/docker.sock"
  filter {
    name   = "name"
    values = ["minio"]
  }
}

discovery.relabel "minio_logs" {
  targets = discovery.docker.minio_containers.targets
  rule {
    source_labels = ["__meta_docker_container_name"]
    regex         = "/(.*)"
    target_label  = "container"
  }
  rule {
    replacement  = "integrations/minio"
    target_label = "job"
  }
}

loki.source.docker "minio_logs" {
  host       = "unix:///var/run/docker.sock"
  targets    = discovery.relabel.minio_logs.output
  forward_to = [loki.write.xscaler.receiver]
  labels     = { instance = constants.hostname }
}

loki.write "xscaler" {
  endpoint {
    url = "https://euw1-01.l.xscalerlabs.com/api/v1/logs/push"

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
| `minio_node_drive_free_bytes` | Free bytes remaining on each MinIO drive |
| `minio_bucket_objects_size_distribution` | Distribution of object sizes across buckets |
| `minio_s3_requests_total` | Total S3 API requests processed by the cluster |
| `minio_s3_errors_total` | Total S3 API errors returned by the cluster |
| `minio_node_process_cpu_seconds_total` | Cumulative CPU time consumed by the MinIO process |
