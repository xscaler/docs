---
id: metrics-endpoint
title: Custom Metrics Endpoint
sidebar_label: Custom Metrics Endpoint
slug: /integrations/metrics-endpoint
---

# Custom Metrics Endpoint

Expose Prometheus metrics from any application and forward them to xScaler. Use the official Prometheus client libraries to instrument your code with counters, gauges, histograms, and summaries.

**Pattern:** Custom `/metrics` endpoint → Prometheus scrape → xScaler `remote_write`

---

## Prerequisites

- Any language runtime
- xScaler tenant credentials (token + tenant ID)

---

## Instrument Your Application

### Python

```bash
pip install prometheus-client
```

```python
from prometheus_client import Counter, Histogram, start_http_server
import time

REQUEST_COUNT = Counter('myapp_requests_total', 'Total requests', ['method', 'endpoint'])
REQUEST_LATENCY = Histogram('myapp_request_duration_seconds', 'Request latency')

# Expose /metrics on port 8000
start_http_server(8000)

# In your handler:
REQUEST_COUNT.labels(method='GET', endpoint='/api').inc()
with REQUEST_LATENCY.time():
    handle_request()
```

### Node.js

```bash
npm install prom-client
```

```js
const client = require('prom-client');
const express = require('express');

const app = express();
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequests = new client.Counter({
  name: 'myapp_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'status'],
  registers: [register],
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.send(await register.metrics());
});
```

### Go

```bash
go get github.com/prometheus/client_golang/prometheus
```

```go
import (
  "github.com/prometheus/client_golang/prometheus"
  "github.com/prometheus/client_golang/prometheus/promhttp"
)

var requestCount = prometheus.NewCounterVec(
  prometheus.CounterOpts{Name: "myapp_requests_total"},
  []string{"method"},
)

func main() {
  prometheus.MustRegister(requestCount)
  http.Handle("/metrics", promhttp.Handler())
  http.ListenAndServe(":8080", nil)
}
```

---

## Option A — Prometheus

```yaml
scrape_configs:
  - job_name: my_app
    static_configs:
      - targets: ['localhost:8080']

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
prometheus.scrape "my_app" {
  targets    = [{"__address__" = "localhost:8080"}]
  forward_to = [prometheus.remote_write.xscaler.receiver]
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

```yaml
receivers:
  prometheus:
    config:
      scrape_configs:
        - job_name: my_app
          static_configs:
            - targets: ['localhost:8080']

processors:
  batch:
    timeout: 10s

exporters:
  otlphttp/xscaler:
    endpoint: https://euw1-01.m.xscalerlabs.com
    headers:
      Authorization: "Bearer <token>"
      X-Scope-OrgID: "<tenant-id>"
    compression: gzip

service:
  pipelines:
    metrics:
      receivers:  [prometheus]
      processors: [batch]
      exporters:  [otlphttp/xscaler]
```

---

## Metric types

| Type | Use for |
|------|---------|
| `Counter` | Things that only increase: requests, errors, bytes |
| `Gauge` | Values that go up and down: queue depth, memory, active connections |
| `Histogram` | Measured distributions: request duration, payload size |
| `Summary` | Quantiles over a sliding window: p50, p95, p99 latency |

## Logs

Collect application log — tail the log file for the service exposing the `/metrics` endpoint. Add the following to your Alloy config, adjusting `__path__` to match your application's log file location:

```river
local.file_match "metrics_endpoint_logs" {
  path_targets = [{
    __address__ = "localhost",
    __path__    = "/var/log/metrics_endpoint/app.log",
    instance    = constants.hostname,
    job         = "integrations/metrics_endpoint",
  }]
}

loki.source.file "metrics_endpoint_logs" {
  targets    = local.file_match.metrics_endpoint_logs.targets
  forward_to = [loki.write.xscaler.receiver]
}

loki.write "xscaler" {
  endpoint {
    url = "https://euw1-01.l.xscalerlabs.com/api/v1/push"

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

