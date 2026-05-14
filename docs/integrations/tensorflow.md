---
id: tensorflow
title: TensorFlow Serving
sidebar_label: TensorFlow Serving
slug: /integrations/tensorflow
---

# TensorFlow Serving

Monitor TensorFlow Serving — request counts, latency percentiles, model load status, and runtime performance — using TF Serving's built-in Prometheus metrics endpoint.

**Pattern:** TF Serving /monitoring/prometheus/metrics → Prometheus scrape → xScaler `remote_write`

---

## Prerequisites

- TensorFlow Serving 2.x
- xScaler tenant credentials (token + tenant ID)

---

## Enable Metrics

Create a monitoring config file `monitoring_config.txt`:

```
prometheus_config: <
  enable: true,
  path: "/monitoring/prometheus/metrics"
>
```

Start TensorFlow Serving with:

```bash
tensorflow_model_server \
  --port=8500 \
  --rest_api_port=8501 \
  --model_name=my_model \
  --model_base_path=/models/my_model \
  --monitoring_config_file=monitoring_config.txt
```

---

## Option A — Prometheus

```yaml
scrape_configs:
  - job_name: tensorflow_serving
    static_configs:
      - targets: ['localhost:8501']
    metrics_path: /monitoring/prometheus/metrics

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
prometheus.scrape "tensorflow" {
  targets      = [{"__address__" = "localhost:8501"}]
  metrics_path = "/monitoring/prometheus/metrics"
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

## Option C — OpenTelemetry Collector

```yaml
receivers:
  prometheus:
    config:
      scrape_configs:
        - job_name: tensorflow_serving
          static_configs:
            - targets: ['localhost:8501']
          metrics_path: /monitoring/prometheus/metrics

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
| `:tensorflow_serving_request_count` | Total prediction requests |
| `:tensorflow_serving_request_latency` | Request latency histogram |
| `:tensorflow_serving_runtime_latency` | Model runtime latency |
| `tensorflow_core_graph_run_count` | TF graph execution count |
| `tensorflow_serving_model_handle_count` | Loaded model handles |
| `:tensorflow_serving_inference_count` | Total inference requests |
