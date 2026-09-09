---
id: rules-and-alerts
title: Alerts in your own Grafana
sidebar_label: Alerts in your own Grafana
slug: /rules-and-alerts
---

# Alerts in your own Grafana

Grafana's alerting engine queries xScaler like any other Prometheus or Loki
data source, so rules you already have keep working. This page covers that
route.

:::tip[Start with Insights]
[Insights → Alerting](/insights/alerting) already has alert rules, contact
points, notification policies, silences, mute timings, inhibition rules and
templates, with nothing to install. Use your own Grafana when you have alerting
there already and want it in one place.
:::

## Set up Grafana alerts against xScaler

### 1. Add xScaler as a Prometheus data source

In Grafana, go to **Connections → Data sources → Add data source → Prometheus**.

| Field | Value |
|-------|-------|
| URL | `https://euw1-01.m.xscalerlabs.com` |
| Authorization header | `Bearer <token>` |
| Custom header `X-Scope-OrgID` | `<tenant-id>` |

**HTTP headers config:**

```
Authorization: Bearer <token>
X-Scope-OrgID: <tenant-id>
```

Save & test. You should see "Data source is working".

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

## Where the rules run

Rules created in your own Grafana are evaluated by that Grafana. It has to be
running for them to fire, and it needs network access to the xScaler query
endpoints.

xScaler's own ingest endpoints do not host a Ruler, so a rules file posted to
`https://euw1-01.m.xscalerlabs.com/prometheus/config/v1/rules` answers
`Ruler is not enabled on this deployment.` Rules live either in
[Insights](/insights/alerting) or in your own Grafana or Prometheus.

## Recording rules

Recording rules run in your own Prometheus or Grafana. Write the results back
to xScaler with [remote_write](/ingest/prometheus-remote-write) and query them
like any other metric.

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

## Moving rules into Insights

Rules move over one at a time. The query is the part that carries across
unchanged, and the rest is a form:

| In Grafana | In Insights |
|------------|------------|
| The query | The same PromQL or LogQL |
| The threshold expression | The condition row: reducer, comparison, threshold |
| `for` | Pending period |
| Labels and annotations | The same fields |
| Contact points and policies | Rebuilt once, then shared by every rule |

See [Coming from Grafana Alerting](/insights/alerting/grafana) for the full
mapping, and [Alert rules](/insights/alerting/alert-rules) for the editor.

## Grafana Alerting docs

For Grafana's own alerting features, see the
[Grafana Alerting documentation](https://grafana.com/docs/grafana/latest/alerting/).
