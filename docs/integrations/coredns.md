---
id: coredns
title: CoreDNS
sidebar_label: CoreDNS
slug: /integrations/coredns
---

# CoreDNS

Monitor CoreDNS using its built-in Prometheus plugin: DNS request rates, response codes, cache hit rates, and plugin latencies.

**Pattern:** CoreDNS prometheus plugin → Prometheus scrape → xScaler `remote_write`

---

## Prerequisites

- CoreDNS 1.6+
- xScaler tenant credentials (token + tenant ID)

---

## Enable metrics

Add the `prometheus` directive to your `Corefile`:

```
. {
  prometheus :9153
  forward . 8.8.8.8
  cache 30
  log
}
```

Verify:

```bash
curl -s http://localhost:9153/metrics | grep coredns_dns_requests_total
```

---

## Option A: Prometheus

```yaml
scrape_configs:
  - job_name: coredns
    static_configs:
      - targets: ['localhost:9153']

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
prometheus.scrape "coredns" {
  targets    = [{"__address__" = "localhost:9153"}]
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
        - job_name: coredns
          static_configs:
            - targets: ['localhost:9153']

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

Collect CoreDNS query log and error log from the container. Add the following to your Alloy config:

```river
discovery.docker "coredns_containers" {
  host = "unix:///var/run/docker.sock"
  filter {
    name   = "name"
    values = ["coredns"]
  }
}

discovery.relabel "coredns_logs" {
  targets = discovery.docker.coredns_containers.targets
  rule {
    source_labels = ["__meta_docker_container_name"]
    regex         = "/(.*)"
    target_label  = "container"
  }
  rule {
    replacement  = "integrations/coredns"
    target_label = "job"
  }
}

loki.source.docker "coredns_logs" {
  host       = "unix:///var/run/docker.sock"
  targets    = discovery.relabel.coredns_logs.output
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
| `coredns_dns_requests_total` | Total DNS requests by type and zone |
| `coredns_dns_responses_total` | Total responses by rcode |
| `coredns_cache_hits_total` | Cache hits |
| `coredns_cache_misses_total` | Cache misses |
| `coredns_dns_request_duration_seconds` | Request duration histogram |
| `coredns_forward_requests_total` | Requests forwarded upstream |
| `coredns_forward_request_duration_seconds` | Upstream forward latency |
