---
id: caddy
title: Caddy
sidebar_label: Caddy
slug: /integrations/caddy
---

# Caddy

Monitor Caddy web server using its built-in Prometheus metrics endpoint: request rates, response latencies, active connections, and TLS handshake stats.

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

## Option A: Prometheus Exporter

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

## Option B: Grafana Alloy

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

## Option C: OpenTelemetry Collector

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

## Logs

Collect Caddy access and error events via systemd journal. Add the following to your Alloy config:

```river
loki.source.journal "caddy_journal" {
  forward_to    = [loki.write.xscaler.receiver]
  relabel_rules = loki.relabel.caddy_journal.rules
  labels = {
    job      = "integrations/caddy",
    instance = constants.hostname,
  }
}

loki.relabel "caddy_journal" {
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

## Key metrics

| Metric | Description |
|--------|-------------|
| `caddy_http_requests_in_flight` | Current number of active HTTP requests being handled |
| `caddy_http_request_duration_seconds` | Histogram of HTTP request processing time |
| `caddy_http_response_size_bytes` | Histogram of HTTP response body size |
| `caddy_tls_handshake_duration_seconds` | Histogram of TLS handshake completion time |
| `caddy_reverse_proxy_upstreams_healthy_total` | Number of healthy upstream backends |
