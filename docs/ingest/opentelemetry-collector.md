---
id: opentelemetry-collector
title: OpenTelemetry Collector
sidebar_label: OpenTelemetry Collector
slug: /ingest/opentelemetry-collector
---

# OpenTelemetry Collector

The [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/) is a vendor-neutral agent that receives, processes, and exports telemetry. Use it to forward metrics to xScaler over OTLP/HTTP.

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
    endpoint: https://euw1-01.m.xscalerlabs.com
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
    metrics:
      receivers:  [otlp]
      processors: [memory_limiter, resourcedetection, batch]
      exporters:  [otlphttp/xscaler]
  telemetry:
    logs:
      level: info
```

### Key configuration notes

**`endpoint` is the base host only**
Set `endpoint` to `https://euw1-01.m.xscalerlabs.com` — do **not** append `/otlp/v1/metrics`. The `otlphttp` exporter appends the correct path (`/v1/metrics`) automatically. Appending the path manually will produce a `404`.

**Both headers go in `headers`**
The `Authorization` and `X-Scope-OrgID` headers both live under `exporters.otlphttp/xscaler.headers`. There is no separate auth block for this exporter.

**Processor order matters**
The recommended pipeline order is:
1. `memory_limiter` — prevents OOM by shedding load when memory is tight
2. `resourcedetection` — enriches spans/metrics with host/cloud metadata
3. `batch` — buffers and sends in bulk; always place last before the exporter

---

## Run with Docker

```bash
docker run --rm \
  -v $(pwd)/otel-collector-config.yaml:/etc/otelcol-contrib/config.yaml \
  -p 4317:4317 -p 4318:4318 \
  otel/opentelemetry-collector-contrib:latest
```

This binds the OTLP gRPC port (`4317`) and OTLP HTTP port (`4318`) to localhost, allowing your application to send metrics to the collector.

---

## Troubleshooting

**Enable debug logging**

Change `telemetry.logs.level` to `debug` to see every export attempt and the HTTP response codes:

```yaml
service:
  telemetry:
    logs:
      level: debug
```

**Metrics not arriving**

1. Look for `"failed to export"` in the collector logs. The log line includes the HTTP status code.
2. Verify the `endpoint` is the base host only — `https://euw1-01.m.xscalerlabs.com` (no path suffix).
3. Check both `Authorization` and `X-Scope-OrgID` are in the `headers` block with correct values.
4. If you see `429 Too Many Requests`, reduce `sending_queue.num_consumers` or increase `batch.timeout`.
