---
id: rules-and-alerts
title: Rules & Alerts
sidebar_label: Rules & Alerts
slug: /rules-and-alerts
---

# Rules & Alerts

xScaler supports Prometheus-compatible **recording rules** and **alerting rules** managed via its rules API. Rules are organised into **namespaces** and **groups** — namespaces act as top-level folders, and each group contains one or more rules with a shared evaluation interval.

:::warning Required headers
All rules API requests require:
```
Authorization: Bearer <token>
X-Scope-OrgID: <tenant-id>
```
:::

---

## Create or update a rule group

Use `POST` to create a rule group or replace an existing one.

```bash
curl -X POST \
  "https://euw1-01.m.xscalerlabs.com/api/v1/rules/my-namespace/my-group" \
  -H "Authorization: Bearer <token>" \
  -H "X-Scope-OrgID: <tenant-id>" \
  -H "Content-Type: application/yaml" \
  --data-binary '
name: my-group
interval: 1m
rules:
  - alert: HighErrorRate
    expr: |
      sum(rate(http_requests_total{status=~"5.."}[5m]))
      / sum(rate(http_requests_total[5m])) > 0.05
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "High error rate detected"
      description: "Error rate is {{ $value | humanizePercentage }}"

  - record: job:http_requests:rate5m
    expr: sum(rate(http_requests_total[5m])) by (job)
'
```

### Rule group fields

| Field | Description |
|-------|-------------|
| `name` | Must match the `<group>` segment of the URL path |
| `interval` | Evaluation interval. Default is `1m`. |
| `rules[].alert` | Alert name (for alerting rules) |
| `rules[].record` | Recording metric name (for recording rules) |
| `rules[].expr` | PromQL expression |
| `rules[].for` | Duration the expression must be true before the alert fires |
| `rules[].labels` | Labels attached to the alert |
| `rules[].annotations` | Annotations included in alert notifications |

---

## List all rule groups

```bash
curl "https://euw1-01.m.xscalerlabs.com/prometheus/api/v1/rules" \
  -H "Authorization: Bearer <token>" \
  -H "X-Scope-OrgID: <tenant-id>"
```

Returns all rule groups across all namespaces for your tenant.

---

## Get a specific rule group

```bash
curl "https://euw1-01.m.xscalerlabs.com/api/v1/rules/my-namespace/my-group" \
  -H "Authorization: Bearer <token>" \
  -H "X-Scope-OrgID: <tenant-id>"
```

---

## Delete a rule group

```bash
curl -X DELETE \
  "https://euw1-01.m.xscalerlabs.com/api/v1/rules/my-namespace/my-group" \
  -H "Authorization: Bearer <token>" \
  -H "X-Scope-OrgID: <tenant-id>"
```

---

## View active alerts

```bash
curl "https://euw1-01.m.xscalerlabs.com/prometheus/api/v1/alerts" \
  -H "Authorization: Bearer <token>" \
  -H "X-Scope-OrgID: <tenant-id>"
```

Returns all currently firing or pending alerts for your tenant.

---

## Namespace and group naming

- **Namespace** — a logical grouping of related rule groups (e.g. `production`, `staging`, `slos`). Use any URL-safe string.
- **Group** — a collection of rules that share an evaluation interval. Rules within a group are evaluated sequentially, so earlier recording rules can be referenced in later expressions within the same group.

```
/api/v1/rules/<namespace>/<group>
```

Example: `/api/v1/rules/production/slo-rules`
