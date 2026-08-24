---
id: dnsmasq
title: Dnsmasq
sidebar_label: Dnsmasq
slug: /integrations/dnsmasq
---

# Dnsmasq

Dnsmasq is a small DNS forwarder and DHCP server used in home networks, containers, and embedded systems. Monitoring it gives you query rates, cache efficiency, and active DHCP leases.

**Pattern:** dnsmasq_exporter → Prometheus scrape → xScaler remote_write

---

## Prerequisites

- Dnsmasq running with `--local-service` and the statistics socket enabled (`--no-daemon` or a systemd unit)
- `dnsmasq_exporter` binary available ([GitHub](https://github.com/google/dnsmasq_exporter))
- xScaler remote_write credentials (Bearer token + tenant ID)

---

## Option A: Prometheus Exporter

**1. Start dnsmasq_exporter**

```bash
dnsmasq_exporter \
  --dnsmasq.address=localhost:53 \
  --listen-address=0.0.0.0:9153
```

For systems using the dnsmasq stats socket (e.g. `/var/run/dnsmasq/dnsmasq.pid`), ensure `--enable-dbus` or the HTTP stats port (`--port=5380`) is active.

**2. Verify the exporter**

```bash
curl http://localhost:9153/metrics | grep dnsmasq
```

**3. Configure Prometheus remote_write**

```yaml
scrape_configs:
  - job_name: dnsmasq
    static_configs:
      - targets: ["localhost:9153"]

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
prometheus.scrape "dnsmasq" {
  targets = [{ "__address__" = "localhost:9153" }]
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

## Option C: OpenTelemetry Collector

```yaml
receivers:
  prometheus:
    config:
      scrape_configs:
        - job_name: dnsmasq
          static_configs:
            - targets: ["localhost:9153"]

processors:
  memory_limiter:
    check_interval: 1s
    limit_mib: 256
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
      receivers: [prometheus]
      processors: [memory_limiter, batch]
      exporters: [otlphttp/xscaler]
```

---

## Logs

Collect dnsmasq query and DHCP log via systemd journal. Add the following to your Alloy config:

```river
loki.source.journal "dnsmasq_journal" {
  forward_to    = [loki.write.xscaler.receiver]
  relabel_rules = loki.relabel.dnsmasq_journal.rules
  labels = {
    job      = "integrations/dnsmasq",
    instance = constants.hostname,
  }
}

loki.relabel "dnsmasq_journal" {
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
| `dnsmasq_queries_total` | Total number of DNS queries received |
| `dnsmasq_cache_hits` | Number of DNS queries answered from cache |
| `dnsmasq_cache_misses` | Number of DNS queries that missed the cache |
| `dnsmasq_leases_count` | Number of active DHCP leases |
| `dnsmasq_cache_size` | Configured maximum cache size (entries) |
