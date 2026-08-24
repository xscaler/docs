---
id: opentelemetry-collector
title: OpenTelemetry Collector
sidebar_label: OpenTelemetry Collector
slug: /traces/opentelemetry-collector
---

# OpenTelemetry Collector

Forward traces to xScaler using the [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/) over OTLP/HTTP. The collector can receive traces from any OTLP-compatible source and forward them with the correct credentials.

:::warning Required headers
Both headers must be present in the `exporters.otlphttp/xscaler.headers` block:
- `Authorization: "Bearer <token>"`
- `X-Scope-OrgID: "<tenant-id>"`
:::

---

## Configuration

Save the following as `otel-collector-config.yaml`:

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
  resourcedetection:
    detectors: [env, system]
    timeout: 5s

exporters:
  otlphttp/xscaler:
    endpoint: https://euw1-01.t.xscalerlabs.com
    headers:
      Authorization: "Bearer <token>"
      X-Scope-OrgID: "<tenant-id>"
    compression: gzip
    retry_on_failure:
      enabled: true
      initial_interval: 5s
      max_interval: 30s
      max_elapsed_time: 300s
    sending_queue:
      enabled: true
      num_consumers: 10
      queue_size: 5000

service:
  pipelines:
    traces:
      receivers:  [otlp]
      processors: [memory_limiter, resourcedetection, batch]
      exporters:  [otlphttp/xscaler]
  telemetry:
    logs:
      level: info
```

### Key configuration notes

**`endpoint` is the base host only**
Set `endpoint` to `https://euw1-01.t.xscalerlabs.com`. Do **not** append `/otlp/v1/traces`. The `otlphttp` exporter appends the correct path automatically.

**Processor order matters**
1. `memory_limiter`. Shed load under memory pressure
2. `resourcedetection`. Enrich spans with host/cloud metadata
3. `batch`. Buffer and flush in bulk; always last before the exporter

---

## Send all three signals

To forward metrics, logs, and traces in one collector config:

```yaml
exporters:
  otlphttp/xscaler_metrics:
    endpoint: https://euw1-01.m.xscalerlabs.com
    headers:
      Authorization: "Bearer <token>"
      X-Scope-OrgID: "<tenant-id>"
    compression: gzip
  otlphttp/xscaler_logs:
    endpoint: https://euw1-01.l.xscalerlabs.com
    headers:
      Authorization: "Bearer <token>"
      X-Scope-OrgID: "<tenant-id>"
    compression: gzip
  otlphttp/xscaler_traces:
    endpoint: https://euw1-01.t.xscalerlabs.com
    headers:
      Authorization: "Bearer <token>"
      X-Scope-OrgID: "<tenant-id>"
    compression: gzip

service:
  pipelines:
    metrics:
      receivers:  [otlp]
      processors: [memory_limiter, resourcedetection, batch]
      exporters:  [otlphttp/xscaler_metrics]
    logs:
      receivers:  [otlp]
      processors: [memory_limiter, resourcedetection, batch]
      exporters:  [otlphttp/xscaler_logs]
    traces:
      receivers:  [otlp]
      processors: [memory_limiter, resourcedetection, batch]
      exporters:  [otlphttp/xscaler_traces]
```

---

## Run with Docker

```bash
docker run --rm \
  -v $(pwd)/otel-collector-config.yaml:/etc/otelcol-contrib/config.yaml \
  -p 4317:4317 -p 4318:4318 \
  otel/opentelemetry-collector-contrib:latest
```

---

## Verify in the portal

Once traces are flowing, open the **Traces** section of the [xScaler portal](https://portal.xscalerlabs.com) and click the **Overview** tab. You should see live values for **Ingest rate** and **Spans/s** within a minute of the collector starting.

To inspect a specific tenant, click the **Tenants** tab, select the tenant, then open the **Monitoring** tab for per-tenant ingest rate charts, bytes ingested, and discard reasons.

---

## Troubleshooting

**Enable debug logging**

```yaml
service:
  telemetry:
    logs:
      level: debug
```

**Traces not arriving**
1. Look for `"failed to export"` in collector logs. The line includes the HTTP status code.
2. Verify `endpoint` is the base host only: `https://euw1-01.t.xscalerlabs.com` (no path suffix).
3. Check both `Authorization` and `X-Scope-OrgID` are under the `headers` block.
