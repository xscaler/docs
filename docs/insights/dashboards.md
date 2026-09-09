---
id: dashboards
title: Dashboards
sidebar_label: Dashboards
slug: /insights/dashboards
---

# Dashboards

Build panels in the portal, or import the Grafana JSON you already have.

Open **Insights → Dashboards**.

## Import a Grafana dashboard

**Dashboards → Import** takes a Grafana dashboard JSON model as-is. Paste it or
upload the file, map its data source inputs to your tenant, pick a folder,
save.

This is the fastest way to check Insights against something you already trust:
import a dashboard you use every day and compare it panel for panel.

## Build a panel

The panel editor has three parts.

**Queries.** One or more rows, each with its own data source, so a panel can
draw a metric and a log-derived count together. Rows support rename, duplicate,
hide and drag-reorder.

**Server-side expressions** run on the query results rather than in the data
source: Math for free-form formulas, Reduce to collapse a series to one number,
Resample to put series on a common interval.

**Transformations** reshape the result before it is drawn: join, filter, rename,
organise fields, and the rest of the standard set. Reach for these before you
complicate the query.

**Visualisation.** Time series, stat, table, logs, traces, bar chart, pie
chart, histogram, heatmap, and the node graph used by the service graph. The
options pane carries the standard field config: units, decimals, thresholds,
axis and legend settings, and per-field overrides.

## Variables

**Dashboard settings → Variables** defines the values the whole dashboard reads
from. Query variables pull their options from your data, so an `env` or
`service` variable stays current without editing.

Ad-hoc filters are a variable too. They add label matchers to every query on the
dashboard, which turns one dashboard into per-service views without duplicating
it.

## Annotations

**Dashboard settings → Annotations** overlays events on time-based panels. Use
it for deploys and incidents, so a step change in a graph carries its
explanation.

## Exemplars

A metric panel can plot exemplars alongside the series. Each exemplar is a link
from an aggregate to one request that made it up. Click one and the popover
takes you to that trace, which is the shortest route from "p99 moved" to "here
is a slow request".

Exemplars only appear where your instrumentation records them.

## Keep the history

Every save makes a version. **Dashboard settings → Versions** lists them and
restores any one. If two people save the same dashboard at once, the second save
reports the conflict rather than overwriting.

Deleted dashboards go to **Recently deleted**, where they can be restored or
purged.

## Organise

Folders, plus a star per dashboard for your own list. Move a dashboard between
folders from the manage view.

## The JSON model

**Dashboard settings → JSON model** shows the full document and lets you edit it
directly. Use it to copy a dashboard between tenants, or to fix something the UI
does not expose yet.

## Next

- [Snapshots](/insights/snapshots) to share a frozen copy.
- [Alerting](/insights/alerting) to be told when a panel would look wrong.
- [Managed Grafana](/platform/managed-grafana) if you want a Grafana of your
  own with these datasources already wired up.
