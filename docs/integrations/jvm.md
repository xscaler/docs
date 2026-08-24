---
id: jvm
title: JVM
sidebar_label: JVM
slug: /integrations/jvm
---

# JVM

Monitor Java Virtual Machine heap usage, garbage collection pauses, thread counts, and class loading for any JVM-based application.

![JVM Dashboard](https://grafana.com/api/dashboards/3457/images/2191/image)

## Key metrics

| Metric | Description |
|--------|-------------|
| `jvm_memory_used_bytes` | Heap and non-heap memory in use |
| `jvm_gc_collection_seconds_sum` | Cumulative GC pause time |
| `jvm_threads_live` | Live thread count |
| `jvm_classes_loaded` | Currently loaded class count |
| `jvm_memory_pool_bytes_used` | Usage per memory pool |
| `process_cpu_usage` | Process CPU usage (0-1) |

## Prerequisites

- JVM application (Java, Kotlin, Scala, etc.)
- **jmx_exporter** or a Prometheus client library in your application

## Configuration

### Option A: jmx_exporter (Java agent)

Download [jmx_exporter](https://github.com/prometheus/jmx_exporter) and add it as a Java agent:

```bash
java -javaagent:jmx_prometheus_javaagent-x.x.x.jar=9090:config.yaml \
     -jar your-app.jar
```

**config.yaml** (minimal):
```yaml
rules:
  - pattern: ".*"
```

**Prometheus scrape**

```yaml
scrape_configs:
  - job_name: jvm
    static_configs:
      - targets: ['localhost:9090']

remote_write:
  - url: https://<region>.xscalerlabs.com/api/v1/push
    headers:
      X-Scope-OrgID: <tenant-id>
    basic_auth:
      password: <api-token>
```

### Option B: Grafana Alloy

```alloy
prometheus.scrape "jvm" {
  targets    = [{"__address__" = "localhost:9090"}]
  forward_to = [prometheus.remote_write.xscaler.receiver]
}

prometheus.remote_write "xscaler" {
  endpoint {
    url = "https://<region>.xscalerlabs.com/api/v1/push"
    headers = { "X-Scope-OrgID" = "<tenant-id>" }
    basic_auth { password = "<api-token>" }
  }
}
```

### Option C: OpenTelemetry Collector

```yaml
receivers:
  jmx:
    jar_path: /opt/opentelemetry-jmx-metrics.jar
    endpoint: service:jmx:rmi:///jndi/rmi://localhost:9999/jmxrmi
    target_system: jvm
    collection_interval: 60s

exporters:
  prometheusremotewrite:
    endpoint: https://<region>.xscalerlabs.com/api/v1/push
    headers:
      Authorization: Bearer <api-token>
      X-Scope-OrgID: <tenant-id>

service:
  pipelines:
    metrics:
      receivers: [jmx]
      exporters: [prometheusremotewrite]
```

## Logs

Collect JVM garbage collection log and application log. Add the following to your Alloy config:

```river
local.file_match "jvm_logs" {
  path_targets = [{
    __address__ = "localhost",
    __path__    = "/var/log/jvm/*.log",
    instance    = constants.hostname,
    job         = "integrations/jvm",
  }]
}

loki.source.file "jvm_logs" {
  targets    = local.file_match.jvm_logs.targets
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

