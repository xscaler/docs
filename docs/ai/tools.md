---
id: ai-tools
title: Tools
sidebar_label: Tools
slug: /ai/tools
---

# Tools

The server exposes 25 tools, grouped below by what they do. Each tool needs the
capability in its row.

## Discovery

| Tool | What it does | Capability |
|---|---|---|
| `list_telemetry_sources` | Environments in the organization and which of metrics, logs and traces each one holds. The first call in any session: every other tool takes an environment name from here | `tenants:read` |
| `list_metrics` | Metric names an environment holds in a window, optionally narrowed by a search string | `metrics:read` |
| `describe_metric` | One metric's type, unit and labels with example values, plus PromQL that queries it correctly | `metrics:read` |
| `list_log_labels` | The labels log streams carry, or one label's values. These are what a LogQL stream selector can filter on | `logs:read` |
| `list_trace_tags` | The attributes traces carry, grouped by scope, or one attribute's values. These are what a TraceQL search can filter on | `traces:read` |

## Query

| Tool | What it does | Capability |
|---|---|---|
| `query_metrics` | Run PromQL over a window. Returns exact statistics for every series matched plus a reduced set of points | `metrics:read` |
| `query_logs` | Run LogQL over a window. Lines newest first, or oldest first to find when something began. An aggregating expression returns a series instead of lines | `logs:read` || `search_traces` | Find traces with a TraceQL selector. One row per trace: id, root service, duration, start time | `traces:read` |
| `get_trace` | One trace's spans as a tree with service, duration, offset and status. A large trace keeps every span that failed, then the slowest, then their parents | `traces:read` |

## Charts

| Tool | What it does | Capability |
|---|---|---|
| `render_chart` | Chart metrics as a Vega-Lite v5 specification with the points inline, plus exact statistics per series and a portal link to the same query | `metrics:read` |

## Correlate

| Tool | What it does | Capability |
|---|---|---|
| `correlate_span` | Which logs and metrics describe one span. It reads the environment's own trace-to-logs and trace-to-metrics configuration, then returns a LogQL selector, any configured PromQL, and the window to run them over | `traces:read` |
| `find_exemplar_traces` | The traces behind a metric, largest value first. An exemplar is a real trace the store kept while recording a sample, so a latency histogram can hand back a trace that took that long | `metrics:read` |

## Dashboards

| Tool | What it does | Capability |
|---|---|---|
| `list_dashboard_folders` | The folders your dashboards sit in | `dashboards:read` |
| `list_dashboards` | Dashboards with their folder, panel count and last change | `dashboards:read` |
| `get_dashboard` | One dashboard's folder, tags, version and every panel with the queries it asks | `dashboards:read` |
| `create_dashboard` | Create a dashboard from a list of panels. xScaler works out the layout, the schema and which store each panel queries | `dashboards:write` |
| `import_dashboard` | Import an exported JSON document. Both schemas work, classic and resource, and xScaler fills the document's datasource inputs from the environment you name | `dashboards:write` |

## Alerting

| Tool | What it does | Capability |
|---|---|---|
| `list_alert_rules` | Alert rules and what each is doing now, firing first | `alerts:read` |
| `get_alert_rule` | One rule's exact state, the queries its condition is built from, what it does on no data, and every series it is firing on | `alerts:read` |
| `list_firing_alerts` | What is firing right now and who is being told, including a branch that routes nowhere and a silence holding an alert back | `alerts:read` |
| `list_contact_points` | Where alerts can be sent: name, integration, which settings are filled in, and whether anything routes there. No setting value is ever returned | `alerts:read` |
| `get_notification_policy` | The routing tree that decides which contact point an alert reaches | `alerts:read` |
| `check_alert_rule` | Run a rule against the data as it is now and save nothing. Answers whether the condition holds, and on which series | `alerts:write` |
| `create_alert_rule` | Create a rule from a query and a threshold. xScaler builds the evaluation graph and runs the query once before it saves the rule | `alerts:write` |
| `pause_alert_rule` | Stop a rule evaluating, or start it again. It writes the paused flag and nothing else, so an edit somebody else is making survives it | `alerts:write` |

---

## Vocabulary the tools use

**Environment.** Every tool that touches data takes an environment name, which is the name of a tenant as it appears in the portal under **Administration → Tenants**. No tool accepts a datasource identifier. Where exactly one environment carries the signal in question, the name can be left out.

**Time.** Relative first: `now-15m`, `now-1h`, `now-24h`, `now-7d`. RFC3339 timestamps also work. The default window is the last hour. A time nothing can parse comes back as an error rather than a silent default, and every answer echoes the window and step it used.

**Query languages.** PromQL for metrics, LogQL for logs, TraceQL for traces.

---

[How to read a tool's answer](/ai/answers) covers what a tool returns.
