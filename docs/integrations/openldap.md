---
id: openldap
title: OpenLDAP
sidebar_label: OpenLDAP
slug: /integrations/openldap
---

# OpenLDAP

Monitor OpenLDAP using openldap_exporter: operation rates, connection counts, thread usage, and replication status.

**Pattern:** openldap_exporter → Prometheus scrape → xScaler `remote_write`

---

## Prerequisites

- OpenLDAP 2.4+
- Bind credentials with access to `cn=Monitor`
- xScaler tenant credentials (token + tenant ID)

---

## Option A: Prometheus Exporter

```bash
docker run -d \
  -p 9330:9330 \
  -e LDAP_ADDR=ldap://localhost:389 \
  -e LDAP_USER=cn=admin,dc=example,dc=com \
  -e LDAP_PASS=secret \
  tomcz/openldap_exporter
```

Add to `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: openldap
    static_configs:
      - targets: ['localhost:9330']

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
prometheus.scrape "openldap" {
  targets    = [{"__address__" = "localhost:9330"}]
  forward_to = [prometheus.remote_write.xscaler.receiver]
  scrape_interval = "30s"
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
        - job_name: openldap
          static_configs:
            - targets: ['localhost:9330']
          scrape_interval: 30s

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

Collect OpenLDAP slapd log. Add the following to your Alloy config:

```river
local.file_match "openldap_logs" {
  path_targets = [{
    __address__ = "localhost",
    __path__    = "/var/log/slapd.log",
    instance    = constants.hostname,
    job         = "integrations/openldap",
  }]
}

loki.source.file "openldap_logs" {
  targets    = local.file_match.openldap_logs.targets
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
| `openldap_monitored_object` | Monitored object count |
| `openldap_operations_initiated_total` | Operations initiated |
| `openldap_operations_completed_total` | Operations completed |
| `openldap_connections_current` | Current active connections |
| `openldap_connections_total` | Total connections since start |
| `openldap_waiters_write` | Threads waiting for write lock |
| `openldap_statistics_bytes` | Total bytes sent |
