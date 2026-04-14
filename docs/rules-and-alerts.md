---
id: rules-and-alerts
title: Alerts
sidebar_label: Alerts
slug: /rules-and-alerts
---

# Alerts

xScaler does not expose a Ruler API. Alerting is handled directly in **Grafana** using its built-in alerting engine, which queries your xScaler data source.

This approach keeps alert configuration in one place — your Grafana instance — without needing to manage rule files or a separate alerting backend.

---

## Set up Grafana Alerts against xScaler

### 1. Add xScaler as a Prometheus data source

In Grafana, go to **Connections → Data sources → Add data source → Prometheus**.

| Field | Value |
|-------|-------|
| URL | `https://euw1-01.m.xscalerlabs.com/prometheus` |
| Authorization header | `Bearer <token>` |
| Custom header `X-Scope-OrgID` | `<tenant-id>` |

**HTTP headers config:**

```
Authorization: Bearer <token>
X-Scope-OrgID: <tenant-id>
```

Save & test — you should see "Data source is working".

---

### 2. Create an alert rule

1. Go to **Alerting → Alert rules → New alert rule**
2. Set **Data source** to your xScaler data source
3. Write a PromQL expression in the query editor:

```promql
sum(rate(http_requests_total{status=~"5.."}[5m]))
/ sum(rate(http_requests_total[5m])) > 0.05
```

4. Set the **threshold** and **evaluation interval** (e.g. every 1m, for 5m)
5. Add **labels** (e.g. `severity: critical`) and **annotations** (summary, description)
6. Assign the rule to a **folder** and **evaluation group**

---

### 3. Configure notifications

1. Go to **Alerting → Contact points** and add a contact point (Slack, PagerDuty, email, etc.)
2. Go to **Alerting → Notification policies** and route alerts by label to the right contact point

---

## Common alert expressions

```promql
# High HTTP error rate (> 5%)
sum(rate(http_requests_total{status=~"5.."}[5m]))
/ sum(rate(http_requests_total[5m])) > 0.05

# High CPU usage (> 90%)
100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 90

# Low disk space (< 10% free)
node_filesystem_avail_bytes{mountpoint="/"} 
/ node_filesystem_size_bytes{mountpoint="/"} * 100 < 10

# Pod not ready
kube_pod_status_ready{condition="true"} == 0

# Redis memory near limit (> 90%)
redis_memory_used_bytes / redis_memory_max_bytes * 100 > 90

# PostgreSQL too many connections (> 90% of max)
sum(pg_stat_database_numbackends)
/ scalar(pg_settings_max_connections) * 100 > 90
```

---

## Grafana Alerting docs

For full documentation on alert rules, silences, mute timings, and notification templates, see the [Grafana Alerting documentation](https://grafana.com/docs/grafana/latest/alerting/).
