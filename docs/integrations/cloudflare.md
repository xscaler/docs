---
id: cloudflare
title: Cloudflare
sidebar_label: Cloudflare
slug: /integrations/cloudflare
---

# Cloudflare

Monitor Cloudflare zone analytics — requests, bandwidth, threats, and cache hit rates — via the Cloudflare GraphQL Analytics API and the OTel Collector. Correlate CDN performance with your application and infrastructure metrics in xScaler.

**Pattern:** OTel cloudflare receiver → xScaler OTLP endpoint

---

## Prerequisites

- Cloudflare account with an API token scoped to **Zone Analytics: Read**
- Zone ID for the domain(s) you want to monitor
- xScaler tenant credentials (token + tenant ID)

---

## Option A — Prometheus Exporter

Run the community `cloudflare_exporter` with your API token:

```bash
docker run -d \
  -p 9199:9199 \
  -e CF_API_TOKEN=<your-cloudflare-api-token> \
  -e CF_ZONES=<zone-id> \
  cloudflare/cloudflare-exporter
```

The exporter listens on port `9199`. Configure Prometheus to scrape and remote_write:

```yaml
scrape_configs:
  - job_name: cloudflare
    static_configs:
      - targets: ["localhost:9199"]
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
prometheus.scrape "cloudflare" {
  targets          = [{"__address__" = "localhost:9199"}]
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
  cloudflare:
    auth_token: <your-cloudflare-api-token>
    zone_id: <zone-id>
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
      receivers: [cloudflare]
      processors: [batch]
      exporters: [otlphttp/xscaler]
```

---

## Key metrics

| Metric | Description |
|--------|-------------|
| `cloudflare_requests_total` | Total HTTP requests handled by Cloudflare for the zone |
| `cloudflare_bandwidth_bytes_total` | Total bytes transferred (ingress + egress) through Cloudflare |
| `cloudflare_threats_total` | Number of threat requests blocked or challenged |
| `cloudflare_cache_hit_ratio` | Ratio of requests served from Cloudflare cache vs origin |
| `cloudflare_http_response_status_4xx` | Count of 4xx responses returned to clients |
| `cloudflare_http_response_status_5xx` | Count of 5xx responses returned to clients |
