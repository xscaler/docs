---
id: wildfly
title: WildFly
sidebar_label: WildFly
slug: /integrations/wildfly
---

# WildFly

Monitor WildFly application server — deployment status, undertow request throughput, datasource pool, JVM memory, and transaction counts — using the JMX Exporter or WildFly Metrics subsystem.

**Pattern:** JMX Exporter agent → Prometheus scrape → xScaler remote_write

---

## Prerequisites

- WildFly 24+
- JMX enabled (enabled by default in standalone mode)
- `jmx_prometheus_javaagent.jar` downloaded from the [Prometheus JMX Exporter releases](https://github.com/prometheus/jmx_exporter/releases)
- A JMX Exporter configuration file at `/etc/wildfly/jmx_exporter.yml`

---

## Option A — Prometheus Exporter

Attach the JMX Exporter as a Java agent by adding to `JAVA_OPTS` in `standalone.conf`:

```bash
JAVA_OPTS="-javaagent:/opt/jmx_exporter.jar=9090:/etc/wildfly/jmx_exporter.yml $JAVA_OPTS"
```

A minimal `/etc/wildfly/jmx_exporter.yml`:

```yaml
rules:
  - pattern: ".*"
```

Configure Prometheus to scrape port `9090` and forward to xScaler:

```yaml
scrape_configs:
  - job_name: wildfly
    static_configs:
      - targets: ["localhost:9090"]

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
prometheus.scrape "wildfly" {
  targets = [{ __address__ = "localhost:9090" }]
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

Use the OTel JMX receiver targeting the WildFly management port:

```yaml
receivers:
  jmx:
    jar_path: /opt/opentelemetry-jmx-metrics.jar
    endpoint: localhost:9990
    target_system: wildfly
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

Collect WildFly server log. Add the following to your Alloy config:

```river
local.file_match "wildfly_logs" {
  path_targets = [{
    __address__ = "localhost",
    __path__    = "/opt/wildfly/standalone/log/server.log",
    instance    = constants.hostname,
    job         = "integrations/wildfly",
  }]
}

loki.source.file "wildfly_logs" {
  targets    = local.file_match.wildfly_logs.targets
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
| `jboss_undertow_request_count_total` | Total HTTP requests handled by the Undertow subsystem |
| `jboss_undertow_error_count_total` | Total error responses from the Undertow subsystem |
| `jboss_datasource_pool_active_count` | Active connections in the datasource connection pool |
| `jboss_transactions_number_of_committed_transactions` | Cumulative count of committed JTA transactions |
| `jvm_memory_used_bytes` | JVM heap and non-heap memory currently in use |
| `jboss_ejb_execution_time` | Cumulative EJB method execution time |
