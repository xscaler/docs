---
id: activemq
title: Apache ActiveMQ
sidebar_label: Apache ActiveMQ
slug: /integrations/activemq
---

# Apache ActiveMQ

Monitor Apache ActiveMQ broker health using the JMX Exporter: queue depth, consumer counts, message throughput, and broker memory usage.

**Pattern:** JMX Exporter agent → Prometheus scrape → xScaler `remote_write`

---

## Prerequisites

- Apache ActiveMQ 5.15+ or ActiveMQ Artemis 2.x
- Java 8+
- xScaler tenant credentials (token + tenant ID)

---

## Option A: Prometheus Exporter

Download the JMX Exporter agent jar and create a config file `/etc/activemq/jmx_exporter.yml`:

```yaml
lowercaseOutputName: true
rules:
  - pattern: 'org.apache.activemq<type=Broker, brokerName=(.+)><>(.+):'
    name: activemq_broker_$2
    labels:
      broker: "$1"
  - pattern: 'org.apache.activemq<type=Queue, brokerName=(.+), destinationName=(.+)><>(.+):'
    name: activemq_queue_$3
    labels:
      broker: "$1"
      queue: "$2"
```

Add to `ACTIVEMQ_OPTS` in `activemq.conf`:

```bash
ACTIVEMQ_OPTS="$ACTIVEMQ_OPTS -javaagent:/opt/jmx_exporter.jar=9292:/etc/activemq/jmx_exporter.yml"
```

Add to `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: activemq
    static_configs:
      - targets: ['localhost:9292']

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
prometheus.scrape "activemq" {
  targets    = [{"__address__" = "localhost:9292"}]
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
    endpoint: localhost:1099
    target_system: activemq
    collection_interval: 30s

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
      receivers:  [jmx]
      processors: [memory_limiter, batch]
      exporters:  [otlphttp/xscaler]
```

---

## Logs

Collect ActiveMQ broker log. Add the following to your Alloy config:

```river
local.file_match "activemq_logs" {
  path_targets = [{
    __address__ = "localhost",
    __path__    = "/opt/activemq/data/activemq.log",
    instance    = constants.hostname,
    job         = "integrations/activemq",
  }]
}

loki.source.file "activemq_logs" {
  targets    = local.file_match.activemq_logs.targets
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
| `activemq_queue_queue_size` | Number of messages in the queue |
| `activemq_queue_consumer_count` | Active consumers on the queue |
| `activemq_queue_enqueue_count` | Total messages enqueued |
| `activemq_queue_dequeue_count` | Total messages dequeued |
| `activemq_broker_memory_percent_usage` | Broker memory usage percentage |
| `activemq_broker_store_percent_usage` | Disk store usage percentage |
| `activemq_broker_temp_percent_usage` | Temp storage usage percentage |
| `activemq_broker_total_connections_count` | Total broker connections |
