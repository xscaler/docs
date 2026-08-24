---
id: presto
title: Presto / Trino
sidebar_label: Presto / Trino
slug: /integrations/presto
---

# Presto / Trino

Monitor Presto or Trino using the JMX Exporter agent: active queries, queued queries, completed query rates, failed queries, and cluster CPU/memory.

**Pattern:** JMX Exporter agent → Prometheus scrape → xScaler `remote_write`

---

## Prerequisites

- Presto 0.280+ or Trino 400+
- Java 11+
- xScaler tenant credentials (token + tenant ID)

---

## Option A: Prometheus Exporter

Attach the JMX Exporter to the coordinator and workers:

```bash
# Add to jvm.config
-javaagent:/opt/jmx_exporter.jar=9483:/etc/presto/jmx_exporter.yml
```

Example `jmx_exporter.yml` for Presto/Trino:

```yaml
lowercaseOutputName: true
rules:
  - pattern: 'trino.execution<name=QueryManager><>(.*)'
    name: trino_query_manager_$1
  - pattern: 'trino.execution<name=TaskManager><>(.*)'
    name: trino_task_manager_$1
```

Add to `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: presto
    static_configs:
      - targets: ['coordinator-host:9483']

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
prometheus.scrape "presto" {
  targets    = [{"__address__" = "coordinator-host:9483"}]
  forward_to = [prometheus.remote_write.xscaler.receiver]
  scrape_interval = "30s"
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
  jmx:
    jar_path: /opt/opentelemetry-jmx-metrics.jar
    endpoint: coordinator-host:9999
    target_system: jvm
    collection_interval: 30s

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
      receivers:  [jmx]
      processors: [batch]
      exporters:  [otlphttp/xscaler]
```

---

## Logs

Collect Presto/Trino coordinator and worker logs. Add the following to your Alloy config:

```river
local.file_match "presto_logs" {
  path_targets = [{
    __address__ = "localhost",
    __path__    = "/var/log/presto/server.log",
    instance    = constants.hostname,
    job         = "integrations/presto",
  }]
}

loki.source.file "presto_logs" {
  targets    = local.file_match.presto_logs.targets
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
| `trino_query_manager_running_queries` | Currently running queries |
| `trino_query_manager_queued_queries` | Queries in the queue |
| `trino_query_manager_completed_queries` | Completed queries per minute |
| `trino_query_manager_failed_queries` | Failed queries per minute |
| `trino_query_manager_consumed_cpu_time` | CPU time consumed by queries |
| `trino_cluster_memory_pool_free_distributed_bytes` | Free distributed memory |
