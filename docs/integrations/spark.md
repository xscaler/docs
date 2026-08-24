---
id: spark
title: Apache Spark
sidebar_label: Apache Spark
slug: /integrations/spark
---

# Apache Spark

Monitor Apache Spark using the Spark Prometheus Sink: executor CPU/memory, task counts, shuffle I/O, GC time, and streaming micro-batch latencies.

**Pattern:** Spark PrometheusServlet → Prometheus scrape → xScaler `remote_write`

---

## Prerequisites

- Apache Spark 3.x
- xScaler tenant credentials (token + tenant ID)

---

## Enable Prometheus sink

Add to `conf/metrics.properties`:

```properties
*.sink.prometheus.class=org.apache.spark.metrics.sink.PrometheusServlet
*.sink.prometheus.path=/metrics/prometheus
driver.sink.prometheus.class=org.apache.spark.metrics.sink.PrometheusServlet
driver.sink.prometheus.path=/metrics/prometheus
executor.sink.prometheus.class=org.apache.spark.metrics.sink.PrometheusServlet
executor.sink.prometheus.path=/metrics/prometheus
```

Or in `spark-defaults.conf`:

```
spark.ui.prometheus.enabled=true
```

Metrics are exposed at `http://<driver>:4040/metrics/prometheus`.

---

## Option A: Prometheus

```yaml
scrape_configs:
  - job_name: spark
    static_configs:
      - targets: ['localhost:4040']
    metrics_path: /metrics/prometheus

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
prometheus.scrape "spark" {
  targets      = [{"__address__" = "localhost:4040"}]
  metrics_path = "/metrics/prometheus"
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

## Option C: OpenTelemetry Collector

```yaml
receivers:
  prometheus:
    config:
      scrape_configs:
        - job_name: spark
          static_configs:
            - targets: ['localhost:4040']
          metrics_path: /metrics/prometheus

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

Collect Spark driver and executor logs. Add the following to your Alloy config:

```river
local.file_match "spark_logs" {
  path_targets = [{
    __address__ = "localhost",
    __path__    = "/opt/spark/logs/*.log",
    instance    = constants.hostname,
    job         = "integrations/spark",
  }]
}

loki.source.file "spark_logs" {
  targets    = local.file_match.spark_logs.targets
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
| `metrics_executor_cpuTime_total` | Executor CPU time |
| `metrics_executor_runTime_total` | Executor run time |
| `metrics_executor_shuffleReadBytes_total` | Shuffle bytes read |
| `metrics_executor_shuffleWriteBytes_total` | Shuffle bytes written |
| `metrics_jvm_heap_used` | JVM heap used |
| `metrics_executor_totalGcTime_total` | GC time in executors |
| `streaming_lastCompletedBatch_processingDelay` | Streaming batch processing delay |
