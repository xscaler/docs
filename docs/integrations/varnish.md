---
id: varnish
title: Varnish Cache
sidebar_label: Varnish Cache
slug: /integrations/varnish
---

# Varnish Cache

Monitor Varnish Cache using varnish_exporter: cache hit ratio, backend connections, request rates, and object counts.

**Pattern:** varnish_exporter → Prometheus scrape → xScaler remote_write

---

## Prerequisites

- Varnish Cache 6.x+
- `varnish_exporter` binary installed on the same host as the Varnish instance
- The exporter user must have permission to run `varnishstat` (typically requires membership in the `varnish` group)

---

## Option A: Prometheus Exporter

Start varnish_exporter on the Varnish host:

```bash
varnish_exporter --web.listen-address :9131
```

Configure Prometheus to scrape and forward to xScaler:

```yaml
scrape_configs:
  - job_name: varnish
    static_configs:
      - targets: ["localhost:9131"]

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
prometheus.scrape "varnish" {
  targets = [{ __address__ = "localhost:9131" }]
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

## Option C: OpenTelemetry Collector

```yaml
receivers:
  prometheus:
    config:
      scrape_configs:
        - job_name: varnish
          static_configs:
            - targets: ["localhost:9131"]

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

Collect Varnish HTTP access log via varnishncsa. Add the following to your Alloy config:

```river
local.file_match "varnish_logs" {
  path_targets = [{
    __address__ = "localhost",
    __path__    = "/var/log/varnish/varnishncsa.log",
    instance    = constants.hostname,
    job         = "integrations/varnish",
  }]
}

loki.source.file "varnish_logs" {
  targets    = local.file_match.varnish_logs.targets
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
| `varnish_main_cache_hit` | Cumulative cache hit count |
| `varnish_main_cache_miss` | Cumulative cache miss count |
| `varnish_main_backend_conn` | Total successful backend connections established |
| `varnish_main_client_req` | Total client requests received |
| `varnish_sma_g_bytes` | Bytes currently allocated in the shared memory allocator |
| `varnish_main_threads` | Current number of active worker threads |
