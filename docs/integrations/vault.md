---
id: vault
title: HashiCorp Vault
sidebar_label: HashiCorp Vault
slug: /integrations/vault
---

# HashiCorp Vault

Monitor Vault seal status, token counts, request rates, and audit log health.

![HashiCorp Vault Dashboard](https://grafana.com/api/dashboards/12904/images/8810/image)

## Key Metrics

| Metric | Description |
|--------|-------------|
| `vault_core_active` | Whether this node is the active leader |
| `vault_core_sealed` | Seal status (1=sealed) |
| `vault_token_count_total` | Total token count |
| `vault_barrier_get_count` | Barrier GET operations |
| `vault_core_handle_request_count` | Requests handled |
| `vault_runtime_alloc_bytes` | Memory allocated by Vault |

## Prerequisites

- HashiCorp Vault 1.3+
- Telemetry enabled in Vault config

## Configuration

**Enable telemetry in vault.hcl**

```hcl
telemetry {
  prometheus_retention_time = "30s"
  disable_hostname = true
}
```

Metrics are available at `https://localhost:8200/v1/sys/metrics?format=prometheus` with a valid Vault token.

### Option A — Prometheus scrape

```yaml
scrape_configs:
  - job_name: vault
    metrics_path: /v1/sys/metrics
    params:
      format: [prometheus]
    bearer_token: <vault-token>
    static_configs:
      - targets: ['localhost:8200']

remote_write:
  - url: https://<region>.xscalerlabs.com/api/v1/push
    headers:
      X-Scope-OrgID: <tenant-id>
    basic_auth:
      password: <api-token>
```

### Option B — Grafana Alloy

```alloy
prometheus.scrape "vault" {
  targets      = [{"__address__" = "localhost:8200"}]
  metrics_path = "/v1/sys/metrics"
  params       = { format = ["prometheus"] }
  bearer_token = "<vault-token>"
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
        - job_name: vault
          metrics_path: /v1/sys/metrics
          params:
            format: [prometheus]
          bearer_token: ${VAULT_TOKEN}
          static_configs:
            - targets: ['localhost:8200']

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
