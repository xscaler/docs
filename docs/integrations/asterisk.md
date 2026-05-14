---
id: asterisk
title: Asterisk
sidebar_label: Asterisk
slug: /integrations/asterisk
---

# Asterisk

Monitor Asterisk PBX — active channels, call volumes, SIP registration status, voicemail counts, and system uptime — using asterisk-exporter.

**Pattern:** asterisk_exporter → Prometheus scrape → xScaler `remote_write`

---

## Prerequisites

- Asterisk 16+
- ARI (Asterisk REST Interface) enabled
- xScaler tenant credentials (token + tenant ID)

---

## Enable ARI

In `asterisk/ari.conf`:

```ini
[general]
enabled = yes
pretty = yes
allowed_origins = *

[xscaler_monitor]
type = user
password = ari_password
read_only = no
```

---

## Option A — Prometheus Exporter

```bash
docker run -d \
  -p 9088:9088 \
  -e ASTERISK_URI=http://localhost:8088 \
  -e ASTERISK_USERNAME=xscaler_monitor \
  -e ASTERISK_PASSWORD=ari_password \
  bitergia/asterisk-exporter
```

Add to `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: asterisk
    static_configs:
      - targets: ['localhost:9088']

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
prometheus.scrape "asterisk" {
  targets    = [{"__address__" = "localhost:9088"}]
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
        - job_name: asterisk
          static_configs:
            - targets: ['localhost:9088']

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

## Key metrics

| Metric | Description |
|--------|-------------|
| `asterisk_active_channels` | Currently active channels |
| `asterisk_active_calls` | Active calls in progress |
| `asterisk_calls_processed_total` | Total calls processed |
| `asterisk_registrations_total` | SIP registrations by status |
| `asterisk_voicemail_messages_total` | Voicemail messages by mailbox |
| `asterisk_uptime_seconds` | Asterisk process uptime |
