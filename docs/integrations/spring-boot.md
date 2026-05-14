---
id: spring-boot
title: Spring Boot
sidebar_label: Spring Boot
slug: /integrations/spring-boot
---

# Spring Boot

Monitor Spring Boot applications via the Actuator Prometheus endpoint — HTTP request rates, JVM memory, GC pauses, and connection pool usage.

![Spring Boot Dashboard](https://grafana.com/api/dashboards/12685/images/8578/image)

## Key Metrics

| Metric | Description |
|--------|-------------|
| `http_server_requests_seconds_count` | HTTP request count per endpoint |
| `http_server_requests_seconds_sum` | Total HTTP request duration |
| `jvm_memory_used_bytes` | JVM heap and non-heap usage |
| `jvm_gc_pause_seconds_sum` | GC pause duration |
| `hikaricp_connections_active` | Active HikariCP connections |
| `system_cpu_usage` | System CPU utilisation |

## Prerequisites

- Spring Boot 2.x / 3.x
- `spring-boot-starter-actuator` + `micrometer-registry-prometheus` dependencies

## Configuration

**pom.xml dependencies**

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```

**application.properties**

```properties
management.endpoints.web.exposure.include=prometheus,health
management.endpoint.prometheus.enabled=true
```

Metrics are available at `http://localhost:8080/actuator/prometheus`.

### Option A — Prometheus scrape

```yaml
scrape_configs:
  - job_name: spring_boot
    metrics_path: /actuator/prometheus
    static_configs:
      - targets: ['localhost:8080']

remote_write:
  - url: https://<region>.xscalerlabs.com/api/v1/push
    headers:
      X-Scope-OrgID: <tenant-id>
    basic_auth:
      password: <api-token>
```

### Option B — Grafana Alloy

```alloy
prometheus.scrape "spring_boot" {
  targets      = [{"__address__" = "localhost:8080"}]
  metrics_path = "/actuator/prometheus"
  forward_to   = [prometheus.remote_write.xscaler.receiver]
}

prometheus.remote_write "xscaler" {
  endpoint {
    url = "https://<region>.xscalerlabs.com/api/v1/push"
    headers = { "X-Scope-OrgID" = "<tenant-id>" }
    basic_auth { password = "<api-token>" }
  }
}
```

### Option C — OpenTelemetry Collector

```yaml
receivers:
  prometheus:
    config:
      scrape_configs:
        - job_name: spring_boot
          metrics_path: /actuator/prometheus
          static_configs:
            - targets: ['localhost:8080']

exporters:
  prometheusremotewrite:
    endpoint: https://<region>.xscalerlabs.com/api/v1/push
    headers:
      Authorization: Bearer <api-token>
      X-Scope-OrgID: <tenant-id>

service:
  pipelines:
    metrics:
      receivers: [prometheus]
      exporters: [prometheusremotewrite]
```
