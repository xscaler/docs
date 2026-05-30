---
id: grafana-alloy
title: Grafana Alloy
sidebar_label: Grafana Alloy
slug: /traces/grafana-alloy
---

# Grafana Alloy

Send traces to xScaler using [Grafana Alloy](https://grafana.com/docs/alloy/). Alloy can receive OTLP traces from your applications and forward them to xScaler over OTLP/HTTP.

:::warning Required headers
Both headers are mandatory on every request:
- `Authorization: Bearer <token>` — set in the `headers` map
- `X-Scope-OrgID: <tenant-id>` — set in the `headers` map
:::

---

## Configuration

### Receive OTLP and forward to xScaler

Save the following as `config.alloy`:

```river
otelcol.receiver.otlp "default" {
  grpc { endpoint = "0.0.0.0:4317" }
  http { endpoint = "0.0.0.0:4318" }
  output {
    traces = [otelcol.processor.batch.default.input]
  }
}

otelcol.processor.batch "default" {
  output {
    traces = [otelcol.exporter.otlphttp.xscaler.input]
  }
}

otelcol.exporter.otlphttp "xscaler" {
  client {
    endpoint = "https://euw1-01.t.xscalerlabs.com"
    headers = {
      "Authorization" = "Bearer <token>",
      "X-Scope-OrgID" = "<tenant-id>",
    }
    tls { insecure = false }
  }
}
```

### Load credentials from environment variables

```river
otelcol.exporter.otlphttp "xscaler" {
  client {
    endpoint = "https://euw1-01.t.xscalerlabs.com"
    headers = {
      "Authorization" = "Bearer " + env("XSCALER_TOKEN"),
      "X-Scope-OrgID" = env("XSCALER_TENANT_ID"),
    }
    tls { insecure = false }
  }
}
```

---

## Send metrics, logs, and traces together

Alloy can forward all three signals in a single config:

```river
otelcol.receiver.otlp "default" {
  grpc { endpoint = "0.0.0.0:4317" }
  http { endpoint = "0.0.0.0:4318" }
  output {
    metrics = [otelcol.processor.batch.default.input]
    logs    = [otelcol.processor.batch.default.input]
    traces  = [otelcol.processor.batch.default.input]
  }
}

otelcol.processor.batch "default" {
  output {
    metrics = [otelcol.exporter.otlphttp.xscaler_metrics.input]
    logs    = [otelcol.exporter.otlphttp.xscaler_logs.input]
    traces  = [otelcol.exporter.otlphttp.xscaler_traces.input]
  }
}

otelcol.exporter.otlphttp "xscaler_metrics" {
  client {
    endpoint = "https://euw1-01.m.xscalerlabs.com"
    headers = {
      "Authorization" = "Bearer " + env("XSCALER_TOKEN"),
      "X-Scope-OrgID" = env("XSCALER_TENANT_ID"),
    }
  }
}

otelcol.exporter.otlphttp "xscaler_logs" {
  client {
    endpoint = "https://euw1-01.l.xscalerlabs.com"
    headers = {
      "Authorization" = "Bearer " + env("XSCALER_TOKEN"),
      "X-Scope-OrgID" = env("XSCALER_TENANT_ID"),
    }
  }
}

otelcol.exporter.otlphttp "xscaler_traces" {
  client {
    endpoint = "https://euw1-01.t.xscalerlabs.com"
    headers = {
      "Authorization" = "Bearer " + env("XSCALER_TOKEN"),
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
  -p 4317:4317 -p 4318:4318 \
  grafana/alloy:latest \
    run /etc/alloy/config.alloy
```

---

## Verify in the portal

Once traces are flowing, open the **Traces** section of the [xScaler portal](https://portal.xscalerlabs.com) and click the **Overview** tab. You should see live values for **Ingest rate** and **Spans/s** within a minute of starting Alloy.

To inspect a specific tenant, click the **Tenants** tab, select the tenant, then open the **Monitoring** tab for per-tenant ingest rate charts, bytes ingested, and discard reasons.

---

## Troubleshooting

**Traces not arriving**
1. Open the **Alloy UI** at `http://localhost:12345` — red components indicate errors.
2. Verify the `endpoint` is `https://euw1-01.t.xscalerlabs.com` (no path suffix).
3. Check both `Authorization` and `X-Scope-OrgID` are in the `headers` map.

**401 Unauthorized**
The `Authorization` value must be `"Bearer <token>"` — include the `Bearer ` prefix.
