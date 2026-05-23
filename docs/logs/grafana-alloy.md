---
id: grafana-alloy
title: Grafana Alloy
sidebar_label: Grafana Alloy
slug: /logs/grafana-alloy
---

# Grafana Alloy

Send logs to xScaler using [Grafana Alloy](https://grafana.com/docs/alloy/) — tail files, collect from Docker containers, or receive OTLP log data and forward everything over the native push protocol.

:::warning Required headers
Both headers are mandatory on every request:
- `Authorization: Bearer <token>` — set via the `http_client_config.authorization` block
- `X-Scope-OrgID: <tenant-id>` — set via the `headers` map
:::

---

## Configuration

### Tail log files

Save the following as `config.alloy`:

```river
loki.source.file "app" {
  targets = [
    {__path__ = "/var/log/app/*.log", job = "app"},
    {__path__ = "/var/log/nginx/access.log", job = "nginx"},
  ]
  forward_to = [loki.write.xscaler.receiver]
}

loki.write "xscaler" {
  endpoint {
    url = "https://euw1-01.l.xscalerlabs.com/api/v1/logs/push"

    http_client_config {
      authorization {
        type        = "Bearer"
        credentials = "<token>"
      }
    }

    headers = {
      "X-Scope-OrgID" = "<tenant-id>",
    }
  }
}
```

### Collect Docker container logs

```river
loki.source.docker "containers" {
  host    = "unix:///var/run/docker.sock"
  targets = discovery.docker.all.targets
  forward_to = [loki.write.xscaler.receiver]
}

discovery.docker "all" {
  host = "unix:///var/run/docker.sock"
}

loki.write "xscaler" {
  endpoint {
    url = "https://euw1-01.l.xscalerlabs.com/api/v1/logs/push"

    http_client_config {
      authorization {
        type        = "Bearer"
        credentials = "<token>"
      }
    }

    headers = {
      "X-Scope-OrgID" = "<tenant-id>",
    }
  }
}
```

### Receive OTLP logs and forward

```river
otelcol.receiver.otlp "default" {
  grpc { endpoint = "0.0.0.0:4317" }
  http { endpoint = "0.0.0.0:4318" }
  output {
    logs = [otelcol.exporter.otlphttp.xscaler.input]
  }
}

otelcol.exporter.otlphttp "xscaler" {
  client {
    endpoint = "https://euw1-01.l.xscalerlabs.com"
    headers = {
      "Authorization" = "Bearer <token>",
      "X-Scope-OrgID" = "<tenant-id>",
    }
    tls { insecure = false }
  }
}
```

---

## Load credentials from environment variables

```river
loki.write "xscaler" {
  endpoint {
    url = "https://euw1-01.l.xscalerlabs.com/api/v1/logs/push"

    http_client_config {
      authorization {
        type        = "Bearer"
        credentials = env("XSCALER_TOKEN")
      }
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
  -v /var/log:/var/log:ro \
  grafana/alloy:latest \
    run /etc/alloy/config.alloy
```

---

## Troubleshooting

**Logs not arriving**
1. Open the **Alloy UI** at `http://localhost:12345` — red components indicate errors.
2. Verify the `url` ends in `/api/v1/logs/push`.
3. Check `http_client_config.authorization` is nested inside the `endpoint` block — not at the top level.

**400 Bad Request — "no org id"**
The `X-Scope-OrgID` key is missing from the `headers` map. Add it and restart Alloy.

**401 Unauthorized**
The `credentials` value must be the raw token — the `type = "Bearer"` prefix is added automatically.
