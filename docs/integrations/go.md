---
id: go
title: Go
sidebar_label: Go
slug: /integrations/go
---

# Go

Monitor Go application runtime metrics — goroutines, GC frequency, heap allocation, and CPU — using the built-in `prometheus/client_golang` library.

![Go Dashboard](https://grafana.com/api/dashboards/10826/images/6819/image)

## Key Metrics

| Metric | Description |
|--------|-------------|
| `go_goroutines` | Number of live goroutines |
| `go_memstats_heap_alloc_bytes` | Heap bytes currently allocated |
| `go_gc_duration_seconds` | GC pause duration histogram |
| `go_memstats_alloc_bytes_total` | Bytes allocated total (counter) |
| `go_memstats_gc_cpu_fraction` | Fraction of CPU used by GC |
| `process_cpu_seconds_total` | Total CPU usage |

## Prerequisites

- Go 1.17+
- `github.com/prometheus/client_golang`

## Configuration

### Option A — client_golang

```bash
go get github.com/prometheus/client_golang/prometheus
go get github.com/prometheus/client_golang/prometheus/promhttp
```

```go
package main

import (
    "net/http"
    "github.com/prometheus/client_golang/prometheus/promhttp"
)

func main() {
    http.Handle("/metrics", promhttp.Handler())
    http.ListenAndServe(":2112", nil)
}
```

**Prometheus scrape**

```yaml
scrape_configs:
  - job_name: go_app
    static_configs:
      - targets: ['localhost:2112']

remote_write:
  - url: https://<region>.xscalerlabs.com/api/v1/push
    headers:
      X-Scope-OrgID: <tenant-id>
    basic_auth:
      password: <api-token>
```

### Option B — Grafana Alloy

```alloy
prometheus.scrape "go_app" {
  targets    = [{"__address__" = "localhost:2112"}]
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
        - job_name: go_app
          static_configs:
            - targets: ['localhost:2112']

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
