---
id: otel-sdk-nodejs
title: Node.js OTel SDK
sidebar_label: Node.js OTel SDK
slug: /traces/otel-sdk-nodejs
---

# Node.js OTel SDK

Instrument a Node.js application to send traces directly to xScaler using the OpenTelemetry JS SDK over OTLP/HTTP.

:::warning Required headers
Both headers must be passed to `OTLPTraceExporter`:
- `Authorization: "Bearer <token>"`
- `X-Scope-OrgID: "<tenant-id>"`
:::

---

## Install dependencies

```bash
npm install @opentelemetry/sdk-node \
            @opentelemetry/exporter-trace-otlp-http \
            @opentelemetry/resources \
            @opentelemetry/semantic-conventions
```

---

## Setup

Create `otel.js` and require it before your application code:

```js
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { Resource } = require('@opentelemetry/resources');
const { SEMRESATTRS_SERVICE_NAME } = require('@opentelemetry/semantic-conventions');

const exporter = new OTLPTraceExporter({
  url: 'https://euw1-01.t.xscalerlabs.com/otlp/v1/traces',
  headers: {
    Authorization: `Bearer ${process.env.XSCALER_TOKEN}`,
    'X-Scope-OrgID': process.env.XSCALER_TENANT_ID,
  },
});

const sdk = new NodeSDK({
  resource: new Resource({
    [SEMRESATTRS_SERVICE_NAME]: 'my-service',
  }),
  traceExporter: exporter,
});

sdk.start();

process.on('SIGTERM', async () => {
  await sdk.shutdown();
  process.exit(0);
});
```

---

## Instrument your code

```js
const { trace } = require('@opentelemetry/api');

const tracer = trace.getTracer('my-service');

async function handleRequest(req, res) {
  const span = tracer.startSpan('handle-request', {
    attributes: {
      'http.method': req.method,
      'http.route': req.path,
    },
  });

  try {
    await queryDatabase(span);
    res.json({ ok: true });
  } finally {
    span.end();
  }
}

async function queryDatabase(parentSpan) {
  const ctx = trace.setSpan(require('@opentelemetry/api').context.active(), parentSpan);
  const span = tracer.startSpan('query-database', {}, ctx);
  // ... db call ...
  span.end();
}
```

---

## Run your application

```bash
XSCALER_TOKEN=<token> XSCALER_TENANT_ID=<tenant-id> node -r ./otel.js app.js
```

---

## Auto-instrumentation

Use the `@opentelemetry/auto-instrumentations-node` package to automatically trace HTTP, Express, database calls, and more without code changes:

```bash
npm install @opentelemetry/auto-instrumentations-node
```

```js
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');

const sdk = new NodeSDK({
  resource: new Resource({ [SEMRESATTRS_SERVICE_NAME]: 'my-service' }),
  traceExporter: exporter,
  instrumentations: [getNodeAutoInstrumentations()],
});
```

---

## Verify in the portal

Once traces are flowing, open the **Traces** section of the [xScaler portal](https://portal.xscalerlabs.com) and click the **Overview** tab. You should see live values for **Ingest rate** and **Spans/s** within a minute of starting your app.

To inspect a specific tenant, click the **Tenants** tab, select the tenant, then open the **Monitoring** tab for per-tenant ingest rate charts, bytes ingested, and discard reasons.

---

## Troubleshooting

**Traces not arriving**
- Verify the `url` is the full path: `https://euw1-01.t.xscalerlabs.com/otlp/v1/traces`.
- Enable SDK diagnostics: `OTEL_LOG_LEVEL=debug node -r ./otel.js app.js`.
- Check `Authorization` and `X-Scope-OrgID` are both in the `headers` object.

**401 Unauthorized**
- Confirm `XSCALER_TOKEN` is set and the header reads `Bearer <token>` (with the prefix and space).
