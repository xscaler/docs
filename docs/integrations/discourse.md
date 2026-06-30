---
id: discourse
title: Discourse
sidebar_label: Discourse
slug: /integrations/discourse
---

# Discourse

Monitor Discourse — HTTP request rates, active users, page views, topic/post creation, and Redis/Sidekiq health — using Discourse's built-in Prometheus exporter.

**Pattern:** Discourse /metrics → Prometheus scrape → xScaler `remote_write`

---

## Prerequisites

- Discourse 2.7+
- Admin access to enable the Prometheus exporter
- xScaler tenant credentials (token + tenant ID)

---

## Enable Metrics

In Discourse Admin → Settings → search for "prometheus":

1. Enable **enable prometheus exporter**
2. Note the port (default: 9405)

Or via `discourse.conf`:

```
DISCOURSE_PROMETHEUS_PORT=9405
```

---

## Option A — Prometheus

```yaml
scrape_configs:
  - job_name: discourse
    static_configs:
      - targets: ['localhost:9405']

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
prometheus.scrape "discourse" {
  targets    = [{"__address__" = "localhost:9405"}]
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
        - job_name: discourse
          static_configs:
            - targets: ['localhost:9405']

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

Collect Discourse application and web container logs. Add the following to your Alloy config:

```river
discovery.docker "discourse_containers" {
  host = "unix:///var/run/docker.sock"
  filter {
    name   = "name"
    values = ["discourse"]
  }
}

discovery.relabel "discourse_logs" {
  targets = discovery.docker.discourse_containers.targets
  rule {
    source_labels = ["__meta_docker_container_name"]
    regex         = "/(.*)"
    target_label  = "container"
  }
  rule {
    replacement  = "integrations/discourse"
    target_label = "job"
  }
}

loki.source.docker "discourse_logs" {
  host       = "unix:///var/run/docker.sock"
  targets    = discovery.relabel.discourse_logs.output
  forward_to = [loki.write.xscaler.receiver]
  labels     = { instance = constants.hostname }
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
| `discourse_http_requests_total` | Total HTTP requests |
| `discourse_active_users` | Currently active users |
| `discourse_page_views_total` | Total page views |
| `discourse_topics_created_total` | Topics created |
| `discourse_posts_created_total` | Posts created |
| `discourse_redis_connections` | Redis connection count |
| `discourse_sidekiq_jobs_total` | Background jobs processed |
