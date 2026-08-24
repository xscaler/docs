---
id: grafana-agent
title: Grafana Agent / Alloy
sidebar_label: Grafana Agent / Alloy
slug: /integrations/grafana-agent
---

# Grafana Agent / Alloy

Monitor Grafana Agent or Alloy itself using the built-in self-metrics endpoint: component health, WAL status, remote write queue lag, and scrape errors.

**Pattern:** Agent /metrics → Prometheus scrape → xScaler `remote_write`

---

## Prerequisites

- Grafana Agent 0.33+ or Grafana Alloy 1.x
- xScaler tenant credentials (token + tenant ID)

---

## Option A: Prometheus

Grafana Agent exposes self-metrics at `:12345/metrics` by default. Alloy uses the same port.

```yaml
scrape_configs:
  - job_name: grafana_agent
    static_configs:
      - targets: ['localhost:12345']

remote_write:
  - url: https://euw1-01.m.xscalerlabs.com/api/v1/push
    authorization:
      credentials: <token>
    headers:
      X-Scope-OrgID: <tenant-id>
```

---

## Option B: Self-scrape in Alloy

Alloy can scrape itself natively:

```river
prometheus.scrape "agent_self" {
  targets    = [{"__address__" = "localhost:12345"}]
  forward_to = [prometheus.remote_write.xscaler.receiver]
  job_name   = "alloy_self"
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

## Option C: OpenTelemetry Collector

```yaml
receivers:
  prometheus:
    config:
      scrape_configs:
        - job_name: grafana_agent
          static_configs:
            - targets: ['localhost:12345']

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

Collect Grafana Agent service log via systemd journal. Add the following to your Alloy config:

```river
loki.source.journal "grafana_agent_journal" {
  forward_to    = [loki.write.xscaler.receiver]
  relabel_rules = loki.relabel.grafana_agent_journal.rules
  labels = {
    job      = "integrations/grafana_agent",
    instance = constants.hostname,
  }
}

loki.relabel "grafana_agent_journal" {
  forward_to = []
  rule {
    source_labels = ["__journal__systemd_unit"]
    target_label  = "unit"
  }
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

## Key metrics

| Metric | Description |
|--------|-------------|
| `agent_component_controller_running_components` | Running Alloy components |
| `prometheus_remote_storage_samples_failed_total` | Failed samples to remote write |
| `prometheus_remote_write_queue_highest_sent_timestamp_seconds` | WAL lag indicator |
| `agent_wal_samples_appended_total` | Samples written to WAL |
| `prometheus_target_scrape_pool_targets` | Active scrape targets |
| `prometheus_sd_discovered_targets` | Discovered targets by SD |
