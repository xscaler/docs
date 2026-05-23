---
id: tomcat
title: Apache Tomcat
sidebar_label: Apache Tomcat
slug: /integrations/tomcat
---

# Apache Tomcat

Monitor Apache Tomcat — active threads, request throughput, JVM heap, JDBC connection pools, and error rates — using the JMX Exporter.

**Pattern:** JMX Exporter agent → Prometheus scrape → xScaler remote_write

---

## Prerequisites

- Apache Tomcat 9+
- Java 8+
- `jmx_prometheus_javaagent.jar` downloaded from the [Prometheus JMX Exporter releases](https://github.com/prometheus/jmx_exporter/releases)
- A JMX Exporter configuration file at `/etc/tomcat/jmx_exporter.yml`

---

## Option A — Prometheus Exporter

Attach the JMX Exporter as a Java agent by adding to `CATALINA_OPTS`:

```bash
export CATALINA_OPTS="-javaagent:/opt/jmx_exporter.jar=9404:/etc/tomcat/jmx_exporter.yml"
```

A minimal `/etc/tomcat/jmx_exporter.yml`:

```yaml
rules:
  - pattern: ".*"
```

Configure Prometheus to scrape port `9404` and forward to xScaler:

```yaml
scrape_configs:
  - job_name: tomcat
    static_configs:
      - targets: ["localhost:9404"]

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
prometheus.scrape "tomcat" {
  targets = [{ __address__ = "localhost:9404" }]
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

Use the OTel JMX receiver with the `tomcat` target system:

```yaml
receivers:
  jmx:
    jar_path: /opt/opentelemetry-jmx-metrics.jar
    endpoint: localhost:9090
    target_system: tomcat
    collection_interval: 10s

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

Collect Tomcat catalina log and access log. Add the following to your Alloy config:

```river
local.file_match "tomcat_logs" {
  path_targets = [{
    __address__ = "localhost",
    __path__    = "/opt/tomcat/logs/catalina.out",
    instance    = constants.hostname,
    job         = "integrations/tomcat",
  }]
}

loki.source.file "tomcat_logs" {
  targets    = local.file_match.tomcat_logs.targets
  forward_to = [loki.write.xscaler.receiver]
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
| `catalina_globalrequestprocessor_requestcount` | Total requests processed across all connectors |
| `catalina_globalrequestprocessor_errorcount` | Total error responses (4xx/5xx) across all connectors |
| `catalina_globalrequestprocessor_processingtime` | Cumulative request processing time in milliseconds |
| `catalina_threadpool_currentthreadcount` | Current number of threads in the connector thread pool |
| `jvm_memory_used_bytes` | JVM heap and non-heap memory currently in use |
| `catalina_datasource_numactive` | Active JDBC connections in the connection pool |
