---
id: opentelemetry-collector
title: OpenTelemetry Collector
sidebar_label: OpenTelemetry Collector
slug: /logs/opentelemetry-collector
---

# OpenTelemetry Collector

Forward logs to xScaler using the [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/) over OTLP/HTTP. The collector can receive logs from any OTLP-compatible source and forward them with the correct credentials.

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

  filelog:
    include:
      - /var/log/app/*.log
    start_at: beginning
    operators:
      - type: json_parser
        timestamp:
          parse_from: attributes.time
          layout: '%Y-%m-%dT%H:%M:%S.%LZ'

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
    endpoint: https://euw1-01.l.xscalerlabs.com
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
    logs:
      receivers:  [otlp, filelog]
      processors: [memory_limiter, resourcedetection, batch]
      exporters:  [otlphttp/xscaler]
  telemetry:
    logs:
      level: info
```

### Key configuration notes

**`endpoint` is the base host only**
Set `endpoint` to `https://euw1-01.l.xscalerlabs.com`. Do **not** append `/otlp/v1/logs`. The `otlphttp` exporter appends the correct path automatically.

**`filelog` receiver**
The `filelog` receiver (from `opentelemetry-collector-contrib`) tails files on disk. Use `json_parser` to parse structured log lines and extract timestamps. Remove it if you only use OTLP ingestion.

**Processor order matters**
1. `memory_limiter`. Shed load under memory pressure
2. `resourcedetection`. Enrich with host/cloud metadata
3. `batch`. Buffer and flush in bulk; always last before the exporter

---

## Run with Docker

```bash
docker run --rm \
  -v $(pwd)/otel-collector-config.yaml:/etc/otelcol-contrib/config.yaml \
  -v /var/log:/var/log:ro \
  -p 4317:4317 -p 4318:4318 \
  otel/opentelemetry-collector-contrib:latest
```

---

## Troubleshooting

**Enable debug logging**

```yaml
service:
  telemetry:
    logs:
      level: debug
```

**Logs not arriving**
1. Look for `"failed to export"` in collector logs. The line includes the HTTP status code.
2. Verify `endpoint` is the base host only: `https://euw1-01.l.xscalerlabs.com` (no path suffix).
3. Check both `Authorization` and `X-Scope-OrgID` are under the `headers` block.

**`filelog` not picking up files**
- Verify the path glob matches your log files: `include: [/var/log/app/*.log]`
- The collector process must have read permission on the log files.
- Set `start_at: beginning` to ingest existing content on first run; switch to `end` for production.
