---
id: juniper-mist
title: Juniper MIST AI
sidebar_label: Juniper MIST AI
slug: /integrations/juniper-mist
---

# Juniper MIST AI

Monitor your Juniper MIST AI wireless network: device health, client latency, NAC events, alarms, and session flows. MIST posts webhooks to an OpenTelemetry Collector, which forwards metrics, logs, and traces to xScaler.

**Pattern:** Juniper MIST AI → Webhook (HTTP POST JSON) → OTel Collector → xScaler

---

## How signals map to MIST topics

| Signal | MIST topics | What you get |
|--------|------------|-------------|
| **Metrics** | `minis-application`, `minis-network`, `client-latency`, `device-updowns` | Latency, packet loss, DHCP/DNS/auth response times, AP up/down events as gauges |
| **Logs** | `alarms`, `audits`, `device-events`, `client-sessions`, `client-join`, `nac-events`, `nac-accounting` | Structured event log stream: security alerts, config changes, client connect/disconnect, NAC auth results |
| **Traces** | `client-join` + `client-sessions` + `nac-events` | Client session lifecycle modelled as spans: join → authenticate → roam → disconnect |

:::info Marvis subscription required
The `minis-application`, `minis-network`, and `client-latency` topics require an active **Marvis AI** subscription.
:::

---

## Prerequisites

- Juniper MIST AI account with Org Administrator access
- A publicly reachable host to run the OTel Collector (or an ingress exposing it)
- xScaler tenant credentials (token + tenant ID)

---

## Step 1: Deploy the OTel Collector

Save the following as `otel-collector-mist.yaml`. It exposes a single HTTP endpoint that receives all MIST webhook POSTs and fans the data out across three xScaler pipelines.

```yaml
receivers:
  webhookreceiver/mist:
    endpoint: 0.0.0.0:4320
    path: /mist/webhook

processors:
  memory_limiter:
    check_interval: 1s
    limit_mib: 512
  batch:
    timeout: 10s
  transform/mist_resource:
    log_statements:
      - context: log
        statements:
          - set(resource.attributes["source"], "juniper-mist")
          - set(resource.attributes["service.name"], "mist-ai")
    metric_statements:
      - context: datapoint
        statements:
          - set(resource.attributes["source"], "juniper-mist")
          - set(resource.attributes["service.name"], "mist-ai")
    trace_statements:
      - context: span
        statements:
          - set(resource.attributes["source"], "juniper-mist")
          - set(resource.attributes["service.name"], "mist-ai")

exporters:
  otlphttp/xscaler_metrics:
    endpoint: https://euw1-01.m.xscalerlabs.com
    headers:
      Authorization: "Bearer ${env:XSCALER_TOKEN}"
      X-Scope-OrgID: "${env:XSCALER_TENANT_ID}"
    compression: gzip

  otlphttp/xscaler_logs:
    endpoint: https://euw1-01.l.xscalerlabs.com
    headers:
      Authorization: "Bearer ${env:XSCALER_TOKEN}"
      X-Scope-OrgID: "${env:XSCALER_TENANT_ID}"
    compression: gzip

  otlphttp/xscaler_traces:
    endpoint: https://euw1-01.t.xscalerlabs.com
    headers:
      Authorization: "Bearer ${env:XSCALER_TOKEN}"
      X-Scope-OrgID: "${env:XSCALER_TENANT_ID}"
    compression: gzip

service:
  pipelines:
    metrics:
      receivers:  [webhookreceiver/mist]
      processors: [memory_limiter, transform/mist_resource, batch]
      exporters:  [otlphttp/xscaler_metrics]
    logs:
      receivers:  [webhookreceiver/mist]
      processors: [memory_limiter, transform/mist_resource, batch]
      exporters:  [otlphttp/xscaler_logs]
    traces:
      receivers:  [webhookreceiver/mist]
      processors: [memory_limiter, transform/mist_resource, batch]
      exporters:  [otlphttp/xscaler_traces]
  telemetry:
    logs:
      level: info
```

Run with Docker:

```bash
docker run -d \
  --name otel-mist \
  --restart unless-stopped \
  -e XSCALER_TOKEN=<token> \
  -e XSCALER_TENANT_ID=<tenant-id> \
  -p 4320:4320 \
  -v $(pwd)/otel-collector-mist.yaml:/etc/otelcol-contrib/config.yaml \
  otel/opentelemetry-collector-contrib:latest
```

Your webhook receiver is now listening at `http://<your-host>:4320/mist/webhook`.

---

## Step 2: Configure the MIST webhook

### Via the MIST portal

1. In the MIST Portal, navigate to **Organization → Settings** (org-level) or **Organization → Site Configuration → select site** (site-level).
2. Scroll down to the **Webhooks** section and click **Add Webhook**.
3. Fill in the fields:

