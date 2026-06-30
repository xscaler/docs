---
id: home-assistant
title: Home Assistant
sidebar_label: Home Assistant
slug: /integrations/home-assistant
---

# Home Assistant

Monitor Home Assistant — entity states (sensors, switches, climate, binary sensors), automation trigger counts, and integration health — using the built-in Prometheus integration.

**Pattern:** Home Assistant /api/prometheus → Prometheus scrape → xScaler `remote_write`

---

## Prerequisites

- Home Assistant 2021.x+
- Long-lived access token
- xScaler tenant credentials (token + tenant ID)

---

## Enable Prometheus Integration

In `configuration.yaml`:

```yaml
prometheus:
  namespace: homeassistant
  filter:
    include_domains:
      - sensor
      - binary_sensor
      - switch
      - climate
      - light
```

Restart Home Assistant. Metrics are at `http://localhost:8123/api/prometheus`.

---

## Option A — Prometheus

```yaml
scrape_configs:
  - job_name: home_assistant
    metrics_path: /api/prometheus
    bearer_token: YOUR_LONG_LIVED_ACCESS_TOKEN
    static_configs:
      - targets: ['localhost:8123']

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
prometheus.scrape "home_assistant" {
  targets      = [{"__address__" = "localhost:8123"}]
  metrics_path = "/api/prometheus"
  bearer_token = "YOUR_LONG_LIVED_ACCESS_TOKEN"
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

```yaml
receivers:
  prometheus:
    config:
      scrape_configs:
        - job_name: home_assistant
          metrics_path: /api/prometheus
          bearer_token: YOUR_LONG_LIVED_ACCESS_TOKEN
          static_configs:
            - targets: ['localhost:8123']

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

Collect Home Assistant log. Add the following to your Alloy config:

```river
local.file_match "home_assistant_logs" {
  path_targets = [{
    __address__ = "localhost",
    __path__    = "/config/home-assistant.log",
    instance    = constants.hostname,
    job         = "integrations/home_assistant",
  }]
}

loki.source.file "home_assistant_logs" {
  targets    = local.file_match.home_assistant_logs.targets
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

## Key metrics

| Metric | Description |
|--------|-------------|
| `homeassistant_sensor_state` | Numeric sensor values |
| `homeassistant_binary_sensor_state` | Binary sensor states (0/1) |
| `homeassistant_switch_state` | Switch on/off state |
| `homeassistant_climate_current_temperature_celsius` | Thermostat temperature |
| `homeassistant_climate_target_temperature_celsius` | Thermostat target |
| `homeassistant_automation_triggered_total` | Automation trigger count |
