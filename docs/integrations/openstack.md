---
id: openstack
title: OpenStack
sidebar_label: OpenStack
slug: /integrations/openstack
---

# OpenStack

Collect metrics from OpenStack services — Nova (compute), Neutron (networking), Cinder (storage), and Keystone — using the OTel Collector. Monitor your private cloud health and resource utilisation in xScaler.

**Pattern:** OTel openstack receiver → xScaler OTLP endpoint

---

## Prerequisites

- OpenStack Stein release or later
- Application credentials with read-only access to all services
- xScaler tenant credentials (token + tenant ID)

---

## Option A — Prometheus Exporter

Run openstack-exporter with your OpenStack authentication environment variables:

```bash
docker run -d \
  -p 9180:9180 \
  -e OS_AUTH_URL=https://keystone.example.com:5000/v3 \
  -e OS_USERNAME=monitor \
  -e OS_PASSWORD=secret \
  -e OS_PROJECT_NAME=monitoring \
  -e OS_DOMAIN_NAME=Default \
  openstack-exporter/openstack-exporter
```

The exporter listens on port `9180`. Configure Prometheus to scrape and remote_write:

```yaml
scrape_configs:
  - job_name: openstack
    static_configs:
      - targets: ["localhost:9180"]
    scrape_interval: 60s

remote_write:
  - url: https://euw1-01.m.xscalerlabs.com/api/v1/push
    authorization:
      type: Bearer
      credentials: <token>
    headers:
      X-Scope-OrgID: "<tenant-id>"
```

## Option B — Grafana Alloy

```river
prometheus.scrape "openstack" {
  targets          = [{"__address__" = "localhost:9180"}]
  scrape_interval  = "60s"
  forward_to       = [prometheus.remote_write.xscaler.receiver]
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

## Option C — OpenTelemetry Collector

```yaml
receivers:
  openstack:
    endpoint: https://keystone.example.com:5000/v3
    username: monitor
    password: secret
    domain_name: Default
    project_name: monitoring
    collection_interval: 60s

processors:
  batch: {}

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
      receivers: [openstack]
      processors: [batch]
      exporters: [otlphttp/xscaler]
```

---

## Logs

Collect Nova, Neutron, Keystone, Cinder, and Glance service logs. Add the following to your Alloy config:

```river
local.file_match "openstack_logs" {
  path_targets = [{
    __address__ = "localhost",
    __path__    = "/var/log/openstack/*.log",
    instance    = constants.hostname,
    job         = "integrations/openstack",
  }]
}

loki.source.file "openstack_logs" {
  targets    = local.file_match.openstack_logs.targets
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
| `openstack_nova_instances` | Total number of Nova compute instances across the project |
| `openstack_nova_vcpus_used` | vCPUs currently allocated to running instances |
| `openstack_neutron_floatingips_total` | Total floating IP addresses allocated |
| `openstack_cinder_volumes_total` | Total number of Cinder block storage volumes |
| `openstack_keystone_users_total` | Total number of Keystone users in the domain |