| Field | Value |
|-------|-------|
| **Name** | `xscaler-otel` |
| **Webhook Type** | `HTTP Post` |
| **URL** | `http://<your-host>:4320/mist/webhook` |
| **Secret** | A strong random string: used to sign payloads (see [Signature verification](#signature-verification)) |
| **Verify Certificate** | Enabled (use HTTPS in production) |

4. Under **Topics**, select the topics for the signals you want:

**Metrics:**
- `minis-application`
- `minis-network`
- `client-latency`
- `device-updowns`

**Logs:**
- `alarms`
- `audits`
- `device-events`
- `client-join`
- `client-sessions`
- `nac-events`
- `nac-accounting`

**Traces:**
- `client-join`
- `client-sessions`
- `nac-events`

6. Click **Add**.

### Via the MIST API

**Org-level webhook:**

```bash
curl -X POST "https://api.mist.com/api/v1/orgs/<org-id>/webhooks" \
  -H "Authorization: Token <mist-api-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "xscaler-otel",
    "type": "http-post",
    "url": "https://<your-host>/mist/webhook",
    "secret": "<webhook-secret>",
    "verify_cert": true,
    "enabled": true,
    "topics": [
      "minis-application",
      "minis-network",
      "client-latency",
      "device-updowns",
      "alarms",
      "audits",
      "device-events",
      "client-join",
      "client-sessions",
      "nac-events",
      "nac-accounting"
    ]
  }'
```

**Site-level webhook** (replace `/orgs/<org-id>/` with `/sites/<site-id>/`):

```bash
curl -X POST "https://api.mist.com/api/v1/sites/<site-id>/webhooks" \
  -H "Authorization: Token <mist-api-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "xscaler-otel",
    "type": "http-post",
    "url": "https://<your-host>/mist/webhook",
    "secret": "<webhook-secret>",
    "enabled": true,
    "topics": ["client-latency", "device-events", "client-sessions"]
  }'
```

---

## Signature verification

MIST signs every webhook POST with two headers derived from your secret:

| Header | Algorithm |
|--------|-----------|
| `X-Mist-Signature` | `HMAC-SHA1(secret, raw_body)` |
| `X-Mist-Signature-v2` | `HMAC-SHA256(secret, raw_body)` |

Verify `X-Mist-Signature-v2` in your collector middleware or a validation proxy before the OTel Collector receives the payload:

```python
import hmac, hashlib

def verify_mist_signature(secret: str, body: bytes, header: str) -> bool:
    expected = hmac.new(
        secret.encode(), body, hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, header)
```

---

## Metrics

Topics that produce metric data points:

| Topic | Key fields | Metric name |
|-------|-----------|-------------|
| `minis-application` | `latency`, `success`, `probe_type` | `mist.app.latency_ms`, `mist.app.success_ratio` |
| `minis-network` | `dhcp_latency`, `dns_latency`, `auth_latency`, `packet_loss` | `mist.network.dhcp_latency_ms`, `mist.network.dns_latency_ms` |
| `client-latency` | `avg_latency`, `num_clients` (10-min aggregates) | `mist.client.latency_avg_ms` |
| `device-updowns` | `type` (up/down), `device_type` | `mist.device.up` (1 = up, 0 = down) |

Example payload from `minis-network`:

```json
{
  "topic": "minis-network",
  "events": [
    {
      "org_id": "abc-123",
      "site_id": "site-456",
      "type": "DHCP",
      "latency": 12.4,
      "packet_loss": 0.01,
      "timestamp": 1716300000
    }
  ]
}
```

---

## Logs

Topics that produce log events:

| Topic | Severity | What it captures |
|-------|----------|-----------------|
| `alarms` | WARN / ERROR | Marvis-detected issues, rogue APs, infrastructure downtime |
| `audits` | INFO | Configuration changes with admin identity and timestamp |
| `device-events` | INFO / WARN | AP/switch/gateway port changes, firmware upgrades, restarts |
| `client-sessions` | INFO | Roaming, disconnects, session duration, termination reason |
| `client-join` | INFO | Client associations: AP, WLAN, RSSI, band |
| `nac-events` | INFO / WARN | 802.1X auth events: success, failure, identity provider |
| `nac-accounting` | INFO | NAC session start/stop with rx/tx packet counts |

Example payload from `alarms`:

```json
{
  "topic": "alarms",
  "events": [
    {
      "org_id": "abc-123",
      "site_id": "site-456",
      "type": "rogue_ap_detected",
      "severity": "warn",
      "count": 1,
      "timestamp": 1716300000
    }
  ]
}
```

---

## Traces

Model the client wireless session lifecycle as a distributed trace. Each session becomes a root span, with child spans for the individual phases:

```
client-session (root span)
  ├─ nac-auth       (802.1X authentication)
  ├─ dhcp           (IP address assignment)
  └─ connected      (active session duration)
```

Use the `spanmetricsconnector` in the OTel Collector to derive RED metrics (rate, error rate, duration) from the session spans automatically:

```yaml
connectors:
  spanmetrics:
    namespace: mist.session
    dimensions:
      - name: site_id
      - name: wlan_id
      - name: ap_mac

service:
  pipelines:
    traces:
      receivers:  [webhookreceiver/mist]
      processors: [memory_limiter, transform/mist_resource, batch]
      exporters:  [otlphttp/xscaler_traces, spanmetrics]
    metrics/spanmetrics:
      receivers:  [spanmetrics]
      exporters:  [otlphttp/xscaler_metrics]
```

---

## Troubleshooting

**Webhook not received**
- Confirm the OTel Collector is reachable from the MIST cloud at `http://<your-host>:4320/mist/webhook`.
- Use the MIST portal **Test Webhook** button. It sends a `ping` topic POST and should return `200`.
- Check collector logs: `docker logs otel-mist`.

**Signature mismatch**
- The `X-Mist-Signature-v2` header is `HMAC-SHA256(secret, raw_body)`. Ensure the secret in your verification matches the one configured in the MIST webhook.

**No data in xScaler**
- Verify `XSCALER_TOKEN` and `XSCALER_TENANT_ID` environment variables are set on the collector container.
- Check the collector exporter logs for `failed to export` lines with HTTP status codes.
- Confirm the topics you selected in MIST match the events you expect.

**`minis-application` / `minis-network` topics missing**
- These topics require a Marvis AI subscription. Confirm it is active under **Organization → Subscription**.
