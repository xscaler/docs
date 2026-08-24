---
id: hadoop
title: Apache Hadoop
sidebar_label: Apache Hadoop
slug: /integrations/hadoop
---

# Apache Hadoop

Monitor Apache Hadoop using the JMX Exporter: NameNode health, DataNode disk usage, HDFS block counts, MapReduce job queues, and JVM GC.

**Pattern:** JMX Exporter agent → Prometheus scrape → xScaler `remote_write`

---

## Prerequisites

- Apache Hadoop 3.x
- Java 8+
- xScaler tenant credentials (token + tenant ID)

---

## Option A: Prometheus Exporter

Attach the JMX Exporter to NameNode and DataNode:

```bash
# Add to hadoop-env.sh
export HADOOP_NAMENODE_OPTS="$HADOOP_NAMENODE_OPTS \
  -javaagent:/opt/jmx_exporter.jar=9870:/etc/hadoop/jmx_nn.yml"

export HADOOP_DATANODE_OPTS="$HADOOP_DATANODE_OPTS \
  -javaagent:/opt/jmx_exporter.jar=9864:/etc/hadoop/jmx_dn.yml"
```

Add to `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: hadoop_namenode
    static_configs:
      - targets: ['namenode-host:9870']
  - job_name: hadoop_datanode
    static_configs:
      - targets: ['datanode1:9864', 'datanode2:9864']

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
prometheus.scrape "hadoop" {
  targets = [
    {"__address__" = "namenode-host:9870", job = "namenode"},
    {"__address__" = "datanode1:9864",     job = "datanode"},
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

---

## Option C: OpenTelemetry Collector

```yaml
receivers:
  jmx:
    jar_path: /opt/opentelemetry-jmx-metrics.jar
    endpoint: localhost:8004
    target_system: hadoop
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

Collect Hadoop NameNode, DataNode, and ResourceManager logs. Add the following to your Alloy config:

```river
local.file_match "hadoop_logs" {
  path_targets = [{
    __address__ = "localhost",
    __path__    = "/opt/hadoop/logs/*.log",
    instance    = constants.hostname,
    job         = "integrations/hadoop",
  }]
}

loki.source.file "hadoop_logs" {
  targets    = local.file_match.hadoop_logs.targets
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
| `hadoop_namenode_total_blocks` | Total HDFS blocks |
| `hadoop_namenode_total_files` | Total files in HDFS |
| `hadoop_namenode_capacity_remaining` | HDFS available capacity |
| `hadoop_namenode_dead_nodes` | Number of dead DataNodes |
| `hadoop_datanode_bytes_written` | Bytes written by DataNode |
| `hadoop_datanode_bytes_read` | Bytes read by DataNode |
| `hadoop_jvm_gc_count` | JVM GC count |
