---
id: otel-sdk-nodejs
title: OTel SDK — Node.js
sidebar_label: OTel SDK — Node.js
slug: /ingest/otel-sdk-nodejs
---

# OTel SDK — Node.js

Instrument a Node.js application to push metrics directly to xScaler using the OpenTelemetry JavaScript SDK over OTLP/HTTP.

:::warning Required headers
Both headers must be present in the `OTLPMetricExporter`:
- `Authorization: 'Bearer <token>'`
- `X-Scope-OrgID: '<tenant-id>'`
:::

---

## Install dependencies

```bash
npm install @opentelemetry/sdk-node \
            @opentelemetry/sdk-metrics \
            @opentelemetry/exporter-metrics-otlp-http \
            @opentelemetry/resources \
            @opentelemetry/semantic-conventions
```

---

## Setup and instrumentation

```js
const { MeterProvider, PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http');
const { Resource } = require('@opentelemetry/resources');
const { SEMRESATTRS_SERVICE_NAME } = require('@opentelemetry/semantic-conventions');

const exporter = new OTLPMetricExporter({
  url: 'https://euw1-01.m.xscalerlabs.com/otlp/v1/metrics',
  headers: {
    'Authorization': 'Bearer <token>',
    'X-Scope-OrgID': '<tenant-id>',
  },
});

const provider = new MeterProvider({
  resource: new Resource({
    [SEMRESATTRS_SERVICE_NAME]: 'my-service',
  }),
  readers: [new PeriodicExportingMetricReader({
    exporter,
    exportIntervalMillis: 15_000,
  })],
});

const meter = provider.getMeter('my-service', '1.0.0');
```

:::note Full OTLP path required
The Node.js SDK exporter requires the **full path** in `url`: `.../otlp/v1/metrics`. This differs from the OpenTelemetry Collector exporter, which uses only the base host.
:::

---

## Instrument your code

### Counter

```js
const requestCounter = meter.createCounter('http_requests_total', {
  description: 'Total HTTP requests',
});

requestCounter.add(1, { method: 'GET', status: '200' });
```

### Histogram

```js
const latency = meter.createHistogram('http_request_duration_seconds', {
  description: 'HTTP request duration in seconds',
  unit: 's',
});

latency.record(0.034, { route: '/api/v1/metrics' });
```

---

## Load credentials from environment variables

```js
const exporter = new OTLPMetricExporter({
  url: 'https://euw1-01.m.xscalerlabs.com/otlp/v1/metrics',
  headers: {
    'Authorization': `Bearer ${process.env.XSCALER_TOKEN}`,
    'X-Scope-OrgID': process.env.XSCALER_TENANT_ID,
  },
});
```

---

## Graceful shutdown

Register a shutdown hook to flush the final batch of metrics before the process exits:

```js
process.on('SIGTERM', async () => {
  await provider.shutdown();
  process.exit(0);
});
```

---

## Troubleshooting

**Metrics not appearing**
- The SDK exports asynchronously on an interval; ensure the process runs long enough for at least one export cycle (15 s by default).
- Check `url` — it must include the full path ending in `/otlp/v1/metrics`.

**`401 Unauthorized`**
- Verify the `Authorization` header value is `'Bearer <token>'` (capital B, space before token).

**`400 Bad Request`**
- Check the `X-Scope-OrgID` header is present and the key is spelled correctly (case-sensitive).
