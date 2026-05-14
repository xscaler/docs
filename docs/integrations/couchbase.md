---
id: couchbase
title: Couchbase
sidebar_label: Couchbase
slug: /integrations/couchbase
---

# Couchbase

Monitor Couchbase Server — bucket operations, memory usage, disk I/O, and replication — using couchbase-exporter. Track the performance and capacity of your Couchbase clusters in xScaler.

**Pattern:** couchbase-exporter → Prometheus scrape → xScaler remote_write

---

## Prerequisites

- Couchbase Server 6.5 or later
- Couchbase admin credentials
- xScaler tenant credentials (token + tenant ID)

---

## Option A — Prometheus Exporter

Run couchbase-exporter as a Docker container pointed at your Couchbase node:

```bash
docker run -d \
  -p 9420:9420 \
  -e CB_HOST=localhost \
  -e CB_USER=admin \
  -e CB_PWD=password \
  blakelead/couchbase-exporter
```

The exporter listens on port `9420`. Configure Prometheus to scrape and remote_write:

```yaml
scrape_configs:
  - job_name: couchbase
    static_configs:
      - targets: ["localhost:9420"]

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
prometheus.scrape "couchbase" {
  targets    = [{"__address__" = "localhost:9420"}]
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

## Option C — OpenTelemetry Collector

```yaml
receivers:
  couchbase:
    endpoint: http://localhost:8091
    username: admin
    password: password
    collection_interval: 30s

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
      receivers: [couchbase]
      processors: [batch]
      exporters: [otlphttp/xscaler]
```

---

## Key metrics

| Metric | Description |
|--------|-------------|
| `couchbase_bucket_op_get_total` | Total get (read) operations on each bucket |
| `couchbase_bucket_op_set_total` | Total set (write) operations on each bucket |
| `couchbase_bucket_mem_used_bytes` | Memory currently used by each bucket |
| `couchbase_bucket_disk_write_queue` | Number of items waiting to be persisted to disk |
| `couchbase_node_cpu_utilization_rate` | CPU utilisation percentage per Couchbase node |
| `couchbase_cluster_ram_used_bytes` | Total RAM used across the entire cluster |
