---
id: consul
title: Consul
sidebar_label: Consul
slug: /integrations/consul
---

# Consul

Monitor Consul Raft leadership, node health, service registrations, and RPC activity.

![Consul Dashboard](https://grafana.com/api/dashboards/13396/images/9348/image)

## Key Metrics

| Metric | Description |
|--------|-------------|
| `consul_raft_leader` | Whether this agent is the Raft leader |
| `consul_catalog_nodes_total` | Registered nodes |
| `consul_catalog_services_total` | Registered services |
| `consul_health_node_status` | Node health check status |
| `consul_rpc_request_count` | RPC request rate |
| `consul_serf_events` | Serf event count |

## Prerequisites

- Consul 1.9+
- Prometheus telemetry enabled in Consul config

## Configuration

**Enable Prometheus telemetry in consul.hcl**

```hcl
telemetry {
  prometheus_retention_time = "60s"
  disable_hostname = false
}
```

Metrics are available at `http://localhost:8500/v1/agent/metrics?format=prometheus`.

### Option A — Prometheus scrape

```yaml
scrape_configs:
  - job_name: consul
    metrics_path: /v1/agent/metrics
    params:
      format: [prometheus]
    static_configs:
      - targets: ['localhost:8500']

remote_write:
  - url: https://<region>.xscalerlabs.com/api/v1/push
    headers:
      X-Scope-OrgID: <tenant-id>
    basic_auth:
      password: <api-token>
```

### Option B — Grafana Alloy

```alloy
prometheus.scrape "consul" {
  targets      = [{"__address__" = "localhost:8500"}]
  metrics_path = "/v1/agent/metrics"
  params       = { format = ["prometheus"] }
  forward_to   = [prometheus.remote_write.xscaler.receiver]
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
        - job_name: consul
          metrics_path: /v1/agent/metrics
          params:
            format: [prometheus]
          static_configs:
            - targets: ['localhost:8500']

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

## Logs

Collect Consul agent and server log via systemd journal. Add the following to your Alloy config:

```river
loki.source.journal "consul_journal" {
  forward_to    = [loki.write.xscaler.receiver]
  relabel_rules = loki.relabel.consul_journal.rules
  labels = {
    job      = "integrations/consul",
    instance = constants.hostname,
  }
}

loki.relabel "consul_journal" {
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

