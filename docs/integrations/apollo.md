---
id: apollo
title: Apollo Server
sidebar_label: Apollo Server
slug: /integrations/apollo
---

# Apollo Server

Monitor Apollo Server — GraphQL request rates, error counts, field execution latencies, and schema validation — using the Prometheus plugin for Apollo Server.

**Pattern:** Apollo /metrics → Prometheus scrape → xScaler `remote_write`

---

## Prerequisites

- Apollo Server 4.x
- Node.js 16+
- xScaler tenant credentials (token + tenant ID)

---

## Option A — Prometheus Exporter

Install the plugin:

```bash
npm install @apollo/server @bmatei/apollo-prometheus-exporter express
```

```typescript
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { createPrometheusExporterPlugin } from '@bmatei/apollo-prometheus-exporter';
import express from 'express';
import { register } from 'prom-client';

const app = express();
const plugin = createPrometheusExporterPlugin({ app });

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [plugin],
});

await server.start();
app.use('/graphql', expressMiddleware(server));

// Expose metrics
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.send(await register.metrics());
});

app.listen(4000);
```

```yaml
scrape_configs:
  - job_name: apollo_server
    static_configs:
      - targets: ['localhost:4000']
    metrics_path: /metrics

remote_write:
  - url: https://euw1-01.m.xscalerlabs.com/api/v1/push
    authorization:
      credentials: <token>
    headers:
      X-Scope-OrgID: <tenant-id>
```

---

## Option B — Grafana Alloy

```river
prometheus.scrape "apollo" {
  targets      = [{"__address__" = "localhost:4000"}]
  metrics_path = "/metrics"
  forward_to   = [prometheus.remote_write.xscaler.receiver]
}

prometheus.remote_write "xscaler" {
  endpoint {
    url = "https://euw1-01.m.xscalerlabs.com/api/v1/push"
    authorization {
      type        = "Bearer"
      credentials = "<token>"
    }
    headers = { "X-Scope-OrgID" = "<tenant-id>" }
  }
}
```

---

## Option C — OpenTelemetry Collector

Use `@opentelemetry/api` with OTLP export from Node.js:

```bash
npm install @opentelemetry/sdk-node @opentelemetry/exporter-trace-otlp-http \
  @opentelemetry/instrumentation-graphql
```

Set env vars for the collector:

```bash
OTEL_EXPORTER_OTLP_ENDPOINT=https://euw1-01.m.xscalerlabs.com
OTEL_EXPORTER_OTLP_HEADERS="Authorization=Bearer <token>,X-Scope-OrgID=<tenant-id>"
```

---

## Logs

Collect Apollo GraphQL server log — tail the application log file. Add the following to your Alloy config, adjusting `__path__` to match your application's log file location:

```river
local.file_match "apollo_logs" {
  path_targets = [{
    __address__ = "localhost",
    __path__    = "/var/log/apollo/app.log",
    instance    = constants.hostname,
    job         = "integrations/apollo",
  }]
}

loki.source.file "apollo_logs" {
  targets    = local.file_match.apollo_logs.targets
  forward_to = [loki.write.xscaler.receiver]
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

## Key metrics

| Metric | Description |
|--------|-------------|
| `apollo_server_request_count` | Total GraphQL requests |
| `apollo_server_errors_total` | Total errors by error code |
| `apollo_server_request_duration_ms` | Request duration histogram |
| `graphql_field_execution_duration_ms` | Per-field resolver duration |
| `apollo_server_schema_validation_total` | Schema validation calls |
| `apollo_server_cache_hit_total` | Response cache hits |
