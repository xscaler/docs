---
id: catchpoint
title: Catchpoint
sidebar_label: Catchpoint
slug: /integrations/catchpoint
---

# Catchpoint

Forward Catchpoint synthetic monitoring results — DNS time, connect time, response time, availability, and packet loss — to xScaler using webhooks and the OpenTelemetry Collector.

**Pattern:** Catchpoint Webhook → OTel Collector (HTTP receiver) → xScaler OTLP endpoint

---

## Prerequisites

- Catchpoint account with webhook access
- OpenTelemetry Collector running at a publicly accessible URL
- xScaler tenant credentials (token + tenant ID)

---

## Setup

### 1. Configure OTel Collector to receive Catchpoint webhooks

```yaml
receivers:
  otlp:
    protocols:
      http:
        endpoint: 0.0.0.0:4318

processors:
  transform:
    metric_statements:
      - context: metric
        statements:
          - set(description, "Catchpoint test metric")
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
      receivers:  [otlp]
      processors: [transform, batch]
      exporters:  [otlphttp/xscaler]
```

### 2. Configure Catchpoint Webhook

In Catchpoint portal → Settings → Webhooks:

- **URL**: `http://your-collector:4318/v1/metrics`
- **Format**: JSON
- **Test types**: Web, API, DNS, Ping, etc.

### 3. Alternative — Prometheus bridge

Use the Catchpoint Prometheus exporter if available for your plan:

```yaml
scrape_configs:
  - job_name: catchpoint
    static_configs:
      - targets: ['catchpoint-exporter:9096']

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
otelcol.receiver.otlp "catchpoint" {
  http { endpoint = "0.0.0.0:4318" }
  output {
    metrics = [otelcol.exporter.otlphttp.xscaler.input]
  }
}

otelcol.exporter.otlphttp "xscaler" {
  client {
    endpoint = "https://euw1-01.m.xscalerlabs.com"
    headers  = {
      "Authorization" = "Bearer <token>",
      "X-Scope-OrgID" = "<tenant-id>",
    }
  }
}
```

---

## Key metrics

| Metric | Description |
|--------|-------------|
| `catchpoint_test_duration_ms` | Total test duration |
| `catchpoint_dns_time_ms` | DNS resolution time |
| `catchpoint_connect_time_ms` | TCP connect time |
| `catchpoint_response_time_ms` | Time to first byte |
| `catchpoint_availability_percent` | Test availability percentage |
| `catchpoint_packet_loss_percent` | Packet loss for ping tests |
