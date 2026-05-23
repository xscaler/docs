---
id: nomad
title: Nomad
sidebar_label: Nomad
slug: /integrations/nomad
---

# Nomad

Monitor HashiCorp Nomad — running allocations, job health, cluster resource utilization, and scheduler dispatch rates — using Nomad's built-in Prometheus metrics endpoint.

**Pattern:** Nomad /v1/metrics → Prometheus scrape → xScaler `remote_write`

---

## Prerequisites

- Nomad 1.x+
- Telemetry enabled in Nomad config
- xScaler tenant credentials (token + tenant ID)

---

## Enable Telemetry

In `nomad.hcl`:

```hcl
telemetry {
  prometheus_metrics = true
  disable_hostname   = true
}
```

Metrics are available at `:4646/v1/metrics?format=prometheus`.

---

## Option A — Prometheus

```yaml
scrape_configs:
  - job_name: nomad
    metrics_path: /v1/metrics
    params:
      format: [prometheus]
    static_configs:
      - targets: ['localhost:4646']

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
prometheus.scrape "nomad" {
  targets      = [{"__address__" = "localhost:4646"}]
  metrics_path = "/v1/metrics"
  forward_to   = [prometheus.remote_write.xscaler.receiver]
  params       = { format = ["prometheus"] }
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
        - job_name: nomad
          metrics_path: /v1/metrics
          params:
            format: [prometheus]
          static_configs:
            - targets: ['localhost:4646']

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

## Logs

Collect Nomad agent log via systemd journal. Add the following to your Alloy config:

```river
loki.source.journal "nomad_journal" {
  forward_to    = [loki.write.xscaler.receiver]
  relabel_rules = loki.relabel.nomad_journal.rules
  labels = {
    job      = "integrations/nomad",
    instance = constants.hostname,
  }
}

loki.relabel "nomad_journal" {
  forward_to = []
  rule {
    source_labels = ["__journal__systemd_unit"]
    target_label  = "unit"
  }
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
| `nomad_client_allocs_running` | Running allocations per client |
| `nomad_nomad_job_summary_running` | Running allocations per job |
| `nomad_client_resources_cpu_allocated` | CPU allocated on client |
| `nomad_client_resources_memory_allocated` | Memory allocated on client |
| `nomad_scheduler_dispatch_job_total` | Jobs dispatched by scheduler |
| `nomad_broker_total_unacked` | Unacknowledged eval broker messages |
