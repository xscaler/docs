---
id: memcached
title: Memcached
sidebar_label: Memcached
slug: /integrations/memcached
---

# Memcached

Monitor Memcached — cache hit ratios, evictions, connection counts, memory usage, and command throughput — using the Prometheus Memcached exporter.

**Pattern:** memcached_exporter → Prometheus scrape → xScaler `remote_write`

---

## Prerequisites

- Memcached 1.5+
- xScaler tenant credentials (token + tenant ID)

---

## Option A — Prometheus Exporter

```bash
docker run -d \
  -p 9150:9150 \
  prom/memcached-exporter \
  --memcached.address=localhost:11211
```

Add to `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: memcached
    static_configs:
      - targets: ['localhost:9150']

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
prometheus.exporter.memcached "cache" {
  address = "localhost:11211"
}

prometheus.scrape "memcached" {
  targets    = prometheus.exporter.memcached.cache.targets
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

```yaml
receivers:
  memcached:
    endpoint: localhost:11211
    collection_interval: 15s

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
      receivers:  [memcached]
      processors: [memory_limiter, batch]
      exporters:  [otlphttp/xscaler]
```

---

## Logs

Collect Memcached server log via systemd journal. Add the following to your Alloy config:

```river
loki.source.journal "memcached_journal" {
  forward_to    = [loki.write.xscaler.receiver]
  relabel_rules = loki.relabel.memcached_journal.rules
  labels = {
    job      = "integrations/memcached",
    instance = constants.hostname,
  }
}

loki.relabel "memcached_journal" {
  forward_to = []
  rule {
    source_labels = ["__journal__systemd_unit"]
    target_label  = "unit"
  }
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
| `memcached_current_items` | Items stored in cache |
| `memcached_current_connections` | Active connections |
| `memcached_commands_total` | Commands processed by type |
| `memcached_get_hits_total` | Cache hits on GET |
| `memcached_get_misses_total` | Cache misses on GET |
| `memcached_evictions_total` | Items evicted due to memory pressure |
| `memcached_bytes` | Current memory used by items |
| `memcached_bytes_read_total` | Total bytes read from clients |
