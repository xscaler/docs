---
id: ceph
title: Ceph
sidebar_label: Ceph
slug: /integrations/ceph
---

# Ceph

Monitor Ceph using its built-in MGR Prometheus module: cluster health, OSD status, pool I/O, PG states, and capacity utilisation.

**Pattern:** Ceph MGR prometheus module → Prometheus scrape → xScaler `remote_write`

---

## Prerequisites

- Ceph Octopus (15.x) or later
- Ceph MGR accessible from Prometheus
- xScaler tenant credentials (token + tenant ID)

---

## Enable Prometheus module

```bash
ceph mgr module enable prometheus
```

Metrics are exposed at `http://<mgr-host>:9283/metrics`.

---

## Option A: Prometheus

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

## Option B: Grafana Alloy

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

## Option C: OpenTelemetry Collector

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

## Logs

Collect Ceph cluster log including OSD, MON, and MDS events. Add the following to your Alloy config:

```river
local.file_match "ceph_logs" {
  path_targets = [{
    __address__ = "localhost",
    __path__    = "/var/log/ceph/ceph.log",
    instance    = constants.hostname,
    job         = "integrations/ceph",
  }]
}

loki.source.file "ceph_logs" {
  targets    = local.file_match.ceph_logs.targets
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
| `ceph_health_status` | Overall cluster health (0=OK, 1=WARN, 2=ERR) |
| `ceph_cluster_total_bytes` | Total cluster capacity |
| `ceph_cluster_used_bytes` | Used cluster capacity |
| `ceph_osd_in` | OSDs marked in |
| `ceph_osd_up` | OSDs currently up |
| `ceph_pool_rd_bytes` | Pool read throughput |
| `ceph_pool_wr_bytes` | Pool write throughput |
| `ceph_pg_active` | Active placement groups |
