---
id: ceph
title: Ceph
sidebar_label: Ceph
slug: /integrations/ceph
---

# Ceph

Monitor Ceph — cluster health, OSD status, pool I/O, PG states, and capacity utilization — using Ceph's built-in MGR Prometheus module.

**Pattern:** Ceph MGR prometheus module → Prometheus scrape → xScaler `remote_write`

---

## Prerequisites

- Ceph Octopus (15.x) or later
- Ceph MGR accessible from Prometheus
- xScaler tenant credentials (token + tenant ID)

---

## Enable Prometheus Module

```bash
ceph mgr module enable prometheus
```

Metrics are exposed at `http://<mgr-host>:9283/metrics`.

---

## Option A — Prometheus

```yaml
scrape_configs:
  - job_name: ceph
    static_configs:
      - targets: ['ceph-mgr-host:9283']
    scrape_interval: 60s

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
prometheus.scrape "ceph" {
  targets         = [{"__address__" = "ceph-mgr-host:9283"}]
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

## Option C — OpenTelemetry Collector

```yaml
receivers:
  prometheus:
    config:
      scrape_configs:
        - job_name: ceph
          static_configs:
            - targets: ['ceph-mgr-host:9283']
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
| `ceph_health_status` | Overall cluster health (0=OK, 1=WARN, 2=ERR) |
| `ceph_cluster_total_bytes` | Total cluster capacity |
| `ceph_cluster_used_bytes` | Used cluster capacity |
| `ceph_osd_in` | OSDs marked in |
| `ceph_osd_up` | OSDs currently up |
| `ceph_pool_rd_bytes` | Pool read throughput |
| `ceph_pool_wr_bytes` | Pool write throughput |
| `ceph_pg_active` | Active placement groups |
