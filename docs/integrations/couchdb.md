---
id: couchdb
title: Apache CouchDB
sidebar_label: Apache CouchDB
slug: /integrations/couchdb
---

# Apache CouchDB

Monitor Apache CouchDB — request rates, database sizes, compaction status, and replication — using couchdb-exporter. Observe the health and throughput of your CouchDB cluster in xScaler.

**Pattern:** couchdb-exporter → Prometheus scrape → xScaler remote_write

---

## Prerequisites

- Apache CouchDB 3.x or later
- CouchDB admin credentials
- xScaler tenant credentials (token + tenant ID)

---

## Option A — Prometheus Exporter

Run the gesellix CouchDB Prometheus exporter as a Docker container:

```bash
docker run -d \
  -p 9984:9984 \
  -e COUCHDB_URI=http://admin:password@localhost:5984 \
  gesellix/couchdb-prometheus-exporter
```

The exporter listens on port `9984`. Configure Prometheus to scrape and remote_write:

```yaml
scrape_configs:
  - job_name: couchdb
    static_configs:
      - targets: ["localhost:9984"]

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
prometheus.scrape "couchdb" {
  targets    = [{"__address__" = "localhost:9984"}]
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
  prometheus:
    config:
      scrape_configs:
        - job_name: couchdb
          static_configs:
            - targets: ["localhost:9984"]
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

## Key metrics

| Metric | Description |
|--------|-------------|
| `couchdb_httpd_requests_total` | Total HTTP requests received by CouchDB |
| `couchdb_database_open_total` | Total number of times databases have been opened |
| `couchdb_database_reads_total` | Total document read operations across all databases |
| `couchdb_database_writes_total` | Total document write operations across all databases |
| `couchdb_erlang_memory_bytes` | Memory used by the underlying Erlang VM |
| `couchdb_couch_replicator_jobs_running` | Number of active replication jobs currently running |
