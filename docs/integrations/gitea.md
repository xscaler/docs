---
id: gitea
title: Gitea
sidebar_label: Gitea
slug: /integrations/gitea
---

# Gitea

Monitor Gitea — repositories, users, issues, pull requests, and process-level resource usage — using Gitea's built-in Prometheus endpoint.

**Pattern:** Gitea /metrics → Prometheus scrape → xScaler `remote_write`

---

## Prerequisites

- Gitea 1.13+
- xScaler tenant credentials (token + tenant ID)

---

## Enable Metrics

In `app.ini`:

```ini
[metrics]
ENABLED = true
TOKEN   =
```

Restart Gitea. Metrics are available at `http://localhost:3000/metrics`.

---

## Option A — Prometheus

```yaml
scrape_configs:
  - job_name: gitea
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: /metrics

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
prometheus.scrape "gitea" {
  targets      = [{"__address__" = "localhost:3000"}]
  metrics_path = "/metrics"
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
        - job_name: gitea
          static_configs:
            - targets: ['localhost:3000']
          metrics_path: /metrics

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

Collect Gitea server log. Add the following to your Alloy config:

```river
local.file_match "gitea_logs" {
  path_targets = [{
    __address__ = "localhost",
    __path__    = "/var/log/gitea/*.log",
    instance    = constants.hostname,
    job         = "integrations/gitea",
  }]
}

loki.source.file "gitea_logs" {
  targets    = local.file_match.gitea_logs.targets
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
| `gitea_repositories_total` | Total number of repositories |
| `gitea_users_total` | Total registered users |
| `gitea_issues_total` | Total issues by state |
| `gitea_pulls_total` | Total pull requests |
| `gitea_organizations_total` | Total organizations |
| `process_resident_memory_bytes` | Gitea process memory usage |
| `process_cpu_seconds_total` | Gitea CPU time |
