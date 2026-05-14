---
id: opensearch
title: OpenSearch
sidebar_label: OpenSearch
slug: /integrations/opensearch
---

# OpenSearch

Monitor OpenSearch cluster health, indexing throughput, search latency, and JVM usage using the prometheus-exporter plugin. Keep your search infrastructure observable alongside the rest of your stack in xScaler.

**Pattern:** OpenSearch prometheus-exporter plugin → Prometheus scrape → xScaler remote_write

---

## Prerequisites

- OpenSearch 1.0 or later
- `prometheus-exporter` plugin installed on each node
- xScaler tenant credentials (token + tenant ID)

---

## Option A — Prometheus Exporter

Install the prometheus-exporter plugin on each OpenSearch node, then restart the service:

```bash
bin/opensearch-plugin install prometheus-exporter
# Restart OpenSearch after installation
sudo systemctl restart opensearch
```

OpenSearch will now expose metrics at `:9200/_prometheus/metrics`. Configure Prometheus to scrape and remote_write:

```yaml
scrape_configs:
  - job_name: opensearch
    metrics_path: /_prometheus/metrics
    static_configs:
      - targets: ["localhost:9200"]

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
prometheus.scrape "opensearch" {
  targets = [{
    "__address__"      = "localhost:9200",
    "__metrics_path__" = "/_prometheus/metrics",
  }]
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
  elasticsearch:
    endpoint: http://localhost:9200
    username: admin
    password: <password>
    collection_interval: 30s

processors:
  batch: {}

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
      receivers: [elasticsearch]
      processors: [batch]
      exporters: [otlphttp/xscaler]
```

---

## Key metrics

| Metric | Description |
|--------|-------------|
| `opensearch_cluster_status` | Cluster health status (0 = green, 1 = yellow, 2 = red) |
| `opensearch_indices_docs_count` | Total number of documents across all indices |
| `opensearch_indices_store_size_bytes` | Total on-disk size of all indices in bytes |
| `opensearch_jvm_mem_heap_used_percent` | JVM heap memory used as a percentage of the configured maximum |
| `opensearch_thread_pool_queue_count` | Number of tasks queued in each thread pool |
| `opensearch_search_query_time_seconds` | Cumulative time spent executing search queries |
