---
id: otel-sdk-python
title: OTel SDK — Python
sidebar_label: OTel SDK — Python
slug: /logs/otel-sdk-python
---

# OTel SDK — Python

Send logs directly from a Python application to xScaler using the OpenTelemetry Python SDK over OTLP/HTTP.

:::warning Required headers
Both headers must be present in the `OTLPLogExporter`:
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
import logging
import os

from opentelemetry._logs import set_logger_provider
from opentelemetry.exporter.otlp.proto.http._log_exporter import OTLPLogExporter
from opentelemetry.sdk._logs import LoggerProvider, LoggingHandler
from opentelemetry.sdk._logs.export import BatchLogRecordProcessor
from opentelemetry.sdk.resources import Resource

# Configure the log exporter
exporter = OTLPLogExporter(
    endpoint="https://euw1-01.l.xscalerlabs.com/otlp/v1/logs",
    headers={
        "Authorization": "Bearer <token>",
        "X-Scope-OrgID": "<tenant-id>",
    }
)

# Build the logger provider
resource = Resource.create({"service.name": "my-service", "service.version": "1.0.0"})
provider = LoggerProvider(resource=resource)
provider.add_log_record_processor(BatchLogRecordProcessor(exporter))
set_logger_provider(provider)

# Bridge Python's standard logging to OTel
handler = LoggingHandler(level=logging.DEBUG, logger_provider=provider)
logging.getLogger().addHandler(handler)
logging.getLogger().setLevel(logging.DEBUG)
```

:::note Full OTLP path required
Unlike the OpenTelemetry Collector exporter (which only takes the base host), the Python SDK exporter requires the **full path** including `/otlp/v1/logs`.
:::

---

## Log as normal

```python
import logging

logger = logging.getLogger("my-service")

logger.info("application started", extra={"version": "1.0.0"})
logger.warning("high memory usage", extra={"used_mb": 480})
logger.error("database connection failed", extra={"host": "db.internal"})
```

---

## Load credentials from environment variables

```python
import os

exporter = OTLPLogExporter(
    endpoint="https://euw1-01.l.xscalerlabs.com/otlp/v1/logs",
    headers={
        "Authorization": f"Bearer {os.environ['XSCALER_TOKEN']}",
        "X-Scope-OrgID": os.environ["XSCALER_TENANT_ID"],
    }
)
```

---

## Troubleshooting

**Logs not appearing in xScaler**
- Verify the `endpoint` includes the full path: `.../otlp/v1/logs`
- Enable debug logging on the SDK: `logging.basicConfig(level=logging.DEBUG)`
- The `BatchLogRecordProcessor` exports on a background thread — ensure the process runs long enough for the first flush.

**401 Unauthorized**
- Check the `Authorization` header value is `"Bearer <token>"` (capital B, space before token).

**401 Unauthorized — "x-scope-orgid mismatch"**
- The `X-Scope-OrgID` header is missing, misspelled, or its value doesn't match your token's tenant.
