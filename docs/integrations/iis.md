---
id: iis
title: Microsoft IIS
sidebar_label: Microsoft IIS
slug: /integrations/iis
---

# Microsoft IIS

Monitor Microsoft IIS — request rates, active connections, send/receive bytes, and application pool status — using windows_exporter with the IIS collector.

**Pattern:** windows_exporter (IIS collector) → Prometheus scrape → xScaler remote_write

---

## Prerequisites

- Windows Server 2016+
- IIS installed and running
- [windows_exporter](https://github.com/prometheus-community/windows_exporter/releases) installed on the server
- Firewall rule allowing inbound access to port 9182

---

## Option A — Prometheus Exporter

Install windows_exporter with the IIS, CPU, memory, and network collectors enabled. Run from PowerShell (or configure as a Windows Service):

```powershell
.\windows_exporter.exe --collectors.enabled "iis,cpu,memory,net"
```

The exporter listens on port `9182` by default. Configure Prometheus to scrape and forward to xScaler:

```yaml
scrape_configs:
  - job_name: iis
    static_configs:
      - targets: ["<windows-host>:9182"]

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
prometheus.scrape "iis" {
  targets = [{ __address__ = "<windows-host>:9182" }]
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

---

## Option C — OpenTelemetry Collector

Use the `windowsperfcounters` receiver to collect IIS performance counters directly:

```yaml
receivers:
  windowsperfcounters:
    metrics:
      iis.current_connections:
        description: "Current connections to IIS"
        unit: "{connections}"
        gauge:
    collection_interval: 30s
    perfcounters:
      - object: "Web Service"
        instances: ["_Total"]
        counters:
          - name: "Current Connections"
            metric: iis.current_connections
          - name: "Total Get Requests"
            metric: iis.get_requests_total
          - name: "Bytes Sent/sec"
            metric: iis.bytes_sent
          - name: "Bytes Received/sec"
            metric: iis.bytes_received

processors:
  memory_limiter:
    check_interval: 1s
    limit_mib: 256
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
      receivers:  [windowsperfcounters]
      processors: [memory_limiter, batch]
      exporters:  [otlphttp/xscaler]
```

---

## Logs

Collect IIS access logs from all sites. Add the following to your Alloy config:

```river
local.file_match "iis_logs" {
  path_targets = [{
    __address__ = "localhost",
    __path__    = "C:\inetpub\logs\LogFiles\**\*.log",
    instance    = constants.hostname,
    job         = "integrations/iis",
  }]
}

loki.source.file "iis_logs" {
  targets    = local.file_match.iis_logs.targets
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
| `windows_iis_current_connections` | Current active connections across all IIS sites |
| `windows_iis_requests_total` | Cumulative total HTTP requests received |
| `windows_iis_received_bytes_total` | Total bytes received by IIS |
| `windows_iis_sent_bytes_total` | Total bytes sent by IIS |
| `windows_iis_worker_process_virtual_bytes` | Virtual memory used by IIS worker processes |
| `windows_iis_anonymous_users_total` | Total anonymous user requests handled |
