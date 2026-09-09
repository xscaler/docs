---
id: insights
title: Insights
sidebar_label: Overview
slug: /insights
---

# Insights

Insights is where you read your telemetry back. It ships with the tenant, so
there is nothing to connect: the tenant you are looking at is the data source.

Open **Insights** in the [xScaler portal](https://portal.xscalerlabs.com).

## The pages

| Page | What you do there |
|------|-------------------|
| [Metrics](/insights/metrics) | Search for a metric, break it down by label, read the result |
| [Logs](/insights/logs) | Filter a stream by label, read lines, open the trace a line belongs to |
| [Traces](/insights/traces) | Span waterfall, critical path, service graph, exceptions |
| [Explorer](/insights/explorer) | Several queries at once, each with its own signal |
| [Dashboards](/insights/dashboards) | Build panels, import Grafana JSON, keep version history |
| [Snapshots](/insights/snapshots) | Freeze what is on screen and share the link |
| [Alerting](/insights/alerting) | Rules, contact points, notification policies, silences |

## Moving between signals

Every result view carries the same two actions.

**Add to dashboard** takes the query you are looking at, metrics, logs or
traces, and writes it into a dashboard panel. Pick an existing dashboard or
create one from the modal.

**Create alert** opens the rule editor with the query already filled in. It
appears on metric and log queries. The alert model covers Prometheus and Loki
queries, so trace queries do not offer it.

A log line carrying a `trace_id` links straight to that trace. A span links back
to the logs recorded while it ran.

## Saved queries

Any query can be saved and starred. Starred queries stay until you delete them.
Unstarred ones can be cleared in bulk once the list gets long.

## Your own Grafana still works

The Prometheus-, Loki- and Tempo-compatible query APIs stay open. Existing
dashboards keep reading, and new ones can be built anywhere that speaks those
APIs. See [Connect Grafana datasources](/grafana-datasources), or let xScaler
run the Grafana for you with [Managed Grafana](/platform/managed-grafana).
