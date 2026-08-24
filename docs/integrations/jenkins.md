---
id: jenkins
title: Jenkins
sidebar_label: Jenkins
slug: /integrations/jenkins
---

# Jenkins

Monitor Jenkins build results, durations, queue lengths, executor utilisation, and node health.

![Jenkins Dashboard](https://grafana.com/api/dashboards/9964/images/6247/image)

## Key metrics

| Metric | Description |
|--------|-------------|
| `jenkins_builds_total` | Total builds executed |
| `jenkins_builds_success_total` | Successful builds |
| `jenkins_builds_failed_total` | Failed builds |
| `jenkins_builds_duration_milliseconds_sum` | Cumulative build duration |
| `jenkins_job_count_value` | Total configured jobs |
| `jenkins_executor_count_value` | Total executor slots |

## Prerequisites

- Jenkins 2.x
- **Prometheus Metrics Plugin** installed

## Configuration

Install the plugin: **Manage Jenkins → Plugins → Prometheus Metrics Plugin**

Jenkins then serves metrics at `<jenkins-url>/prometheus`.

### Option A: Prometheus scrape

```yaml
scrape_configs:
  - job_name: jenkins
    metrics_path: /prometheus
    static_configs:
      - targets: ['localhost:8080']

remote_write:
  - url: https://<region>.xscalerlabs.com/api/v1/push
    headers:
      X-Scope-OrgID: <tenant-id>
    basic_auth:
      password: <api-token>
```

### Option B: Grafana Alloy

```alloy
prometheus.scrape "jenkins" {
  targets      = [{"__address__" = "localhost:8080"}]
  metrics_path = "/prometheus"
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

### Option C: OpenTelemetry Collector

```yaml
receivers:
  prometheus:
    config:
      scrape_configs:
        - job_name: jenkins
          metrics_path: /prometheus
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

## Logs

Collect Jenkins server log including build output and system events. Add the following to your Alloy config:

```river
local.file_match "jenkins_logs" {
  path_targets = [{
    __address__ = "localhost",
    __path__    = "/var/log/jenkins/jenkins.log",
    instance    = constants.hostname,
    job         = "integrations/jenkins",
  }]
}

loki.source.file "jenkins_logs" {
  targets    = local.file_match.jenkins_logs.targets
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

