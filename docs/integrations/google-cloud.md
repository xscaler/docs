---
id: google-cloud
title: Google Cloud
sidebar_label: Google Cloud
slug: /integrations/google-cloud
---

# Google Cloud

Pull metrics from Google Cloud Monitoring (formerly Stackdriver) into xScaler using the OpenTelemetry Collector's `googlecloudmonitoring` receiver. Covers GCE, GKE, Cloud SQL, Pub/Sub, Cloud Storage, and all other Google Cloud metrics.

**Pattern:** OTel Collector `googlecloudmonitoring` receiver → xScaler OTLP endpoint

---

## Prerequisites

- Google Cloud project with Cloud Monitoring enabled
- Service account with `roles/monitoring.viewer` IAM role
- OTel Collector (contrib distribution)
- xScaler tenant credentials

---

## Create a service account

```bash
# Create service account
gcloud iam service-accounts create otel-metrics-reader \
  --display-name "OTel Metrics Reader"

# Grant viewer role
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:otel-metrics-reader@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/monitoring.viewer"

# Download key file
gcloud iam service-accounts keys create sa-key.json \
  --iam-account="otel-metrics-reader@YOUR_PROJECT_ID.iam.gserviceaccount.com"
```

---

## Configuration

Save as `otel-collector-config.yaml`:

```yaml
receivers:
  googlecloudmonitoring:
    project_id: YOUR_PROJECT_ID
    collection_interval: 1m
    metric_descriptors:
      # GCE instances
      - metric_type: "compute.googleapis.com/instance/cpu/utilization"
      - metric_type: "compute.googleapis.com/instance/network/received_bytes_count"
      - metric_type: "compute.googleapis.com/instance/network/sent_bytes_count"
      - metric_type: "compute.googleapis.com/instance/disk/read_bytes_count"
      - metric_type: "compute.googleapis.com/instance/disk/write_bytes_count"

      # GKE
      - metric_type: "kubernetes.io/container/cpu/core_usage_time"
      - metric_type: "kubernetes.io/container/memory/used_bytes"
      - metric_type: "kubernetes.io/pod/network/received_bytes_count"

      # Cloud SQL
      - metric_type: "cloudsql.googleapis.com/database/cpu/utilization"
      - metric_type: "cloudsql.googleapis.com/database/memory/utilization"
      - metric_type: "cloudsql.googleapis.com/database/postgresql/num_backends"

      # Pub/Sub
      - metric_type: "pubsub.googleapis.com/subscription/num_undelivered_messages"
      - metric_type: "pubsub.googleapis.com/subscription/oldest_unacked_message_age"

processors:
  memory_limiter:
    check_interval: 1s
    limit_mib: 512
  batch:
    timeout: 30s
    send_batch_size: 1000

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
      receivers:  [googlecloudmonitoring]
      processors: [memory_limiter, batch]
      exporters:  [otlphttp/xscaler]
```

---

## Provide credentials

Set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to the path of your service account key:

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/sa-key.json
```

On GCE or GKE with Workload Identity, credentials are picked up automatically — no key file needed.

---

## Key metrics

| Service | Metric type | Description |
|---------|-------------|-------------|
| GCE | `instance/cpu/utilization` | CPU utilisation (0–1) |
| GCE | `instance/network/received_bytes_count` | Bytes received |
| GKE | `container/cpu/core_usage_time` | Container CPU seconds |
| GKE | `container/memory/used_bytes` | Container memory |
| Cloud SQL | `database/cpu/utilization` | DB CPU % |
| Cloud SQL | `database/postgresql/num_backends` | Active connections |
| Pub/Sub | `subscription/num_undelivered_messages` | Unacked message backlog |
| Pub/Sub | `subscription/oldest_unacked_message_age` | Oldest unacked message age (s) |

---

## Useful PromQL queries

```promql
# GCE CPU usage %
avg(compute_googleapis_com_instance_cpu_utilization) * 100

# Cloud SQL active connections
cloudsql_googleapis_com_database_postgresql_num_backends

# Pub/Sub subscription backlog
pubsub_googleapis_com_subscription_num_undelivered_messages

# GKE container memory usage (bytes)
kubernetes_io_container_memory_used_bytes
```
