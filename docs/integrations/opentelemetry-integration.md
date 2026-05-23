---
id: opentelemetry-integration
title: OpenTelemetry Collector
sidebar_label: OpenTelemetry Collector
slug: /integrations/opentelemetry-integration
---

# OpenTelemetry Collector

Forward metrics from any OpenTelemetry-instrumented service to xScaler using the OTel Collector's OTLP pipeline.

**Pattern:** OTel SDK → OTel Collector (OTLP receiver) → xScaler OTLP endpoint

---

## Prerequisites

- OpenTelemetry Collector 0.88+
- Applications instrumented with OTel SDK (any language)
- xScaler tenant credentials (token + tenant ID)

---

## Option A — Collector as a Gateway

Deploy the OTel Collector with an OTLP receiver and xScaler as the exporter:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

processors:
  memory_limiter:
    check_interval: 1s
    limit_mib: 512
  batch:
    timeout: 10s
    send_batch_size: 1000

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
      processors: [memory_limiter, batch]
      exporters:  [otlphttp/xscaler]
    traces:
      receivers:  [otlp]
      processors: [memory_limiter, batch]
      exporters:  [otlphttp/xscaler]
```

Point your OTel SDK to the collector:

```bash
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
```

---

## Option B — Grafana Alloy with OTel receiver

```river
otelcol.receiver.otlp "default" {
  grpc { endpoint = "0.0.0.0:4317" }
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

## Option C — SDK direct export (no collector)

Skip the collector entirely and export directly from your application:

```bash
OTEL_EXPORTER_OTLP_ENDPOINT=https://euw1-01.m.xscalerlabs.com
OTEL_EXPORTER_OTLP_HEADERS="Authorization=Bearer <token>,X-Scope-OrgID=<tenant-id>"
OTEL_METRICS_EXPORTER=otlp
```

---

## Span Metrics (traces → metrics)

Use the `spanmetrics` connector to derive RED metrics from traces:

```yaml
connectors:
  spanmetrics:
    histogram:
      explicit:
        buckets: [0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5]

service:
  pipelines:
    traces:
      receivers:  [otlp]
      exporters:  [spanmetrics]
    metrics:
      receivers:  [spanmetrics]
      exporters:  [otlphttp/xscaler]
```

---

## Logs

Collect OpenTelemetry Collector log via systemd journal. Add the following to your Alloy config:

```river
loki.source.journal "opentelemetry_integration_journal" {
  forward_to    = [loki.write.xscaler.receiver]
  relabel_rules = loki.relabel.opentelemetry_integration_journal.rules
  labels = {
    job      = "integrations/opentelemetry",
    instance = constants.hostname,
  }
}

loki.relabel "opentelemetry_integration_journal" {
  forward_to = []
  rule {
    source_labels = ["__journal__systemd_unit"]
    target_label  = "unit"
  }
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

## Key metrics (span-derived)

| Metric | Description |
|--------|-------------|
| `calls_total` | Request count by service/span name |
| `duration_milliseconds` | Latency histogram per span |
| `calls_failed_total` | Error count |
| `db.client.operation.duration` | Database call latency |
| `http.server.request.duration` | HTTP server request duration |
