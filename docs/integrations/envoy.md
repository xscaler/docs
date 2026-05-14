---
id: envoy
title: Envoy Proxy
sidebar_label: Envoy Proxy
slug: /integrations/envoy
---

# Envoy Proxy

Monitor Envoy proxy — downstream/upstream connections, request rates, circuit breaker status, and health check results — using Envoy's built-in stats endpoint.

**Pattern:** Envoy /stats/prometheus → Prometheus scrape → xScaler remote_write

---

## Prerequisites

- Envoy 1.14+
- Admin interface enabled (start Envoy with `--admin-address-path /dev/null` or configure admin in the bootstrap config)
- Admin port accessible (default 9901)

---

## Enabling the Envoy admin interface

In your Envoy bootstrap YAML, add:

```yaml
admin:
  address:
    socket_address:
      address: 0.0.0.0
      port_value: 9901
```

Prometheus-formatted stats are available at `http://localhost:9901/stats/prometheus`.

---

## Option A — Prometheus Exporter

Scrape Envoy's built-in Prometheus stats endpoint:

```yaml
scrape_configs:
  - job_name: envoy
    static_configs:
      - targets: ["localhost:9901"]
    metrics_path: /stats/prometheus

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
prometheus.scrape "envoy" {
  targets      = [{ __address__ = "localhost:9901" }]
  metrics_path = "/stats/prometheus"
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
        - job_name: envoy
          static_configs:
            - targets: ["localhost:9901"]
          metrics_path: /stats/prometheus

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
| `envoy_cluster_upstream_rq_total` | Total upstream requests sent to a cluster |
| `envoy_cluster_upstream_cx_active` | Currently active upstream connections per cluster |
| `envoy_http_downstream_rq_total` | Total downstream requests received by HTTP filters |
| `envoy_listener_downstream_cx_active` | Active downstream connections per listener |
| `envoy_cluster_circuit_breakers_open` | Indicates whether a circuit breaker is currently open |
| `envoy_server_total_connections` | Total current connections to the Envoy server |
