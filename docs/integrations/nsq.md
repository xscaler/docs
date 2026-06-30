---
id: nsq
title: NSQ
sidebar_label: NSQ
slug: /integrations/nsq
---

# NSQ

Monitor NSQ message queue — topic message counts, channel depth, in-flight messages, and node health — using nsq_exporter.

**Pattern:** nsq_exporter → Prometheus scrape → xScaler `remote_write`

---

## Prerequisites

- NSQ 1.x+
- xScaler tenant credentials (token + tenant ID)

---

## Option A — Prometheus Exporter

```bash
docker run -d \
  -p 9117:9117 \
  -e NSQ_LOOKUPD_ADDR=localhost:4161 \
  lovoo/nsq_exporter
```

Add to `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: nsq
    static_configs:
      - targets: ['localhost:9117']

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
prometheus.scrape "nsq" {
  targets    = [{"__address__" = "localhost:9117"}]
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
        - job_name: nsq
          static_configs:
            - targets: ['localhost:9117']

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

Collect nsqd and nsqlookupd log output via systemd journal. Add the following to your Alloy config:

```river
loki.source.journal "nsq_journal" {
  forward_to    = [loki.write.xscaler.receiver]
  relabel_rules = loki.relabel.nsq_journal.rules
  labels = {
    job      = "integrations/nsq",
    instance = constants.hostname,
  }
}

loki.relabel "nsq_journal" {
  forward_to = []
  rule {
    source_labels = ["__journal__systemd_unit"]
    target_label  = "unit"
  }
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
| `nsq_topic_message_count` | Total messages published to a topic |
| `nsq_channel_depth` | Messages waiting in a channel queue |
| `nsq_channel_in_flight_count` | Messages currently in-flight |
| `nsq_topic_backend_depth` | Messages spooled to disk |
| `nsq_channel_deferred_count` | Messages deferred for redelivery |
| `nsq_node_count` | Number of nsqd nodes |
