---
id: otel-sdk-python
title: OTel SDK — Python
sidebar_label: OTel SDK — Python
slug: /ingest/otel-sdk-python
---

# OTel SDK — Python

Instrument your Python application to push metrics directly to xScaler using the OpenTelemetry Python SDK over OTLP/HTTP.

:::warning Required headers
Both headers must be present in the `OTLPMetricExporter`:
- `Authorization: "Bearer <token>"`
- `X-Scope-OrgID: "<tenant-id>"`
:::

---

## Install dependencies

```bash
pip install opentelemetry-sdk \
            opentelemetry-exporter-otlp-proto-http
```

---

## Setup and instrumentation

```python
from opentelemetry import metrics
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry.exporter.otlp.proto.http.metric_exporter import OTLPMetricExporter

# Configure the exporter
exporter = OTLPMetricExporter(
    endpoint="https://euw1-01.m.xscalerlabs.com/otlp/v1/metrics",
    headers={
        "Authorization": "Bearer <token>",
        "X-Scope-OrgID": "<tenant-id>",
    }
)

# Export metrics every 15 seconds
reader = PeriodicExportingMetricReader(
    exporter,
    export_interval_millis=15_000
)
provider = MeterProvider(metric_readers=[reader])
metrics.set_meter_provider(provider)

meter = metrics.get_meter("my-service", version="1.0.0")
```

:::note Full OTLP path required in the SDK
Unlike the OpenTelemetry Collector exporter (which only takes the base host), the Python SDK exporter requires the **full path** including `/otlp/v1/metrics`.
:::

---

## Instrument your code

### Counter — monotonically increasing values

Use a counter for things that only go up: requests, errors, bytes sent.

```python
request_counter = meter.create_counter(
    "http_requests_total",
    unit="1",
    description="Total HTTP requests"
)

# Record a request with labels
request_counter.add(1, {"method": "GET", "status": "200"})
```

### Histogram — latencies and sizes

Use a histogram for values that are meaningful as distributions: latency, payload size.

```python
latency = meter.create_histogram(
    "http_request_duration_seconds",
    unit="s",
    description="HTTP request duration"
)

latency.record(0.042, {"route": "/api/v1/metrics"})
```

### UpDownCounter — values that go up and down

Use an UpDownCounter for quantities that can decrease as well as increase: queue depth, active connections, cache size.

```python
queue_depth = meter.create_up_down_counter(
    "job_queue_depth",
    unit="1",
    description="Number of pending jobs in queue"
)

queue_depth.add(5)   # 5 jobs enqueued
queue_depth.add(-2)  # 2 jobs completed
```

---

## Load credentials from environment variables

```python
import os

exporter = OTLPMetricExporter(
    endpoint="https://euw1-01.m.xscalerlabs.com/otlp/v1/metrics",
    headers={
        "Authorization": f"Bearer {os.environ['XSCALER_TOKEN']}",
        "X-Scope-OrgID": os.environ["XSCALER_TENANT_ID"],
    }
)
```

---

## Troubleshooting

**Metrics not appearing in xScaler**
- Verify the `endpoint` includes the full path: `.../otlp/v1/metrics`
- The SDK exports on a background thread; ensure your process runs long enough for the first export interval (15 s by default)
- Check for exceptions from the exporter by enabling logging: `import logging; logging.basicConfig(level=logging.DEBUG)`

**401 Unauthorized**
- Check the `Authorization` header value is `"Bearer <token>"` (string, capital B, space before token)

**400 Bad Request**
- The `X-Scope-OrgID` header is missing or the key is misspelled
