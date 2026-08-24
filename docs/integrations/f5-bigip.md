---
id: f5-bigip
title: F5 BIG-IP
sidebar_label: F5 BIG-IP
slug: /integrations/f5-bigip
---

# F5 BIG-IP

Monitor F5 BIG-IP using the F5 BIG-IP Prometheus exporter: virtual server throughput, pool member health, SSL offload rates, connection counts, and system CPU/memory.

**Pattern:** f5-bigip-exporter → Prometheus scrape → xScaler `remote_write`

---

## Prerequisites

- BIG-IP 14.x+
- iControl REST API user with Operator role
- xScaler tenant credentials (token + tenant ID)

---

## Option A: Prometheus Exporter

```bash
docker run -d \
  -p 9142:9142 \
  -e F5_HOST=https://bigip.example.com \
  -e F5_USERNAME=monitor \
  -e F5_PASSWORD=pass \
  pr3nd1/f5-bigip-exporter
```

Add to `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: f5_bigip
    static_configs:
      - targets: ['localhost:9142']

remote_write:
  - url: https://euw1-01.m.xscalerlabs.com/api/v1/push
    authorization:
      credentials: <token>
    headers:
      X-Scope-OrgID: <tenant-id>
```

---

## Option B: Grafana Alloy

```river
prometheus.scrape "f5_bigip" {
  targets    = [{"__address__" = "localhost:9142"}]
  forward_to = [prometheus.remote_write.xscaler.receiver]
  scrape_interval = "60s"
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
        - job_name: f5_bigip
          static_configs:
            - targets: ['localhost:9142']
          scrape_interval: 60s

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

Collect BIG-IP LTM and APM logs. Add the following to your Alloy config:

```river
local.file_match "f5_bigip_logs" {
  path_targets = [{
    __address__ = "localhost",
    __path__    = "/var/log/ltm",
    instance    = constants.hostname,
    job         = "integrations/f5_bigip",
  }]
}

loki.source.file "f5_bigip_logs" {
  targets    = local.file_match.f5_bigip_logs.targets
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
| `f5_virtual_server_packets_in_total` | Packets received by virtual server |
| `f5_virtual_server_packets_out_total` | Packets sent by virtual server |
| `f5_virtual_server_current_connections` | Active connections to virtual server |
| `f5_pool_member_status` | Pool member availability (1=available) |
| `f5_node_monitor_status` | Node monitor status |
| `f5_system_cpu_usage` | System CPU utilisation |
| `f5_ssl_renegotiations_total` | SSL renegotiation count |
