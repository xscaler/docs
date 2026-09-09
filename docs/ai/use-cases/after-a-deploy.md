---
id: ai-uc-after-a-deploy
title: "Check what changed after a deploy"
sidebar_label: "After a deploy"
slug: /ai/use-cases/after-a-deploy
---

# Check what changed after a deploy

> A release went out at 14:00. Nothing is on fire, but somebody should check before going home.

## Prerequisites

- A connected client with `metrics:read`. See [Connect a client](/ai/connect).

## Step 1: Ask for both sides of the release

Ask:

```text
Compare the error rate by service in production for the hour before 14:00
against the hour after.
```

The agent runs the same query over two windows and reads the exact statistics from each, so the comparison is between real numbers rather than between two pictures.

```text
sum by (service_name) (rate(http_server_requests_total{status=~"5.."}[5m]))
2026-09-09T14:00:00Z to 2026-09-09T15:00:00Z, step 30s
4 of 11 matching series

{service_name="checkout"}
  ▁▁▁▂▃▄▅▅▆▆▆▇▇▇▇▇▇▇▆▇▇▇▇▇▇▇▇▇▇▇▇▇
  min 0.02  max 0.71  mean 0.48  p95 0.66  last 0.63

{service_name="catalog"}
  ▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁
  min 0  max 0.01  mean 0.001  p95 0  last 0

What was left out:
- 11 series matched and the 4 with the highest peak values were returned
  Instead: narrow the query with a label matcher, or wrap it in topk() to choose which ones
```

Checkout went from a mean near zero to 0.48 and stayed there. Catalog did not move.

## Step 2: Chart it for the channel

Ask:

```text
Chart the checkout error rate from 13:00 to 15:00.
```

`render_chart` returns a Vega-Lite v5 specification with the points inline, which a capable client draws as it stands. It carries what a model would otherwise guess: that this is a time series, the step it ran at, and which series hold the answer. The same answer also carries a link to the query in the portal, so the chart in the channel and the page somebody opens are the same query.

## Step 3: Say which change it was

Ask:

```text
Which of these series started moving first, and at what minute?
```

The statistics are exact and every answer echoes the window and step it used, so a claim about a minute is checkable rather than inferred from the shape of a sparkline.

## Refine the investigation

- "Is the latency up too, or only the errors?"
- "Find a trace behind one of those checkout errors."
- "Was the request rate the same across both windows, or is this just less traffic?"
- "Set up an alert so nobody has to check this by hand next time."

## Under the hood

| Step | Tool | What it does |
|---|---|---|
| 1 | `query_metrics` | Runs the query per window and returns exact statistics with a reduced set of points |
| 2 | `render_chart` | Returns a Vega-Lite v5 specification with the points inline, plus a portal link |

A metrics window can be up to 31 days, so a before-and-after can be a week either side rather than an hour. See [Limits](/ai/limits).

## Next steps

- [Create an alert rule and check it first](/ai/use-cases/alert-rule)
- [Find where latency is going](/ai/use-cases/latency)
