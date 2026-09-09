---
id: ai-uc-latency
title: "Find where latency is going"
sidebar_label: "Find where latency goes"
slug: /ai/use-cases/latency
---

# Find where latency is going

> The checkout p95 has been over a second all morning. The dashboard shows the spike but not the cause.

## Prerequisites

- A connected client with `metrics:read` and `traces:read`. See [Connect a client](/ai/connect).
- A latency histogram with exemplars enabled, for step 2.

## Step 1: Confirm the shape

Ask:

```text
What is the p95 request duration for checkout in production over the last 6 hours?
```

```text
histogram_quantile(0.95, sum by (le) (rate(http_server_request_duration_bucket{service_name="checkout"}[5m])))
2026-09-09T04:12:00Z to 2026-09-09T10:12:00Z, step 60s
1 series

{service_name="checkout"}
  ▂▂▂▂▂▂▂▂▃▃▄▆███▇▇▇▇▆▆▆▆▆▆▆▆▆▆▆▆
  min 0.184  max 1.412  mean 0.621  p95 1.284  last 1.106

Open in xscaler: https://portal.xscalerlabs.com/acme/insight/explore?...
```

The statistics are computed from every point in the series before the points were reduced for display, so `max 1.412` is the real peak and not the peak of a sample.

An agent that does not know the metric name asks first. `list_metrics` narrows by a search string, and `describe_metric` reports whether a metric is a counter, a gauge or a histogram, which is what decides whether the query needs `rate()`.

## Step 2: Get a trace of a slow request

Ask:

```text
Find me an actual trace behind that p95.
```

The agent calls `find_exemplar_traces`, which returns the traces the store kept while recording samples, largest value first. A histogram saying the 99th percentile is four seconds hands back a trace that took four seconds.

Picking a slow trace out of `search_traces` instead is worse, and the tool description says so: a search that returns as many traces as it was allowed to has sampled the window, so ranking that sample by duration does not find the slowest trace in the window.

## Step 3: Break the trace down

Ask:

```text
Show me that trace.
```

```text
GET /api/checkout
7f1c88ad2b904e1590aa41c2e5d3b071  2026-09-09T09:22:14Z  1.38s
14 spans
services: checkout (5), catalog (6), redis (3)

  GET /api/checkout  1.38s  +0µs
  checkout
    GET /catalog/bulk  1.21s  +12.4ms
    catalog
      GET item  96.4ms  +18.1ms
      redis
      GET item  94.8ms  +115.9ms
      redis
      GET item  97.2ms  +212.0ms
      redis
```

Twelve sequential redis calls of about 95ms each inside one `/catalog/bulk` span. The endpoint is not slow, it is making a request per item.

## Refine the investigation

- "How many redis calls does a typical checkout trace make?"
- "Did the call count change this morning, or just the latency?"
- "Chart the redis command duration next to the checkout p95."
- "What logs did catalog write during that trace?"

## Under the hood

| Step | Tool | What it does |
|---|---|---|
| 1 | `list_metrics`, `describe_metric` | Finds the histogram and reports its type, so the query gets `rate()` and `histogram_quantile` right |
| 1 | `query_metrics` | Runs the query and returns exact statistics with a reduced set of points |
| 2 | `find_exemplar_traces` | Returns the traces the store kept while recording samples, largest value first |
| 3 | `get_trace` | Returns the spans as a tree with each span's offset from the start of the trace |

## Next steps

- [Reconstruct a bug from a trace id](/ai/use-cases/trace-id)
- [Check what changed after a deploy](/ai/use-cases/after-a-deploy)
