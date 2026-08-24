---
id: etcd
title: etcd
sidebar_label: etcd
slug: /integrations/etcd
---

# etcd

Monitor etcd Raft proposals, leader elections, disk fsync latency, and database size.

![etcd Dashboard](https://grafana.com/api/dashboards/3070/images/1906/image)

## Key metrics

| Metric | Description |
|--------|-------------|
| `etcd_server_has_leader` | Whether a leader exists (1=yes) |
| `etcd_server_leader_changes_seen_total` | Leader election count |
| `etcd_server_proposals_committed_total` | Raft proposals committed |
| `etcd_mvcc_db_total_size_in_bytes` | Backend database size |
| `etcd_disk_wal_fsync_duration_seconds` | WAL fsync latency histogram |
| `etcd_network_peer_round_trip_time_seconds` | Peer network RTT |

## Prerequisites

- etcd 3.3+
- etcd exposes Prometheus metrics on port `2379` by default

## Configuration

etcd exposes metrics natively at `http://localhost:2379/metrics`.

### Option A: Prometheus scrape

```yaml
scrape_configs:
  - job_name: etcd
    static_configs:
      - targets: ['localhost:2379']

remote_write:
  - url: https://<region>.xscalerlabs.com/api/v1/push
    headers:
      X-Scope-OrgID: <tenant-id>
    basic_auth:
      password: <api-token>
```

### Option B: Grafana Alloy

```alloy
prometheus.scrape "etcd" {
  targets    = [{"__address__" = "localhost:2379"}]
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

### Option C: OpenTelemetry Collector

```yaml
receivers:
  prometheus:
    config:
      scrape_configs:
        - job_name: etcd
          static_configs:
            - targets: ['localhost:2379']

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

Collect etcd server log via systemd journal. Add the following to your Alloy config:

```river
loki.source.journal "etcd_journal" {
  forward_to    = [loki.write.xscaler.receiver]
  relabel_rules = loki.relabel.etcd_journal.rules
  labels = {
    job      = "integrations/etcd",
    instance = constants.hostname,
  }
}

loki.relabel "etcd_journal" {
  forward_to = []
  rule {
    source_labels = ["__journal__systemd_unit"]
    target_label  = "unit"
  }
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

