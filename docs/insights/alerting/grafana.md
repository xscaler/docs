---
id: grafana
title: Coming from Grafana Alerting
sidebar_label: Coming from Grafana
slug: /insights/alerting/grafana
---

# Coming from Grafana Alerting

xScaler alerting uses the same model as Grafana Alerting, so most of what you
know carries over. This page covers what to expect where the two differ, and
where to go for the things xScaler handles another way.

## What carries over

| Concept | Same in xScaler |
|---------|----------------|
| Alert rules in folders, with a pending period | Yes |
| One alert instance per series | Yes |
| Labels for routing, annotations for humans | Yes |
| `{{ $labels.x }}` and `{{ $value }}` in annotations | Yes |
| Contact points with multiple integrations | Yes |
| A notification policy tree with matchers and `continue` | Yes |
| Group by, group wait, group interval, repeat interval | Yes, with the same defaults |
| Silences, mute timings, inhibition rules | Yes |
| Named notification templates | Yes |

Existing Grafana dashboards and data sources keep working against xScaler, and
so does Grafana's own alerting engine if you would rather keep rules there. See
[Alerts in your own Grafana](/rules-and-alerts).

## The condition

Grafana lets you chain expression nodes: reduce, math, resample, classic
conditions, in any order.

The xScaler rule editor builds one shape, which covers the large majority of
rules:

```
query → reduce to one number → compare against a threshold
```

| Part | Options |
|------|---------|
| Reducer | `last`, `avg`, `min`, `max`, `sum`, `count` |
| Comparison | is above, is below, is equal to |

Put the arithmetic in the query instead. PromQL and LogQL already express the
ratios, rates and joins that a math node would:

```promql
sum(rate(http_requests_total{status=~"5.."}[5m]))
  / sum(rate(http_requests_total[5m]))
```

That query with `last` above `0.05` is the same rule as a query plus a math
node plus a threshold, in one place a reader can check.

## Evaluation

The same model: rules belong to an evaluation group, and the group's interval
decides how often they run. The default is every minute, over the last ten
minutes of data.

The difference is the query window. Grafana lets each query in a rule carry its
own relative time range; xScaler evaluates every rule query over the same ten
minute window. Express a longer lookback in the query itself, with a wider
range selector such as `[1h]`.

## Signals you can alert on

Metrics (PromQL) and logs (LogQL). Trace queries do not offer **Create alert**,
so the action is absent rather than leading to a rule that cannot evaluate.

To alert on trace data, alert on the metrics derived from it: request rate,
error rate and latency are all available as metrics from the
[OpenTelemetry agent](/fleet-management).

## Recording rules

xScaler does not evaluate recording rules, and the Prometheus rule endpoints on
the metrics ingest host answer `Ruler is not enabled on this deployment.`

Run recording rules in your own Prometheus or Grafana and write the results
back to xScaler with `remote_write`. See
[Prometheus remote_write](/ingest/prometheus-remote-write).

## Provisioning and automation

Grafana provisions alerting from files, Terraform and its HTTP API.

xScaler manages alerting in the portal, and automation goes through the xScaler
MCP server, which an AI assistant or a script with an MCP client can drive:

| Tool | What it does |
|------|-------------|
| `list_alert_rules` | Every rule and what it is doing now |
| `get_alert_rule` | One rule's queries, condition and firing series |
| `check_alert_rule` | Run a rule against current data without saving it |
| `create_alert_rule` | Create a rule from a query and a threshold |
| `pause_alert_rule` | Stop a rule evaluating, or resume it |
| `list_firing_alerts` | What is firing and who is being told |
| `list_contact_points` | Where alerts can be sent |
| `get_notification_policy` | The routing tree |

See [Tool reference](/ai/tools) and
[Create an alert rule](/ai/use-cases/alert-rule).

Configuration rollback covers the case file provisioning is usually reached
for. Every applied configuration is kept, and **Settings → Configuration
history** restores any of them. See [Monitor alerts](/insights/alerting/monitor).

To keep one routing configuration across xScaler and other systems, point
xScaler at your own Alertmanager under **Settings**, and manage routing there.

## Contact points

The portal offers Slack, email, PagerDuty, webhook, Opsgenie, MS Teams,
Telegram, Discord and Amazon SNS. A generic webhook covers destinations without
a dedicated type.

Two differences worth knowing before you migrate a contact point:

**Email uses your own SMTP server.** The contact point carries the host, port
and credentials, and alert email leaves from your domain. There is no platform
mail relay for alerts.

**Destinations have to be publicly reachable.** Delivery to private, loopback,
link-local and cloud metadata addresses is refused. A Grafana instance inside a
VPC can reach an internal webhook; xScaler needs a public relay in front of it.

## Secrets

Stored secrets are write-only, as in Grafana. One rule is stricter: change a
contact point's type or its destination and you have to re-enter its secrets in
the same save. See [Contact points](/insights/alerting/contact-points).

## Templates

Templates use Go template syntax and the same `.Alerts`, `.CommonLabels` and
`.GroupLabels` data, so a Grafana notification template usually moves across
unchanged. **Render preview** uses the same engine that delivers, so test a
migrated template there before you rely on it. See
[Notification templates](/insights/alerting/templates).

## Error and no-data behaviour

| Situation | xScaler |
|-----------|---------|
| Query returns nothing | The rule reads No data and notifies nobody |
| Query fails | The rule reads Error and notifies nobody. Alerts it was already firing are held rather than resolved |

Holding on an error keeps a broken query from sending an all-clear during an
incident. Alert on absence explicitly where you need to be told:

```promql
absent(up{job="checkout"})
```

## Things the portal does not show

| In Grafana | In xScaler |
|------------|-----------|
| Central alert state history | Delivery history in **Settings**, covering the last 30 days |
| Rule import from a Prometheus rules file | Rewrite the rules in the editor, or keep them in your own Grafana |
| Per-rule notification settings that bypass the tree | Route on the rule's labels |
| Mute timings inherited down the policy tree | Attach the mute timing to each policy that needs it |

## Next

- [How alerting works](/insights/alerting/how-it-works) for the model in full.
- [Alert rules](/insights/alerting/alert-rules) to write your first one here.
