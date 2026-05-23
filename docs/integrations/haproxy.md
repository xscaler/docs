---
id: haproxy
title: HAProxy
sidebar_label: HAProxy
slug: /integrations/haproxy
---

# HAProxy

Monitor HAProxy frontend/backend request rates, error rates, queue depths, and server health.

![HAProxy Dashboard](https://grafana.com/api/dashboards/12693/images/8600/image)

## Key Metrics

| Metric | Description |
|--------|-------------|
| `haproxy_frontend_http_requests_total` | HTTP requests per frontend |
| `haproxy_backend_http_responses_total` | HTTP responses per backend |
| `haproxy_backend_current_queue` | Current request queue depth |
| `haproxy_frontend_bytes_in_total` | Bytes received |
| `haproxy_server_status` | Backend server health (1=UP) |
| `haproxy_backend_connection_errors_total` | Connection errors |

## Prerequisites

- HAProxy 2.0+ with the stats endpoint or Prometheus exporter enabled
- Network access to the stats port

## Configuration

**Enable the Prometheus exporter in haproxy.cfg**

```
frontend stats
    bind *:9101
    http-request use-service prometheus-exporter if { path /metrics }
    stats enable
    stats uri /stats
```

### Option A — Prometheus scrape

```yaml
scrape_configs:
  - job_name: haproxy
    static_configs:
      - targets: ['localhost:9101']

remote_write:
  - url: https://<region>.xscalerlabs.com/api/v1/push
    headers:
      X-Scope-OrgID: <tenant-id>
    basic_auth:
      password: <api-token>
```

### Option B — Grafana Alloy

```alloy
prometheus.scrape "haproxy" {
  targets = [{"__address__" = "localhost:9101"}]
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

### Option C — OpenTelemetry Collector

```yaml
receivers:
  prometheus:
    config:
      scrape_configs:
        - job_name: haproxy
          static_configs:
            - targets: ['localhost:9101']

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

Collect HAProxy traffic and error log. Add the following to your Alloy config:

```river
local.file_match "haproxy_logs" {
  path_targets = [{
    __address__ = "localhost",
    __path__    = "/var/log/haproxy.log",
    instance    = constants.hostname,
    job         = "integrations/haproxy",
  }]
}

loki.source.file "haproxy_logs" {
  targets    = local.file_match.haproxy_logs.targets
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

