---
id: postgresql
title: PostgreSQL
sidebar_label: PostgreSQL
slug: /integrations/postgresql
---

# PostgreSQL

Collect query performance, connection pool, replication lag, table bloat, and lock metrics from PostgreSQL using `postgres_exporter`.

**Pattern:** postgres_exporter → Prometheus scrape → xScaler `remote_write`

---

## Prerequisites

- PostgreSQL 11 or later
- A dedicated monitoring user with read-only access to `pg_stat_*` views
- Prometheus or Grafana Alloy
- xScaler tenant credentials

---

## Step 1 — Create a monitoring user

```sql
-- Run as superuser
CREATE USER xscaler_monitor WITH PASSWORD 'strongpassword';
GRANT pg_monitor TO xscaler_monitor;
```

---

## Step 2 — Run postgres_exporter

```bash
docker run --rm -d \
  --name postgres-exporter \
  -p 9187:9187 \
  -e DATA_SOURCE_NAME="postgresql://xscaler_monitor:strongpassword@localhost:5432/postgres?sslmode=disable" \
  prometheuscommunity/postgres-exporter
```

Verify:

```bash
curl -s http://localhost:9187/metrics | grep pg_up
# pg_up 1
```

---

## Step 3 — Scrape and forward to xScaler

### Prometheus

```yaml
scrape_configs:
  - job_name: postgresql
    static_configs:
      - targets: ['localhost:9187']
        labels:
          instance: primary

remote_write:
  - url: https://euw1-01.m.xscalerlabs.com/api/v1/push
    authorization:
      credentials: <token>
    headers:
      X-Scope-OrgID: <tenant-id>
```

### Grafana Alloy

```river
prometheus.scrape "postgresql" {
  targets    = [{"__address__" = "localhost:9187"}]
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
| `pg_up` | Exporter reachability (1 = up) |
| `pg_stat_database_numbackends` | Active connections per database |
| `pg_stat_database_xact_commit` | Committed transactions/sec |
| `pg_stat_database_xact_rollback` | Rolled-back transactions/sec |
| `pg_stat_database_blks_hit` | Buffer cache hits |
| `pg_stat_database_blks_read` | Disk reads (cache misses) |
| `pg_stat_bgwriter_checkpoint_write_time` | Checkpoint write duration (ms) |
| `pg_replication_lag` | Replication lag in bytes (primary) |
| `pg_locks_count` | Active locks by mode |
| `pg_stat_user_tables_n_dead_tup` | Dead tuples (bloat indicator) |

---

## Useful PromQL queries

```promql
# Active connections % of max
sum(pg_stat_database_numbackends)
/ scalar(pg_settings_max_connections) * 100

# Cache hit ratio (should be > 99%)
sum(rate(pg_stat_database_blks_hit[5m]))
/ (sum(rate(pg_stat_database_blks_hit[5m])) + sum(rate(pg_stat_database_blks_read[5m])))
* 100

# Transaction commit rate/sec
rate(pg_stat_database_xact_commit[5m])

# Replication lag (bytes)
pg_replication_lag

# Tables with high dead tuple count
topk(10, pg_stat_user_tables_n_dead_tup)
```

---

## Troubleshooting

**`pg_up 0`**
- Check `DATA_SOURCE_NAME` — verify host, port, user, and password
- Ensure `pg_monitor` role is granted: `\du xscaler_monitor` in psql

**High connection count**
- Check `pg_stat_database_numbackends` vs `pg_settings_max_connections`
- Consider connection pooling (PgBouncer)
