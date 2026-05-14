---
id: ruby
title: Ruby / Rack
sidebar_label: Ruby / Rack
slug: /integrations/ruby
---

# Ruby / Rack

Expose Prometheus metrics from any Ruby or Rack application — request rates, latencies, GC stats, and Puma thread pool — using the `prometheus-client` gem.

**Pattern:** Ruby prometheus-client → Prometheus scrape → xScaler `remote_write`

---

## Prerequisites

- Ruby 2.7+
- Puma or any Rack-compatible server
- xScaler tenant credentials (token + tenant ID)

---

## Option A — Prometheus Exporter

Add to `Gemfile`:

```ruby
gem 'prometheus-client'
gem 'rack'
```

Mount the metrics endpoint in your Rack app (`config.ru`):

```ruby
require 'prometheus/client'
require 'prometheus/client/rack/exporter'

registry = Prometheus::Client.registry

# Example counter
http_requests = registry.counter(:http_requests_total,
  docstring: 'Total HTTP requests',
  labels: [:method, :path, :status])

use Prometheus::Client::Rack::Exporter
# Track requests
use Prometheus::Client::Rack::Collector

run MyApp
```

Metrics are exposed at `/metrics` on your app port.

```yaml
scrape_configs:
  - job_name: ruby_app
    static_configs:
      - targets: ['localhost:9292']

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
prometheus.scrape "ruby" {
  targets    = [{"__address__" = "localhost:9292"}]
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

Use the OpenTelemetry Ruby SDK with OTLP export instead:

```ruby
# Gemfile
gem 'opentelemetry-sdk'
gem 'opentelemetry-exporter-otlp'
gem 'opentelemetry-instrumentation-rack'
```

```ruby
# config/initializers/opentelemetry.rb
require 'opentelemetry/sdk'
require 'opentelemetry/exporter/otlp'

OpenTelemetry::SDK.configure do |c|
  c.use 'OpenTelemetry::Instrumentation::Rack'
end
```

Set env vars:

```bash
OTEL_EXPORTER_OTLP_ENDPOINT=https://euw1-01.m.xscalerlabs.com
OTEL_EXPORTER_OTLP_HEADERS="Authorization=Bearer <token>,X-Scope-OrgID=<tenant-id>"
```

---

## Key metrics

| Metric | Description |
|--------|-------------|
| `http_requests_total` | Total HTTP requests by method/path/status |
| `http_request_duration_seconds` | Request duration histogram |
| `ruby_gc_runs_total` | Ruby GC runs |
| `ruby_process_cpu_seconds_total` | Process CPU time |
| `ruby_process_resident_memory_bytes` | Process RSS memory |
| `puma_backlog_total` | Puma request backlog |
| `puma_pool_capacity` | Available Puma threads |
