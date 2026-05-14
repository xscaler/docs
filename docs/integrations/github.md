---
id: github
title: GitHub
sidebar_label: GitHub
slug: /integrations/github
---

# GitHub

Monitor GitHub repositories and Actions — workflow run status, job durations, open issues, and pull request counts — using a GitHub Prometheus exporter.

**Pattern:** github_exporter → Prometheus scrape → xScaler `remote_write`

---

## Prerequisites

- GitHub account with a Personal Access Token (repo scope)
- xScaler tenant credentials (token + tenant ID)

---

## Option A — Prometheus Exporter

```bash
docker run -d \
  -p 9171:9171 \
  -e GITHUB_TOKEN=ghp_your_token \
  -e GITHUB_REPOS=org/repo1,org/repo2 \
  infinityworks/github-exporter
```

Add to `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: github
    static_configs:
      - targets: ['localhost:9171']

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
prometheus.scrape "github" {
  targets    = [{"__address__" = "localhost:9171"}]
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

## Option C — OpenTelemetry Collector

```yaml
receivers:
  prometheus:
    config:
      scrape_configs:
        - job_name: github
          static_configs:
            - targets: ['localhost:9171']
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

## Key metrics

| Metric | Description |
|--------|-------------|
| `github_repo_open_issues_count` | Open issues per repository |
| `github_repo_forks_count` | Fork count per repository |
| `github_repo_stargazers_count` | Star count per repository |
| `github_repo_size_kb` | Repository size in KB |
| `github_workflow_run_duration_seconds` | Duration of workflow runs |
| `github_workflow_job_status` | Status of workflow jobs |
