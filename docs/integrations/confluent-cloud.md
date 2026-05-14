---
id: confluent-cloud
title: Confluent Cloud
sidebar_label: Confluent Cloud
slug: /integrations/confluent-cloud
---

# Confluent Cloud

Monitor Confluent Cloud Kafka clusters — consumer lag, throughput, and partition health — using the Confluent Cloud Metrics API and Prometheus Exporter. Correlate Kafka performance with your downstream services in xScaler.

**Pattern:** Confluent Cloud Metrics API → prometheus_exporter → xScaler remote_write

---

## Prerequisites

- Confluent Cloud account
- Cloud API key with the **MetricsViewer** role assigned
- xScaler tenant credentials (token + tenant ID)

---

## Option A — Prometheus Exporter

Run the Confluent Cloud exporter with your API credentials:

```bash
docker run -d \
  -p 2112:2112 \
  -e CONFLUENT_CLOUD_API_KEY=<api-key> \
  -e CONFLUENT_CLOUD_API_SECRET=<api-secret> \
  confluentinc/confluent-cloud-metrics-exporter
```

The exporter listens on port `2112`. Configure Prometheus to scrape and remote_write:

```yaml
scrape_configs:
  - job_name: confluent_cloud
    static_configs:
      - targets: ["localhost:2112"]
    scrape_interval: 60s

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
prometheus.scrape "confluent_cloud" {
  targets          = [{"__address__" = "localhost:2112"}]
  scrape_interval  = "60s"
  forward_to       = [prometheus.remote_write.xscaler.receiver]
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
  prometheus:
    config:
      scrape_configs:
        - job_name: confluent_cloud
          static_configs:
            - targets: ["localhost:2112"]
          scrape_interval: 60s

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
      receivers: [prometheus]
      processors: [batch]
      exporters: [otlphttp/xscaler]
```

---

## Key metrics

| Metric | Description |
|--------|-------------|
| `confluent_kafka_server_received_bytes` | Bytes received by Kafka brokers from producers |
| `confluent_kafka_server_sent_bytes` | Bytes sent by Kafka brokers to consumers |
| `confluent_kafka_server_retained_bytes` | Total bytes retained across all topics |
| `confluent_kafka_server_request_count` | Total number of requests processed by the cluster |
| `consumer_lag_offsets` | Per-consumer-group lag in number of messages behind the latest offset |
