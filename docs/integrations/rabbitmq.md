---
id: rabbitmq
title: RabbitMQ
sidebar_label: RabbitMQ
slug: /integrations/rabbitmq
---

# RabbitMQ

Monitor RabbitMQ queue depths, message rates, connection counts, and node resource usage.

![RabbitMQ Dashboard](https://grafana.com/api/dashboards/10991/images/7003/image)

## Key Metrics

| Metric | Description |
|--------|-------------|
| `rabbitmq_queue_messages` | Messages ready in queue |
| `rabbitmq_queue_messages_unacked` | Unacknowledged messages |
| `rabbitmq_connections_total` | Active connections |
| `rabbitmq_channel_messages_published_total` | Published messages |
| `rabbitmq_node_mem_used` | Memory used by the node |
| `rabbitmq_node_disk_free` | Free disk space on node |

## Prerequisites

- RabbitMQ 3.8+ with the **Prometheus plugin** enabled
- Network access to the management port `15692`

## Configuration

**Enable the Prometheus plugin**

```bash
rabbitmq-plugins enable rabbitmq_prometheus
```

### Option A — Prometheus scrape

RabbitMQ exposes metrics natively on port `15692` when the plugin is enabled.

```yaml
scrape_configs:
  - job_name: rabbitmq
    static_configs:
      - targets: ['localhost:15692']

remote_write:
  - url: https://<region>.xscalerlabs.com/api/v1/push
    headers:
      X-Scope-OrgID: <tenant-id>
    basic_auth:
      password: <api-token>
```

### Option B — Grafana Alloy

```alloy
prometheus.scrape "rabbitmq" {
  targets = [{"__address__" = "localhost:15692"}]
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

### Option C — OpenTelemetry Collector

```yaml
receivers:
  rabbitmq:
    endpoint: http://localhost:15672
    username: guest
    password: ${RABBITMQ_PASSWORD}
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
      receivers: [rabbitmq]
      exporters: [prometheusremotewrite]
```
