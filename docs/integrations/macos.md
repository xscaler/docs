---
id: macos
title: macOS
sidebar_label: macOS
slug: /integrations/macos
---

# macOS

Collect system metrics from macOS hosts using node_exporter (Darwin build). Ship CPU, memory, disk, and network telemetry to xScaler with minimal configuration.

**Pattern:** node_exporter → Prometheus scrape → xScaler remote_write

---

## Prerequisites

- macOS 11 or later
- Homebrew installed
- xScaler tenant credentials (token + tenant ID)

---

## Option A — Prometheus Exporter

Install and start node_exporter using Homebrew:

```bash
brew install node_exporter
brew services start node_exporter
```

node_exporter will listen on port `9100`. Configure your Prometheus instance to scrape it and remote_write to xScaler:

```yaml
scrape_configs:
  - job_name: macos
    static_configs:
      - targets: ["localhost:9100"]

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
prometheus.scrape "macos" {
  targets = [{"__address__" = "localhost:9100"}]
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
  hostmetrics:
    collection_interval: 30s
    scrapers:
      cpu: {}
      disk: {}
      filesystem: {}
      load: {}
      memory: {}
      network: {}

processors:
  batch: {}
  resourcedetection:
    detectors: [system]

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
      receivers: [hostmetrics]
      processors: [resourcedetection, batch]
      exporters: [otlphttp/xscaler]
```

---

## Logs

Collect system log and all `.log` files under `/var/log/`. Add the following to your Alloy config:

```river
local.file_match "macos_logs" {
  path_targets = [{
    __address__ = "localhost",
    __path__    = "/var/log/*.log",
    instance    = constants.hostname,
    job         = "integrations/macos",
  }]
}

loki.source.file "macos_logs" {
  targets    = local.file_match.macos_logs.targets
  forward_to = [loki.write.xscaler.receiver]
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
| `node_cpu_seconds_total` | Cumulative CPU time spent in each mode (user, system, idle) |
| `node_memory_active_bytes` | Memory currently in use by active processes |
| `node_filesystem_avail_bytes` | Available space on each mounted filesystem |
| `node_disk_read_bytes_total` | Total bytes read from disk devices |
| `node_network_receive_bytes_total` | Total bytes received on each network interface |
| `node_load1` | 1-minute system load average |
