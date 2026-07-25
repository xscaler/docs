---
id: otel-sdk-nodejs
title: OTel SDK — Node.js
sidebar_label: OTel SDK — Node.js
slug: /logs/otel-sdk-nodejs
---

# OTel SDK — Node.js

Send logs directly from a Node.js application to xScaler using the OpenTelemetry JS SDK over OTLP/HTTP.

:::warning Required headers
Both headers must be passed to `OTLPLogExporter`:
- `Authorization: "Bearer <token>"`
- `X-Scope-OrgID: "<tenant-id>"`
:::

---

## Install dependencies

```bash
npm install @opentelemetry/sdk-node \
            @opentelemetry/exporter-logs-otlp-http \
            @opentelemetry/sdk-logs \
            @opentelemetry/winston-transport
```

---

## Setup

Create `otel.js` and require it before your application code:

```js
const { OTLPLogExporter } = require('@opentelemetry/exporter-logs-otlp-http');
const { LoggerProvider, BatchLogRecordProcessor } = require('@opentelemetry/sdk-logs');
const { logs } = require('@opentelemetry/api-logs');
const { Resource } = require('@opentelemetry/resources');
const { SEMRESATTRS_SERVICE_NAME } = require('@opentelemetry/semantic-conventions');

const exporter = new OTLPLogExporter({
  url: 'https://euw1-01.l.xscalerlabs.com/otlp/v1/logs',
  headers: {
    Authorization: `Bearer ${process.env.XSCALER_TOKEN}`,
    'X-Scope-OrgID': process.env.XSCALER_TENANT_ID,
  },
});

const provider = new LoggerProvider({
  resource: new Resource({
    [SEMRESATTRS_SERVICE_NAME]: 'my-service',
  }),
});

provider.addLogRecordProcessor(new BatchLogRecordProcessor(exporter));
logs.setGlobalLoggerProvider(provider);

// Flush on exit
process.on('SIGTERM', async () => {
  await provider.shutdown();
  process.exit(0);
});
```

---

## Use with Winston

```bash
npm install winston @opentelemetry/winston-transport
```

```js
const winston = require('winston');
const { OpenTelemetryTransportV3 } = require('@opentelemetry/winston-transport');

// otel.js must be required first (see Setup above)
require('./otel');

const logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console(),
    new OpenTelemetryTransportV3(),
  ],
});

logger.info('application started', { version: '1.0.0' });
logger.warn('high memory usage', { usedMb: 480 });
logger.error('database connection failed', { host: 'db.internal' });
```

---

## Use with Pino

```bash
npm install pino @opentelemetry/pino-transport
```

```js
const pino = require('pino');

const logger = pino({
  transport: {
    targets: [
      { target: 'pino-pretty' },
      {
        target: '@opentelemetry/pino-transport',
        options: {
          resourceAttributes: { 'service.name': 'my-service' },
        },
      },
    ],
  },
});
```

---

## Run your application

```bash
XSCALER_TOKEN=<token> XSCALER_TENANT_ID=<tenant-id> node -r ./otel.js app.js
```

---

## Troubleshooting

**Logs not arriving**
- Verify the `url` is the full path: `https://euw1-01.l.xscalerlabs.com/otlp/v1/logs`
- Check `Authorization` and `X-Scope-OrgID` are both in the `headers` object.
- Enable SDK diagnostics: `OTEL_LOG_LEVEL=debug node -r ./otel.js app.js`

**401 Unauthorized**
- Confirm `XSCALER_TOKEN` is set and the header reads `Bearer <token>` (with the prefix and space).

**401 Unauthorized — "x-scope-orgid mismatch"**
- `X-Scope-OrgID` is missing from `headers`, uses the wrong key name, or its value doesn't match your token's tenant.
