---
id: prometheus-remote-write
title: Prometheus remote_write
sidebar_label: Prometheus remote_write
slug: /ingest/prometheus-remote-write
---

# Prometheus remote_write

Send metrics from a self-hosted Prometheus instance to xScaler using the `remote_write` protocol.

:::warning Required headers
Both of the following must be present on every request:
- `Authorization: Bearer <token>` — via the `authorization.credentials` field
- `X-Scope-OrgID: <tenant-id>` — via the `headers` block
:::

---

## Configuration

Add the following block to your `prometheus.yml`:

```yaml
remote_write:
  - url: https://euw1-01.m.xscalerlabs.com/api/v1/push
    authorization:
      credentials: <token>
    headers:
      X-Scope-OrgID: <tenant-id>
    remote_timeout: 30s
    queue_config:
      capacity: 10000
      max_samples_per_send: 2000
      batch_send_deadline: 5s
      min_shards: 1
      max_shards: 10
      min_backoff: 30ms
      max_backoff: 5s
    metadata_config:
      send: true
      send_interval: 1m
    tls_config:
      insecure_skip_verify: false
```

### Field reference

| Field | Description |
|-------|-------------|
| `url` | The xScaler ingest endpoint. Must end in `/api/v1/push`. |
| `authorization.credentials` | Your API token. Prometheus sends this as `Authorization: Bearer <token>`. |
| `headers.X-Scope-OrgID` | **Required.** The tenant isolation header. Without this, the backend returns `400 no org id`. |
| `remote_timeout` | How long Prometheus waits for the backend to acknowledge a batch before retrying. `30s` is a safe default. |
| `queue_config.capacity` | In-memory queue size (number of samples). Increase if you see dropped samples under high load. |
| `queue_config.max_samples_per_send` | Maximum samples per HTTP request. The xScaler limit is `2000`. |
| `queue_config.batch_send_deadline` | Force-flush the batch after this duration even if not full. Keeps latency low. |
| `queue_config.min_shards` / `max_shards` | Number of parallel HTTP connections. Scale up shards to increase throughput. |
| `queue_config.min_backoff` / `max_backoff` | Exponential backoff bounds on retries. |
| `metadata_config.send` | Send metric metadata (type, help text) to the backend. Recommended: `true`. |
| `tls_config.insecure_skip_verify` | Must be `false`. xScaler uses valid TLS certificates. |

---

## Drop noisy metrics before sending

Use `write_relabel_configs` to filter out high-cardinality or irrelevant metrics before they leave Prometheus:

```yaml
remote_write:
  - url: https://euw1-01.m.xscalerlabs.com/api/v1/push
    authorization:
      credentials: <token>
    headers:
      X-Scope-OrgID: <tenant-id>
    write_relabel_configs:
      - source_labels: [__name__]
        regex: "go_memstats_.*"
        action: drop
```

This example drops all Go runtime memory stats before they reach the network.

---

## Troubleshooting metrics

Monitor these Prometheus internal metrics to diagnose remote_write issues:

| Metric | What it indicates |
|--------|------------------|
| `prometheus_remote_storage_failed_samples_total` | Samples that could not be sent. Check logs for the HTTP error code. |
| `prometheus_remote_storage_pending_samples` | Samples queued but not yet sent. High values indicate the backend is slow or the queue is backing up. |
| `prometheus_remote_storage_shards` | Current number of active shards. If pegged at `max_shards`, you may need to increase the limit. |

### Common issues

**400 Bad Request — "no org id"**
The `headers.X-Scope-OrgID` field is missing or misspelled. Verify the exact key name in your config.

**Metrics not appearing**
1. Check `prometheus_remote_storage_failed_samples_total` — if it is rising, note the HTTP status code in Prometheus logs (`--log.level=debug`).
2. Confirm the URL ends in `/api/v1/push` — not `/api/v1/write` or `/push`.
3. Confirm both `authorization.credentials` and `headers.X-Scope-OrgID` are set.
