---
id: supabase
title: Supabase
sidebar_label: Supabase
slug: /integrations/supabase
---

# Supabase

Monitor Supabase using the built-in Prometheus endpoint: PostgreSQL performance, Auth request rates, Storage usage, and Realtime connections.

**Pattern:** Supabase /metrics → Prometheus scrape → xScaler remote_write

---

## Prerequisites

- Supabase project (cloud or self-hosted)
- `service_role` key for authenticating the metrics endpoint scrape
- Network access to `<project-ref>.supabase.co` on port 443

---

## Option A: Prometheus Exporter

Scrape the built-in Supabase metrics endpoint directly. Replace `<project-ref>` with your project reference and use the `service_role` key as the Bearer token:

```yaml
scrape_configs:
  - job_name: supabase
    scheme: https
    metrics_path: /metrics
    static_configs:
      - targets: ["<project-ref>.supabase.co:443"]
    authorization:
      credentials: <service_role_key>

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
prometheus.scrape "supabase" {
  targets = [{
    __address__ = "<project-ref>.supabase.co:443",
    __scheme__  = "https",
  }]
  metrics_path = "/metrics"
  authorization {
    type        = "Bearer"
    credentials = "<service_role_key>"
  }
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
        - job_name: supabase
          scheme: https
          metrics_path: /metrics
          static_configs:
            - targets: ["<project-ref>.supabase.co:443"]
          authorization:
            type: Bearer
            credentials: <service_role_key>

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
      receivers:  [prometheus]
      processors: [memory_limiter, batch]
      exporters:  [otlphttp/xscaler]
```

---

## Logs

Collect Supabase service container logs (PostgreSQL, PostgREST, GoTrue, etc.). Add the following to your Alloy config:

```river
discovery.docker "supabase_containers" {
  host = "unix:///var/run/docker.sock"
  filter {
    name   = "name"
    values = ["supabase"]
  }
}

discovery.relabel "supabase_logs" {
  targets = discovery.docker.supabase_containers.targets
  rule {
    source_labels = ["__meta_docker_container_name"]
    regex         = "/(.*)"
    target_label  = "container"
  }
  rule {
    replacement  = "integrations/supabase"
    target_label = "job"
  }
}

loki.source.docker "supabase_logs" {
  host       = "unix:///var/run/docker.sock"
  targets    = discovery.relabel.supabase_logs.output
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
| `supabase_auth_users_total` | Total number of registered users in Auth |
| `supabase_realtime_connections` | Current active Realtime WebSocket connections |
| `pg_stat_database_numbackends` | Number of active PostgreSQL backend connections |
| `pg_stat_database_xact_commit` | Committed transactions per database |
| `supabase_storage_objects_total` | Total objects stored in Supabase Storage |
| `supabase_edge_function_invocations_total` | Cumulative Edge Function invocation count |
