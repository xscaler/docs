---
id: nginx
title: NGINX
sidebar_label: NGINX
slug: /integrations/nginx
---

# NGINX

Collect request rate, active connections, upstream health, and error rate metrics from NGINX using `nginx-prometheus-exporter` (for NGINX open source) or the NGINX Plus API.

**Pattern:** nginx-prometheus-exporter → Prometheus scrape → xScaler `remote_write`

---

## Prerequisites

- NGINX with `ngx_http_stub_status_module` enabled (included in most builds)
- Prometheus or Grafana Alloy
- xScaler tenant credentials

---

## Step 1 — Enable the stub status endpoint

Add the following location block to your NGINX config (e.g. `/etc/nginx/conf.d/status.conf`):

```nginx
server {
  listen 8080;
  server_name localhost;

  location /nginx_status {
    stub_status;
    allow 127.0.0.1;
    deny all;
  }
}
```

Reload NGINX:

```bash
nginx -s reload
```

Verify:

```bash
curl http://localhost:8080/nginx_status
# Active connections: 5
# server accepts handled requests
#  12 12 20
```

---

## Step 2 — Run nginx-prometheus-exporter

```bash
docker run --rm -d \
  --name nginx-exporter \
  --network host \
  -p 9113:9113 \
  nginx/nginx-prometheus-exporter \
  --nginx.scrape-uri=http://localhost:8080/nginx_status
```

Verify:

```bash
curl -s http://localhost:9113/metrics | grep nginx_up
# nginx_up 1
```

---

## Step 3 — Scrape and forward to xScaler

### Prometheus

```yaml
scrape_configs:
  - job_name: nginx
    static_configs:
      - targets: ['localhost:9113']
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
prometheus.scrape "nginx" {
  targets    = [{"__address__" = "localhost:9113"}]
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
| `nginx_up` | Exporter reachability (1 = up) |
| `nginx_connections_active` | Currently active connections |
| `nginx_connections_accepted_total` | Total accepted connections |
| `nginx_connections_handled_total` | Total handled connections |
| `nginx_connections_reading` | Connections reading request |
| `nginx_connections_writing` | Connections writing response |
| `nginx_connections_waiting` | Keep-alive idle connections |
| `nginx_http_requests_total` | Total HTTP requests processed |

---

## Useful PromQL queries

```promql
# Request rate/sec
rate(nginx_http_requests_total[5m])

# Active connections
nginx_connections_active

# Dropped connections rate (accepted - handled)
rate(nginx_connections_accepted_total[5m])
- rate(nginx_connections_handled_total[5m])

# Idle (keep-alive) connections
nginx_connections_waiting

# Connections in flight (reading + writing)
nginx_connections_reading + nginx_connections_writing
```

---

## Troubleshooting

**`nginx_up 0`**
- Confirm NGINX is running and the stub_status endpoint is accessible: `curl http://localhost:8080/nginx_status`
- Check that `--nginx.scrape-uri` points to the correct host and port

**`stub_status` returns 404**
- Verify `ngx_http_stub_status_module` is compiled in: `nginx -V 2>&1 | grep stub_status`
- Confirm the config block is loaded and NGINX was reloaded after changes
