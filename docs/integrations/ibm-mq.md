---
id: ibm-mq
title: IBM MQ
sidebar_label: IBM MQ
slug: /integrations/ibm-mq
---

# IBM MQ

Monitor IBM MQ queue managers — queue depth, channel status, message rates, and broker health — using the IBM MQ Prometheus exporter.

**Pattern:** mq-metric-samples → Prometheus scrape → xScaler `remote_write`

---

## Prerequisites

- IBM MQ 9.x+
- MQ administrator credentials
- xScaler tenant credentials (token + tenant ID)

---

## Option A — Prometheus Exporter

```bash
docker run -d \
  -p 9157:9157 \
  -e MQ_QMGR_NAME=QM1 \
  -e MQ_USERID=admin \
  -e MQ_PASSWORD=pass \
  ibmcom/mq-metric-samples
```

Add to `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: ibm_mq
    static_configs:
      - targets: ['localhost:9157']

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
prometheus.scrape "ibm_mq" {
  targets    = [{"__address__" = "localhost:9157"}]
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

## Option C — OpenTelemetry Collector

```yaml
receivers:
  prometheus:
    config:
      scrape_configs:
        - job_name: ibm_mq
          static_configs:
            - targets: ['localhost:9157']
          scrape_interval: 30s

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

## Key metrics

| Metric | Description |
|--------|-------------|
| `ibmmq_qmgr_status` | Queue manager status (1 = running) |
| `ibmmq_queue_depth` | Current depth of a queue |
| `ibmmq_channel_status` | Channel status (running/stopped) |
| `ibmmq_queue_input_count` | Messages put to queue |
| `ibmmq_queue_output_count` | Messages got from queue |
| `ibmmq_qmgr_cpu_load` | Queue manager CPU utilisation |
| `ibmmq_qmgr_ram_total_bytes` | Queue manager RAM usage |
