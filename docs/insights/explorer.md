---
id: explorer
title: Explorer
sidebar_label: Explorer
slug: /insights/explorer
---

# Explorer

Explorer runs several queries at once, each with its own signal. A logs query
can sit beside the metric that raised the question, and comparing two
expressions no longer costs you the first one.

Open **Insights → Explorer**.

## Choose whose data, then which signal

Two controls, in that order:

1. **Tenant.** Which tenant's telemetry you are querying.
2. **Signal.** Metrics, Logs or Traces.

Picking "Payments" and then "Traces" beats hunting for a data source row called
"Traces - Payments".

## Add query rows

Each row is a query with its own editor and its own data source. Per row you
can:

| Action | Use |
|--------|-----|
| Rename `refId` | Give the row a name you can refer to |
| Duplicate | Copy a working expression and edit the copy |
| Hide | Keep a row without running it |
| Collapse | Get a long expression out of the way |
| Drag | Reorder rows |
| Remove | Delete the row |

Hide rather than delete while you are narrowing something down. A hidden row
keeps its expression and stays out of the results.

## Run and share

**Run** executes every visible row. The whole query state is in the URL, so a
link reproduces the rows, the time range and the results.

## Where to go next

Explorer is for the question you have not shaped yet. Once you know what you are
looking at:

- [Add to dashboard](/insights/dashboards) to keep the panel.
- [Create alert](/insights/alerting) to be told next time. Metric and log
  queries only.
- [Snapshot](/insights/snapshots) to hand the current screen to whoever is on
  the call.

For guided narrowing by label instead of a query you write,
[Metrics](/insights/metrics), [Logs](/insights/logs) and
[Traces](/insights/traces) each have their own page.
