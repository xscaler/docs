---
id: cockroachdb
title: CockroachDB
sidebar_label: CockroachDB
slug: /integrations/cockroachdb
---

# CockroachDB

Collect metrics from CockroachDB — SQL throughput, replication health, storage usage, and node liveness — using CockroachDB's built-in Prometheus endpoint. No additional exporter is required.

**Pattern:** CockroachDB /_status/vars → Prometheus scrape → xScaler remote_write

---

## Prerequisites

- CockroachDB 21.1 or later
- Network access to the CockroachDB HTTP port (default: 8080)
- xScaler tenant credentials (token + tenant ID)

---

## Option A — Prometheus Exporter

CockroachDB exposes a native Prometheus endpoint at `/_status/vars` on its HTTP port. No exporter installation is needed — point Prometheus directly at each node:

```yaml
scrape_configs:
  - job_name: cockroachdb
    metrics_path: /_status/vars
    scheme: http
    static_configs:
      - targets:
          - "cockroach-node-1:8080"
          - "cockroach-node-2:8080"
          - "cockroach-node-3:8080"
    scrape_interval: 30s

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
prometheus.scrape "cockroachdb" {
  targets = [
    {"__address__" = "cockroach-node-1:8080", "__metrics_path__" = "/_status/vars"},
    {"__address__" = "cockroach-node-2:8080", "__metrics_path__" = "/_status/vars"},
    {"__address__" = "cockroach-node-3:8080", "__metrics_path__" = "/_status/vars"},
  ]
  scrape_interval = "30s"
  forward_to      = [prometheus.remote_write.xscaler.receiver]
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
        - job_name: cockroachdb
          metrics_path: /_status/vars
          static_configs:
            - targets:
                - "cockroach-node-1:8080"
                - "cockroach-node-2:8080"
                - "cockroach-node-3:8080"
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
| `sql_conns` | Current number of active SQL client connections |
| `sql_txn_commit_count` | Total number of committed SQL transactions |
| `sql_txn_rollback_count` | Total number of rolled-back SQL transactions |
| `rebalances_leaseTransfers` | Number of lease transfers initiated for rebalancing |
| `capacity_used` | Storage capacity currently used across all nodes in bytes |
| `ranges_underreplicated` | Number of ranges with fewer replicas than the replication factor |
| `liveness_livenodes` | Number of nodes currently considered live by the cluster |
