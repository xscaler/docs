---
id: apache
title: Apache HTTP Server
sidebar_label: Apache HTTP Server
slug: /integrations/apache
---

# Apache HTTP Server

Collect request rate, worker utilisation, scoreboard state, and traffic metrics from Apache HTTP Server using `apache_exporter`.

**Pattern:** apache_exporter → Prometheus scrape → xScaler `remote_write`

---

## Prerequisites

- Apache HTTP Server 2.4 or later with `mod_status` enabled
- Prometheus or Grafana Alloy
- xScaler tenant credentials

---

## Step 1 — Enable mod_status

Add or verify the following in your Apache config (e.g. `/etc/apache2/conf-available/status.conf`):

```apache
<Location "/server-status">
  SetHandler server-status
  Require local
</Location>

ExtendedStatus On
```

Enable the config and reload:

```bash
# Debian/Ubuntu
a2enmod status
a2enconf status
systemctl reload apache2

# RHEL/CentOS
systemctl reload httpd
```

Verify:

```bash
curl http://localhost/server-status?auto
# Total Accesses: 1234
# Total kBytes: 5678
# ...
```

---

## Step 2 — Run apache_exporter

```bash
docker run --rm -d \
  --name apache-exporter \
  --network host \
  -p 9117:9117 \
  lusotycoon/apache-exporter \
  --scrape_uri=http://localhost/server-status?auto
```

Verify:

```bash
curl -s http://localhost:9117/metrics | grep apache_up
# apache_up 1
```

---

## Step 3 — Scrape and forward to xScaler

### Prometheus

```yaml
scrape_configs:
  - job_name: apache
    static_configs:
      - targets: ['localhost:9117']
        labels:
          instance: web-01

remote_write:
  - url: https://euw1-01.m.xscalerlabs.com/api/v1/push
    authorization:
      credentials: <token>
    headers:
      X-Scope-OrgID: <tenant-id>
```

### Grafana Alloy

```river
prometheus.scrape "apache" {
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

## Key metrics

| Metric | Description |
|--------|-------------|
| `apache_up` | Exporter reachability (1 = up) |
| `apache_accesses_total` | Total number of HTTP accesses |
| `apache_sent_kilobytes_total` | Total kBytes sent |
| `apache_workers` | Worker count by state (`busy`, `idle`) |
| `apache_scoreboard` | Scoreboard slot counts by state |
| `apache_cpuload` | CPU load of the Apache process |
| `apache_uptime_seconds_total` | Server uptime |

---

## Useful PromQL queries

```promql
# Request rate/sec
rate(apache_accesses_total[5m])

# Busy vs idle workers
apache_workers{state="busy"}
apache_workers{state="idle"}

# Worker utilisation % (busy / total)
apache_workers{state="busy"}
/ (apache_workers{state="busy"} + apache_workers{state="idle"}) * 100

# Throughput (KB/s)
rate(apache_sent_kilobytes_total[5m])

# CPU load
apache_cpuload
```

---

## Troubleshooting

**`apache_up 0`**
- Check `mod_status` is enabled: `apachectl -M | grep status`
- Confirm the `server-status` location is accessible: `curl http://localhost/server-status?auto`
- Ensure `Require local` allows connections from the exporter's IP

**All workers appear busy**
- Check `apache_scoreboard` for workers in `closing` or `logging` state — may indicate slow clients
- Review `MaxRequestWorkers` / `ServerLimit` in your Apache config
