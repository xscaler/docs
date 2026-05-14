---
id: ubiquiti
title: Ubiquiti EdgeRouter
sidebar_label: Ubiquiti EdgeRouter
slug: /integrations/ubiquiti
---

# Ubiquiti EdgeRouter

Monitor Ubiquiti EdgeRouter — interface throughput, CPU/memory, routing table size, and connection stats — using SNMP Exporter.

**Pattern:** SNMP Exporter → Prometheus scrape → xScaler `remote_write`

---

## Prerequisites

- EdgeRouter 2.x+, SNMP v2c enabled
- snmp_exporter binary
- xScaler tenant credentials (token + tenant ID)

---

## Enable SNMP on EdgeRouter

```bash
configure
set service snmp community public authorization ro
set service snmp community public network 0.0.0.0/0
commit; save
```

---

## Option A — Prometheus Exporter

```bash
./snmp_exporter --config.file=snmp.yml
```

Prometheus config:

```yaml
scrape_configs:
  - job_name: ubiquiti
    static_configs:
      - targets: ['192.168.1.1']
    metrics_path: /snmp
    params:
      module: [if_mib]
    relabel_configs:
      - source_labels: [__address__]
        target_label: __param_target
      - target_label: __address__
        replacement: localhost:9116

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
prometheus.exporter.snmp "edgerouter" {
  config_file = "/etc/alloy/snmp.yml"
  targets = [{
    name   = "edgerouter"
    target = "192.168.1.1"
    module = "if_mib"
  }]
}

prometheus.scrape "ubiquiti" {
  targets    = prometheus.exporter.snmp.edgerouter.targets
  forward_to = [prometheus.remote_write.xscaler.receiver]
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
  snmp:
    collection_interval: 60s
    targets:
      - endpoint: udp://192.168.1.1:161
        community: public
        version: v2c

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
      receivers:  [snmp]
      processors: [batch]
      exporters:  [otlphttp/xscaler]
```

---

## Key metrics

| Metric | Description |
|--------|-------------|
| `ifInOctets` | Bytes received per interface |
| `ifOutOctets` | Bytes transmitted per interface |
| `ifInErrors` | Inbound errors per interface |
| `ifOutErrors` | Outbound errors per interface |
| `ifOperStatus` | Interface operational status |
| `sysUpTime` | System uptime |
| `ipForwDatagrams` | IP datagrams forwarded |
