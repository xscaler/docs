---
id: rclone
title: rclone
sidebar_label: rclone
slug: /integrations/rclone
---

# rclone

Monitor rclone sync operations — bytes transferred, transfer errors, file counts, and cache stats — using rclone's built-in metrics endpoint.

**Pattern:** rclone /metrics → Prometheus scrape → xScaler `remote_write`

---

## Prerequisites

- rclone 1.55+
- xScaler tenant credentials (token + tenant ID)

---

## Enable Metrics

Start rclone with the remote control API enabled:

```bash
rclone serve ... --rc --rc-addr :5572 --rc-no-auth
```

Or for `rclone mount`:

```bash
rclone mount remote:path /mnt/point --rc --rc-addr :5572
```

Metrics are at `http://localhost:5572/metrics`.

---

## Option A — Prometheus

```yaml
scrape_configs:
  - job_name: rclone
    static_configs:
      - targets: ['localhost:5572']
    metrics_path: /metrics

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
prometheus.scrape "rclone" {
  targets      = [{"__address__" = "localhost:5572"}]
  metrics_path = "/metrics"
  forward_to   = [prometheus.remote_write.xscaler.receiver]
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
        - job_name: rclone
          static_configs:
            - targets: ['localhost:5572']
          metrics_path: /metrics

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

Collect rclone sync/copy log — capture stdout with `--log-file` flag and tail the output. Add the following to your Alloy config, adjusting `__path__` to match your application's log file location:

```river
local.file_match "rclone_logs" {
  path_targets = [{
    __address__ = "localhost",
    __path__    = "/var/log/rclone/app.log",
    instance    = constants.hostname,
    job         = "integrations/rclone",
  }]
}

loki.source.file "rclone_logs" {
  targets    = local.file_match.rclone_logs.targets
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
| `rclone_bytes_transferred_total` | Total bytes transferred |
| `rclone_transfer_errors_total` | Transfer errors |
| `rclone_files_transferred_total` | Files transferred successfully |
| `rclone_checks_total` | Files checked |
| `rclone_vfs_cache_files_total` | Files in VFS cache |
| `rclone_transfer_time_seconds` | Duration of transfers |
