---
id: hbase
title: Apache HBase
sidebar_label: Apache HBase
slug: /integrations/hbase
---

# Apache HBase

Monitor Apache HBase — region server load, compaction queues, memstore usage, and RPC latency — using the JMX Exporter. Detect performance bottlenecks in your HBase cluster early using xScaler dashboards and alerts.

**Pattern:** JMX Exporter agent → Prometheus scrape → xScaler remote_write

---

## Prerequisites

- Apache HBase 2.x
- Java 8 or later
- `jmx_prometheus_javaagent.jar` downloaded from the [Prometheus JMX Exporter releases](https://github.com/prometheus/jmx_exporter/releases)
- xScaler tenant credentials (token + tenant ID)

---

## Option A — Prometheus Exporter

Attach the JMX Exporter Java agent to both the HBase Master and RegionServer JVMs. Add the following to `hbase-env.sh`:

```bash
# For HBase Master
export HBASE_MASTER_OPTS="$HBASE_MASTER_OPTS \
  -javaagent:/opt/jmx_exporter.jar=9515:/etc/hbase/jmx_exporter.yml"

# For HBase RegionServer
export HBASE_REGIONSERVER_OPTS="$HBASE_REGIONSERVER_OPTS \
  -javaagent:/opt/jmx_exporter.jar=9515:/etc/hbase/jmx_exporter.yml"
```

Create `/etc/hbase/jmx_exporter.yml`:

```yaml
lowercaseOutputName: true
rules:
  - pattern: "Hadoop<service=HBase, name=(.+)><>(\\w+)"
    name: hbase_$1_$2
    labels:
      service: "$1"
```

Restart HBase. The exporter listens on port `9515`. Configure Prometheus to scrape and remote_write:

```yaml
scrape_configs:
  - job_name: hbase
    static_configs:
      - targets:
          - "hbase-master:9515"
          - "hbase-regionserver-1:9515"
          - "hbase-regionserver-2:9515"

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
prometheus.scrape "hbase" {
  targets = [
    {"__address__" = "hbase-master:9515"},
    {"__address__" = "hbase-regionserver-1:9515"},
    {"__address__" = "hbase-regionserver-2:9515"},
  ]
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
    endpoint: localhost:10102
    target_system: hbase
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

## Key metrics

| Metric | Description |
|--------|-------------|
| `hbase_regionserver_readrequestcount` | Total read requests handled by each RegionServer |
| `hbase_regionserver_writerequestcount` | Total write requests handled by each RegionServer |
| `hbase_regionserver_memstoresize` | Total memstore size in bytes across all regions on the server |
| `hbase_regionserver_compactionqueuelength` | Number of compaction tasks waiting to be executed |
| `hbase_master_numdeadregionservers` | Number of RegionServers currently considered dead by the Master |
| `hbase_jvm_gc_time_millis` | Cumulative garbage collection pause time in milliseconds |
