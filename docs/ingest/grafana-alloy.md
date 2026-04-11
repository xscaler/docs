---
id: grafana-alloy
title: Grafana Alloy
sidebar_label: Grafana Alloy
slug: /ingest/grafana-alloy
---

# Grafana Alloy

[Grafana Alloy](https://grafana.com/docs/alloy/) is a vendor-neutral telemetry collector that uses the **River** configuration language. It can scrape Prometheus exporters, receive OTLP data, and forward everything to xScaler over `remote_write`.

:::warning Required headers
Both headers are mandatory on every request:
- `Authorization: Bearer <token>` — set via the `authorization` block
- `X-Scope-OrgID: <tenant-id>` — set via the `headers` map
:::

---

## Configuration

Save the following as `config.alloy`:

```river
// Collect host metrics via the unix exporter
prometheus.exporter.unix "host" {}

prometheus.scrape "host_metrics" {
  targets         = prometheus.exporter.unix.host.targets
  forward_to      = [prometheus.remote_write.xscaler.receiver]
  scrape_interval = "15s"
}

prometheus.remote_write "xscaler" {
  endpoint {
    url = "https://euw1-01.m.xscalerlabs.com/api/v1/push"

    authorization {
      type        = "Bearer"
      credentials = "<token>"
    }

    headers = {
      "X-Scope-OrgID" = "<tenant-id>",
    }

    queue_config {
      capacity             = 10000
      max_samples_per_send = 2000
      batch_send_deadline  = "5s"
      min_shards           = 1
      max_shards           = 10
      min_backoff          = "30ms"
      max_backoff          = "5s"
    }
  }
}
```

### River syntax notes

- River uses `=` for assignment, not `:`.
- Blocks are delimited by `{ }`, not by indentation.
- The `authorization` block takes `type` and `credentials` as separate fields.
- `headers` is a **string map** — keys and values are both quoted strings.
- The `forward_to` reference in `prometheus.scrape` wires the scrape output directly to the `remote_write` receiver. The label `xscaler` must match the label on `prometheus.remote_write`.

---

## Load credentials from environment variables

Avoid storing secrets in the config file by reading them at runtime:

```river
prometheus.remote_write "xscaler" {
  endpoint {
    url = "https://euw1-01.m.xscalerlabs.com/api/v1/push"

    authorization {
      type        = "Bearer"
      credentials = env("XSCALER_TOKEN")
    }

    headers = {
      "X-Scope-OrgID" = env("XSCALER_TENANT_ID"),
    }
  }
}
```

---

## Run with Docker

```bash
docker run --rm \
  -e XSCALER_TOKEN=<token> \
  -e XSCALER_TENANT_ID=<tenant-id> \
  -v $(pwd)/config.alloy:/etc/alloy/config.alloy \
  grafana/alloy:latest \
    run /etc/alloy/config.alloy
```

---

## Troubleshooting

**Metrics not arriving**

1. Enable debug logging by adding `--stability.level=generally-available` to the `alloy run` command and checking stdout for errors.
2. Open the **Alloy UI** at `http://localhost:12345` — it shows the health status of every component. A red component means it has encountered an error.
3. Verify the `headers` block includes `"X-Scope-OrgID"` — this is the most common cause of `400 no org id` errors.
4. Confirm the `authorization` block uses `type = "Bearer"` and `credentials = "<token>"` (not a bare `bearer_token` field at the top level when using the block form).

**400 Bad Request — "no org id"**
The `X-Scope-OrgID` key is missing from the `headers` map. Add it and restart Alloy.

**401 Unauthorized**
Check the `credentials` value — it must be the raw token string, not `Bearer <token>` (the `type = "Bearer"` prefix is added automatically by Alloy).
