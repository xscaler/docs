---
id: otel-sdk-python
title: OTel SDK — Python
sidebar_label: OTel SDK — Python
slug: /traces/otel-sdk-python
---

# OTel SDK — Python

Instrument a Python application to send traces directly to xScaler using the OpenTelemetry Python SDK over OTLP/HTTP.

:::warning Required headers
Both headers must be present in the `OTLPSpanExporter`:
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
from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

# Configure the exporter
exporter = OTLPSpanExporter(
    endpoint="https://euw1-01.t.xscalerlabs.com/otlp/v1/traces",
    headers={
        "Authorization": "Bearer <token>",
        "X-Scope-OrgID": "<tenant-id>",
    }
)

# Build the tracer provider
resource = Resource.create({"service.name": "my-service", "service.version": "1.0.0"})
provider = TracerProvider(resource=resource)
provider.add_span_processor(BatchSpanProcessor(exporter))
trace.set_tracer_provider(provider)

tracer = trace.get_tracer("my-service")
```

:::note Full OTLP path required
Unlike the OpenTelemetry Collector exporter (which only takes the base host), the Python SDK exporter requires the **full path** including `/otlp/v1/traces`.
:::

---

## Instrument your code

```python
with tracer.start_as_current_span("handle-request") as span:
    span.set_attribute("http.method", "GET")
    span.set_attribute("http.route", "/api/users")

    with tracer.start_as_current_span("query-database"):
        # simulate database call
        import time; time.sleep(0.01)
```

---

## Load credentials from environment variables

```python
import os

exporter = OTLPSpanExporter(
    endpoint="https://euw1-01.t.xscalerlabs.com/otlp/v1/traces",
    headers={
        "Authorization": f"Bearer {os.environ['XSCALER_TOKEN']}",
        "X-Scope-OrgID": os.environ["XSCALER_TENANT_ID"],
    }
)
```

---

## Troubleshooting

**Traces not appearing**
- Verify `endpoint` includes the full path: `.../otlp/v1/traces`.
- Enable debug logging: `import logging; logging.basicConfig(level=logging.DEBUG)`.
- The `BatchSpanProcessor` exports on a background thread — ensure the process runs long enough for the first flush.

**401 Unauthorized**
- Check the `Authorization` header value is `"Bearer <token>"` (capital B, space before token).

**400 Bad Request**
- The `X-Scope-OrgID` header is missing or misspelled.
