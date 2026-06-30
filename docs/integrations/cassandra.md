---
id: cassandra
title: Apache Cassandra
sidebar_label: Apache Cassandra
slug: /integrations/cassandra
---

# Apache Cassandra

Monitor Apache Cassandra — read/write latencies, compaction progress, GC pressure, and node health — using the JMX Exporter. Ship Cassandra telemetry to xScaler to detect hotspots and degraded nodes early.

**Pattern:** JMX Exporter agent → Prometheus scrape → xScaler remote_write

---

## Prerequisites

- Apache Cassandra 3.11 or later (including 4.x)
- Java 8 or later
- `jmx_prometheus_javaagent.jar` downloaded from the [Prometheus JMX Exporter releases](https://github.com/prometheus/jmx_exporter/releases)
- xScaler tenant credentials (token + tenant ID)

---

## Option A — Prometheus Exporter

Attach the JMX Exporter as a Java agent in Cassandra's JVM options. Edit `cassandra-env.sh` or set `JVM_OPTS` in your startup script:

```bash
JVM_OPTS="$JVM_OPTS -javaagent:/opt/jmx_exporter.jar=9500:/etc/cassandra/jmx_exporter.yml"
```

Create `/etc/cassandra/jmx_exporter.yml`:

```yaml
lowercaseOutputName: true
rules:
  - pattern: ".*"
```

Restart Cassandra. The exporter listens on port `9500`. Configure Prometheus to scrape and remote_write:

```yaml
scrape_configs:
  - job_name: cassandra
    static_configs:
      - targets: ["localhost:9500"]

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
prometheus.scrape "cassandra" {
  targets    = [{"__address__" = "localhost:9500"}]
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
  jmx:
    jar_path: /opt/opentelemetry-jmx-metrics.jar
    endpoint: localhost:7199
    target_system: cassandra
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
      receivers: [jmx]
      processors: [batch]
      exporters: [otlphttp/xscaler]
```

---

## Logs

Collect Cassandra system log including compaction, GC, and error events. Add the following to your Alloy config:

```river
local.file_match "cassandra_logs" {
  path_targets = [{
    __address__ = "localhost",
    __path__    = "/var/log/cassandra/system.log",
    instance    = constants.hostname,
    job         = "integrations/cassandra",
  }]
}

loki.source.file "cassandra_logs" {
  targets    = local.file_match.cassandra_logs.targets
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
| `cassandra_read_latency_p99` | 99th-percentile read latency in microseconds |
| `cassandra_write_latency_p99` | 99th-percentile write latency in microseconds |
| `cassandra_compaction_completed_tasks` | Total number of compaction tasks completed |
| `cassandra_storage_load_bytes` | Total data size stored on the node |
| `cassandra_jvm_gc_time_ms` | Cumulative GC pause time in milliseconds |
| `cassandra_connected_native_clients` | Current number of connected CQL client connections |
