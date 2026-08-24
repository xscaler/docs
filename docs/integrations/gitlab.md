---
id: gitlab
title: GitLab
sidebar_label: GitLab
slug: /integrations/gitlab
---

# GitLab

Monitor GitLab using its built-in Prometheus metrics endpoint: request throughput, SQL query latency, cache hit rates, Gitaly connections, and Sidekiq job queues.

**Pattern:** GitLab /metrics → Prometheus scrape → xScaler `remote_write`

---

## Prerequisites

- GitLab 13+ (self-managed)
- Admin access to enable metrics
- xScaler tenant credentials (token + tenant ID)

---

## Enable metrics

In GitLab Admin → Settings → Metrics and profiling, enable:
- **Prometheus metrics** (exposes `/-/metrics`)
- **Sidekiq metrics** (exposes `:8082/metrics`)

Or in `gitlab.rb`:

```ruby
gitlab_rails['monitoring_whitelist'] = ['0.0.0.0/0']
prometheus['enable'] = true
```

Run `gitlab-ctl reconfigure`.

---

## Option A: Prometheus

```yaml
scrape_configs:
  - job_name: gitlab
    metrics_path: /-/metrics
    params:
      token: [YOUR_ADMIN_TOKEN]
    static_configs:
      - targets: ['gitlab.example.com:443']
    scheme: https

  - job_name: gitlab_sidekiq
    static_configs:
      - targets: ['localhost:8082']

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
prometheus.scrape "gitlab" {
  targets      = [{"__address__" = "gitlab.example.com:443"}]
  metrics_path = "/-/metrics"
  scheme       = "https"
  forward_to   = [prometheus.remote_write.xscaler.receiver]
}

prometheus.scrape "gitlab_sidekiq" {
  targets    = [{"__address__" = "localhost:8082"}]
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
        - job_name: gitlab
          metrics_path: /-/metrics
          static_configs:
            - targets: ['gitlab.example.com:443']
          scheme: https

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

Collect GitLab Rails production log and Nginx access log. Add the following to your Alloy config:

```river
local.file_match "gitlab_logs" {
  path_targets = [{
    __address__ = "localhost",
    __path__    = "/var/log/gitlab/gitlab-rails/production.log",
    instance    = constants.hostname,
    job         = "integrations/gitlab",
  }]
}

loki.source.file "gitlab_logs" {
  targets    = local.file_match.gitlab_logs.targets
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
| `gitlab_transaction_duration_seconds` | Request duration by controller action |
| `gitlab_sql_duration_seconds` | SQL query duration |
| `gitlab_cache_misses_total` | Cache misses by store |
| `gitaly_connections_total` | Gitaly gRPC connections |
| `gitlab_workhorse_http_requests_total` | Workhorse HTTP requests |
| `sidekiq_jobs_processed_total` | Sidekiq jobs completed |
| `sidekiq_queue_size` | Sidekiq queue depth |
