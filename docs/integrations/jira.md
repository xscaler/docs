---
id: jira
title: Jira
sidebar_label: Jira
slug: /integrations/jira
---

# Jira

Monitor Jira using jira-prometheus-exporter: open/in-progress/resolved issue counts, JVM memory, and database connection pool health.

**Pattern:** jira_exporter → Prometheus scrape → xScaler `remote_write`

---

## Prerequisites

- Jira 8+ (self-managed) or Jira Cloud
- API token with project read access
- xScaler tenant credentials (token + tenant ID)

---

## Option A: Prometheus Exporter

```bash
docker run -d \
  -p 9889:9889 \
  -e JIRA_URL=https://jira.example.com \
  -e JIRA_TOKEN=your_api_token \
  -e JIRA_PROJECTS=MYPROJ,ANOTHER \
  opstree/jira-exporter
```

Add to `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: jira
    static_configs:
      - targets: ['localhost:9889']

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
prometheus.scrape "jira" {
  targets    = [{"__address__" = "localhost:9889"}]
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
        - job_name: jira
          static_configs:
            - targets: ['localhost:9889']
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

Collect Jira application log. Add the following to your Alloy config:

```river
local.file_match "jira_logs" {
  path_targets = [{
    __address__ = "localhost",
    __path__    = "/opt/atlassian/jira/logs/atlassian-jira.log",
    instance    = constants.hostname,
    job         = "integrations/jira",
  }]
}

loki.source.file "jira_logs" {
  targets    = local.file_match.jira_logs.targets
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
| `jira_issues_total` | Total issues by project and status |
| `jira_issues_open_total` | Open issues per project |
| `jira_issues_in_progress_total` | In-progress issues per project |
| `jira_issues_resolved_total` | Resolved issues per project |
| `jira_jvm_memory_used_bytes` | JVM heap used (self-managed) |
| `jira_database_connections_active` | Active DB connections (self-managed) |
