---
id: redis
title: Redis
sidebar_label: Redis
slug: /integrations/redis
---

# Redis

Collect command throughput, memory usage, keyspace hit ratio, connected clients, and replication metrics from Redis using `redis_exporter`.

**Pattern:** redis_exporter → Prometheus scrape → xScaler `remote_write`

---

## Prerequisites

- Redis 4.0 or later
- Prometheus or Grafana Alloy
- xScaler tenant credentials

---

## Step 1 — Run redis_exporter

No Redis configuration changes needed — the exporter calls `INFO` and `CONFIG GET` commands.

```bash
docker run --rm -d \
  --name redis-exporter \
  -p 9121:9121 \
  oliver006/redis_exporter \
  --redis.addr redis://localhost:6379
```

If Redis requires authentication:

```bash
docker run --rm -d \
  --name redis-exporter \
  -p 9121:9121 \
  -e REDIS_PASSWORD=yourpassword \
  oliver006/redis_exporter \
  --redis.addr redis://localhost:6379
```

Verify:

```bash
curl -s http://localhost:9121/metrics | grep redis_up
# redis_up 1
```

---

## Step 2 — Scrape and forward to xScaler

### Prometheus

```yaml
scrape_configs:
  - job_name: redis
    static_configs:
      - targets: ['localhost:9121']
        labels:
          instance: cache-primary

remote_write:
  - url: https://euw1-01.m.xscalerlabs.com/api/v1/push
    authorization:
      credentials: <token>
    headers:
      X-Scope-OrgID: <tenant-id>
```

### Grafana Alloy

```river
prometheus.scrape "redis" {
  targets    = [{"__address__" = "localhost:9121"}]
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

## Key metrics

| Metric | Description |
|--------|-------------|
| `redis_up` | Exporter reachability (1 = up) |
| `redis_connected_clients` | Connected client count |
| `redis_blocked_clients` | Clients blocked on `BLPOP`/`BRPOP` |
| `redis_memory_used_bytes` | Used memory |
| `redis_memory_max_bytes` | `maxmemory` configuration value |
| `redis_keyspace_hits_total` | Cache hits |
| `redis_keyspace_misses_total` | Cache misses |
| `redis_commands_processed_total` | Total commands executed |
| `redis_rejected_connections_total` | Connections rejected (at `maxclients`) |
| `redis_replication_backlog_bytes` | Replication backlog size |
| `redis_connected_slaves` | Number of connected replicas |

---

## Useful PromQL queries

```promql
# Cache hit ratio % (should be > 95%)
rate(redis_keyspace_hits_total[5m])
/ (rate(redis_keyspace_hits_total[5m]) + rate(redis_keyspace_misses_total[5m]))
* 100

# Memory usage % of maxmemory
redis_memory_used_bytes / redis_memory_max_bytes * 100

# Commands per second
rate(redis_commands_processed_total[5m])

# Connected clients
redis_connected_clients

# Evicted keys rate (memory pressure indicator)
rate(redis_evicted_keys_total[5m])
```

---

## Troubleshooting

**`redis_up 0`**
- Check `--redis.addr` is correct
- If Redis requires auth, ensure `REDIS_PASSWORD` is set

**Missing `redis_memory_max_bytes`**
- If `maxmemory` is `0` (unlimited), this metric is `0`. Set a `maxmemory` value in your Redis config to track usage meaningfully.
