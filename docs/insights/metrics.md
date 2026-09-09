---
id: metrics
title: Metrics in Insights
sidebar_label: Metrics
slug: /insights/metrics
---

# Metrics in Insights

Break a metric down by label and read the result. There is no PromQL to write
before you see something.

Open **Insights → Metrics**.

## Find a metric

Type into the metric search. Every term you type has to appear somewhere in the
metric name, and order does not matter, so `total http` and `http total` return
the same set. `_` and `:` stay inside a term, so `node_cpu` is one term rather
than two.

Pick a metric and Insights charts it over the time range in the toolbar.

## Break it down

The breakdown grid splits the selected metric by one label and draws a panel per
value. Use it for "which one" questions: which pod, which status code, which
region.

1. Choose the label from the selector above the grid. **All** instead draws one
   panel per label, which is a quick way to see which labels the metric even
   carries.
2. Switch between **Single**, **Grid** and **Rows** to trade panel size against
   how many you see at once.
3. Search the value tiles by name when there are more than a screenful.
4. **Include** or **Exclude** on a tile narrows the whole session, not just that
   panel.

The grid shows up to 24 value tiles, and **All** mode up to 12 panels. On a
high-cardinality label, add a filter first so the values you care about are in
that window.

:::tip[Cardinality]
A label with thousands of values makes a slow query and an unreadable grid.
Filter, then break down. [Limits & quotas](/limits) lists the ingest-side
cardinality limits.
:::

## Write the query yourself

The toolbar's query button opens a drawer holding the raw PromQL for the current
view. Edit it to override what the controls built. An active override is
labelled in the toolbar, so results that no longer match the filters above them
say so.

## What to do with a result

**Add to dashboard** writes the current query into a dashboard panel.

**Create alert** opens the rule editor seeded with the expression and the data
source.

**Share** copies a link to the view as it stands. The whole session lives in the
query string, filters included. A relative window such as `now-6h` re-resolves
in whoever opens it, at their clock, so the menu also offers a variant with the
time range pinned to absolute timestamps. Use that one when you are sharing
during an incident.

## The same data over HTTP

This page queries the Prometheus-compatible endpoint you can call yourself. See
[Query API overview](/query/overview) for instant and range queries over HTTP.
