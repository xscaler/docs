---
id: nodejs
title: Node.js
sidebar_label: Node.js
slug: /integrations/nodejs
---

# Node.js

Monitor Node.js heap memory, garbage collection, event loop lag, and active handles using the `prom-client` library.

![Node.js Dashboard](https://grafana.com/api/dashboards/11159/images/7101/image)

## Key Metrics

| Metric | Description |
|--------|-------------|
| `nodejs_heap_size_used_bytes` | Heap memory currently in use |
| `nodejs_heap_size_total_bytes` | Total heap size allocated |
| `nodejs_gc_duration_seconds` | GC duration histogram |
| `nodejs_active_handles_total` | Active handles (sockets, timers) |
| `nodejs_eventloop_lag_seconds` | Event loop lag |
| `process_cpu_user_seconds_total` | CPU user time |

## Prerequisites

- Node.js 14+
- `prom-client` npm package

## Configuration

### Option A — prom-client

Install the library:

```bash
npm install prom-client
```

Expose metrics in your app:

```javascript
const client = require('prom-client');
const express = require('express');
const app = express();

client.collectDefaultMetrics();

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

app.listen(9091);
```

**Prometheus scrape**

```yaml
scrape_configs:
  - job_name: nodejs
    static_configs:
      - targets: ['localhost:9091']

remote_write:
  - url: https://<region>.xscalerlabs.com/api/v1/push
    headers:
      X-Scope-OrgID: <tenant-id>
    basic_auth:
      password: <api-token>
```

### Option B — Grafana Alloy

```alloy
prometheus.scrape "nodejs" {
  targets    = [{"__address__" = "localhost:9091"}]
  forward_to = [prometheus.remote_write.xscaler.receiver]
}

prometheus.remote_write "xscaler" {
  endpoint {
    url = "https://<region>.xscalerlabs.com/api/v1/push"
    headers = { "X-Scope-OrgID" = "<tenant-id>" }
    basic_auth { password = "<api-token>" }
  }
}
```

### Option C — OpenTelemetry Collector

```yaml
receivers:
  prometheus:
    config:
      scrape_configs:
        - job_name: nodejs
          static_configs:
            - targets: ['localhost:9091']

exporters:
  prometheusremotewrite:
    endpoint: https://<region>.xscalerlabs.com/api/v1/push
    headers:
      Authorization: Bearer <api-token>
      X-Scope-OrgID: <tenant-id>

service:
  pipelines:
    metrics:
      receivers: [prometheus]
      exporters: [prometheusremotewrite]
```
