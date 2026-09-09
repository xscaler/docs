---
id: traces
title: Traces in Insights
sidebar_label: Traces
slug: /insights/traces
---

# Traces in Insights

Start from a service, narrow to the spans that describe your problem, then open
one request and read it end to end.

Open **Insights → Traces**.

## Pick what a span has to be

The primary-signal selector decides which spans the whole session looks at.

| Signal | Scope |
|--------|-------|
| Root spans | The root span of each trace |
| All spans | Raw span data. Expect long query times |
| Server spans | Server-side segments of traces |
| Consumer spans | Interactions started by consumer services |
| Database calls | Database interactions |

Root spans is the default and the right starting point for "which requests are
slow". Database calls is the shortcut for "is it the database".

## Rate, errors, duration

Three panels sit above the results: request rate, error rate and duration.
Duration is drawn as a latency heatmap, so a second mode hiding under a p95 line
is visible rather than averaged away.

Each panel doubles as a selector. Click a small one to promote it into the big
slot.

## Narrow by attribute

The attributes rail lists the span attributes present in the current selection.
Pick one and the breakdown draws a panel per value, ranked so the highest-rate
values come first. **Include** and **Exclude** narrow the whole session.

## Read one trace

Click a result to open the waterfall.

**Critical path** highlights the segments that actually determined the trace's
wall-clock duration. At each span the last-finishing child is on the path, and
the gaps before and after it are the span's own work. A span can be slow and
irrelevant. The critical path is how you tell.

**Minimap** gives you the whole trace at once when it is too long to scroll.

**Span detail** lists attributes, events and links. Span links are not tree
edges, so a linked span is reachable without being a child.

**Logs for this span** jumps to the log lines recorded while that span ran.

## Compare, group, count

Four more views over the same selection:

**Comparison** splits matching spans into a baseline and a selection, and ranks
attributes by how differently their values show up on each side. Use it after a
deploy: baseline yesterday, select now, read what changed.

**Service graph** draws the call graph between services with rate and error rate
on the edges.

**Service structure** returns the matching trees of spans and reassembles them
into a forest of service and operation nodes. It answers "what does a request
through this service actually touch".

**Exceptions** pulls `exception.type`, `exception.message` and
`exception.stacktrace` from every span with `status = error`, then groups by
message. The count next to each group tells you whether you are looking at the
outage or at background noise.

## Jump straight to a trace ID

Paste a trace ID into the lookup box. This is the other end of the log-to-trace
link, and it is what to do with the trace ID a customer sends you.

## Alerting on traces

Trace queries do not offer **Create alert**. The alert model covers Prometheus
and Loki queries. To alert on trace-derived behaviour, alert on the metrics your
spans produce. See [Alerting](/insights/alerting).

## The same data over HTTP

This page queries the Tempo-compatible endpoint. See
[Trace query API overview](/trace-query/overview) for TraceQL over HTTP.
