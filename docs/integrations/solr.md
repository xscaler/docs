---
id: solr
title: Apache Solr
sidebar_label: Apache Solr
slug: /integrations/solr
---

# Apache Solr

Monitor Apache Solr using the Solr Prometheus Exporter: query rates, cache hit ratios, index size, JVM heap, and replication status.

**Pattern:** solr-exporter → Prometheus scrape → xScaler `remote_write`

---

## Prerequisites

- Apache Solr 7.x+
- xScaler tenant credentials (token + tenant ID)

---

## Option A: Prometheus Exporter

The Solr Prometheus Exporter ships with Solr (in `contrib/prometheus-exporter/`):

```bash
./bin/solr-exporter \
  -p 9983 \
  -b http://localhost:8983/solr \
  -f contrib/prometheus-exporter/conf/solr-exporter-config.xml
```

Add to `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: solr
    static_configs:
      - targets: ['localhost:9983']

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
prometheus.scrape "solr" {
  targets    = [{"__address__" = "localhost:9983"}]
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
        - job_name: solr
          static_configs:
            - targets: ['localhost:9983']

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

Collect Solr server log. Add the following to your Alloy config:

```river
local.file_match "solr_logs" {
  path_targets = [{
    __address__ = "localhost",
    __path__    = "/var/solr/logs/solr.log",
    instance    = constants.hostname,
    job         = "integrations/solr",
  }]
}

loki.source.file "solr_logs" {
  targets    = local.file_match.solr_logs.targets
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
| `solr_requests_total` | Total requests by handler |
| `solr_errors_total` | Request errors |
| `solr_request_time_seconds` | Request latency histogram |
| `solr_cache_hit_ratio` | Filter/query cache hit ratio |
| `solr_searcher_numdocs` | Documents in current searcher |
| `solr_jvm_memory_heap_used_bytes` | JVM heap usage |
| `solr_replication_index_size_bytes` | Index size for replication |
