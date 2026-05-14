---
id: caddy
title: Caddy
sidebar_label: Caddy
slug: /integrations/caddy
---

# Caddy

Monitor Caddy web server — request rates, response latencies, active connections, and TLS handshake stats — using Caddy's built-in Prometheus metrics endpoint.

**Pattern:** Caddy /metrics → Prometheus scrape → xScaler remote_write

---

## Prerequisites

- Caddy 2.x
- `metrics` directive enabled in the Caddyfile or JSON config
- Admin API accessible (default `localhost:2019`)

---

## Enabling Caddy metrics

Add the `metrics` directive to your Caddyfile global block:

```caddyfile
{
  admin localhost:2019
  metrics
}

example.com {
  reverse_proxy localhost:8080
}
```

Caddy exposes metrics at `http://localhost:2019/metrics`.

---

## Option A — Prometheus Exporter

Scrape the Caddy admin API metrics endpoint directly:

```yaml
scrape_configs:
  - job_name: caddy
    static_configs:
      - targets: ["localhost:2019"]
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
prometheus.scrape "caddy" {
  targets      = [{ __address__ = "localhost:2019" }]
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
        - job_name: caddy
          static_configs:
            - targets: ["localhost:2019"]
          metrics_path: /metrics

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
      receivers:  [prometheus]
      processors: [memory_limiter, batch]
      exporters:  [otlphttp/xscaler]
```

---

## Key metrics

| Metric | Description |
|--------|-------------|
| `caddy_http_requests_in_flight` | Current number of active HTTP requests being handled |
| `caddy_http_request_duration_seconds` | Histogram of HTTP request processing time |
| `caddy_http_response_size_bytes` | Histogram of HTTP response body size |
| `caddy_tls_handshake_duration_seconds` | Histogram of TLS handshake completion time |
| `caddy_reverse_proxy_upstreams_healthy_total` | Number of healthy upstream backends |
