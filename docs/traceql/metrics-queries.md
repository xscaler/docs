---
id: metrics-queries
title: TraceQL Metrics Queries
sidebar_label: Metrics queries
slug: /traceql/metrics-queries
---

# TraceQL Metrics Queries

A metrics query appends an aggregation function to a [span query](/traceql/span-queries)
and returns a time series instead of traces — a request rate, an error ratio, a
p99 duration. Use it with the trace query API's range endpoint to graph a
result, or as an instant query for a single value.

```traceql
{ resource.service.name = "checkout" && status = error } | rate()
```

---

## Functions

| Function | Returns |
|----------|---------|
| `rate()` | matching spans per second |
| `count_over_time()` | matching spans per time interval |
| `sum_over_time(field)` | sum of a numeric field per interval |
| `min_over_time(field)` / `max_over_time(field)` / `avg_over_time(field)` | extremes / mean per interval |
| `quantile_over_time(field, φ…)` | one or more φ-quantiles (`0 ≤ φ ≤ 1`), e.g. `.99, .9, .5` |
| `histogram_over_time(field)` | frequency distribution per interval |
| `compare(...)` | splits spans into a selection and a baseline and diffs them |

```traceql
{ span:name = "GET /:endpoint" } | count_over_time() by (span.http.status_code)
{ span:name = "GET /:endpoint" } | quantile_over_time(span:duration, .99, .9, .5)
{ } | histogram_over_time(span:duration) by (span.http.target)
```

The interval each function computes over is set by the `step` parameter on the
query (range queries only) — `step=15s`, `step=1m`. Left unset, `step` is
chosen automatically from the query's time range.

### by()

Without `by()` you get one aggregated series. With it, one series per unique
combination of the grouped fields.

```traceql
{ span:status = error } | rate()                              # one series
{ span:status = error } | rate() by (resource.service.name)   # one per service
```

---

## topk / bottomk

Applied after a metrics function, keep only the top or bottom `k` series —
evaluated independently at each data point, so the membership of the top-`k`
set can shift between points.

```traceql
{ resource.service.name = "checkout" } | rate() by (span.http.url) | topk(10)
{ resource.service.name = "checkout" } | rate() by (span.http.url) | bottomk(10)
```

---

## Comparison operators on results

`>` `>=` `<` `<=` `=` `!=` filter data points out of a metrics result; a series
with every point removed is dropped entirely.

```traceql
{} | rate() by (resource.service.name) > 10
{ span:name = "GET /:endpoint" } | avg_over_time(span:duration) > 1s
```

Combine freely with `topk` / `bottomk`, applied left to right:

```traceql
{} | rate() by (span.http.url) | topk(5) > 10
{} | rate() by (span.http.url) > 0 | topk(5)
```

---

## Arithmetic expressions

Combine two metrics queries, or a query and a scalar, with `+` `-` `*` `/`.
Each sub-query needs its own parentheses.

```traceql
(<spanset pipeline> | <metrics function>) <operator> (<spanset pipeline> | <metrics function>)
```

```traceql
# error ratio, as a percentage
100 * ({status=error} | count_over_time()) / ({} | count_over_time())

# each service's share of total throughput
({} | rate() by (resource.service.name)) / ({} | rate())
```

`by()` can appear on either or both sub-queries. With matching `by()` on both
sides, results are paired by label — as above, one output series per service.
Leave one side unlabelled (as in the throughput example) and it's applied to
every labelled series on the other side.

A scalar can sit on either side to rescale or shift a result:

```traceql
({} | rate()) * 60           # per-minute instead of per-second
({} | avg_over_time(span.http.response.body.size)) / (1024 * 1024)   # → MiB
```

Division by zero, or a bucket with no matching spans, yields `NaN`; any
arithmetic on `NaN` stays `NaN`. Duration literals (`10s`) can't be used as
scalar operands. `topk`, `bottomk`, and comparison operators can follow an
arithmetic expression the same way they follow a single metrics query.

---

## compare()

Splits spans into a **selection** (matching a filter) and a **baseline**
(everything else), then returns a labelled series per attribute/value so you
can see what's different between them — the engine behind Grafana's Traces
Drilldown Comparison tab.

```traceql
{ resource.service.name="checkout" && span.http.path="/pay" } | compare({span:status=error})
```

`compare(<selection filter>, <topN>, <start>, <end>)` — only the filter is
required; `topN` (default `10`) caps values returned per attribute, and the
optional start/end (Unix nanoseconds) narrow the selection window within the
query's overall range. Best run as an instant query. `compare()` cannot be
combined with arithmetic, `topk`/`bottomk`, or comparison operators.

---

## Sampling

Trade accuracy for speed on expensive metrics queries with a `with(...)` hint:

```traceql
{ resource.service.name="frontend" } | rate() with(sample=true)          # dynamic
{ span:status=error } | count_over_time() with(span_sample=0.1)          # fixed, by span
{ } | count_over_time() by (resource.service.name) with(trace_sample=0.05) # fixed, by trace
```

### Extrapolation from ingest-time sampling (experimental)

If spans were sampled at ingest by an OpenTelemetry probability sampler, each
surviving span carries the sampling probability in its W3C tracestate.
`with(extrapolate=true)` scales each span's contribution by
`1 / sampling_probability` so the result estimates the true, un-sampled volume
instead of just what was stored.

```traceql
{ resource.service.name="api" } | rate() with(extrapolate=true)
```

Applies to `rate`, `count_over_time`, `sum_over_time`, `avg_over_time`,
`histogram_over_time`, `quantile_over_time`, and `compare`. Not
`min_over_time` / `max_over_time` — extremes don't scale with sampling.

---

## Exemplars

Range metrics queries can return exemplars — an exact trace that contributed to
a given point, so you can jump from "the p99 spiked" straight to a
representative trace:

```traceql
{ span:name = "GET /:endpoint" } | quantile_over_time(duration, .99) by (span.http.target) with (exemplars=true)
```
