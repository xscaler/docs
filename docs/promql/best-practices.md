---
id: best-practices
title: PromQL Query Best Practices
sidebar_label: Best practices
slug: /promql/best-practices
---

# PromQL Query Best Practices

These habits keep queries fast, correct, and inside the
[2-minute query timeout](/query/overview#query-timeout).

---

## Narrow before you graph

A bare metric name can expand to thousands of series. Build a query up in
stages: start with the tightest label selector you can write, check it
returns a reasonable number of series (hundreds, not thousands), and only then
wrap it in `rate()`, aggregate it, or graph it over a range. An aggregation
still costs the same to compute even if its output is a single number — it's
no cheaper than summing a column in a database.

```promql
http_requests_total{job="checkout", status=~"5.."}   # start here
sum(rate(http_requests_total{job="checkout", status=~"5.."}[5m]))  # then wrap
```

---

## Aggregate after `rate()`, never before

`rate()` (and `irate()`, and any `_over_time` function) needs the raw counter
series to detect a reset. Aggregating first hides those resets:

```promql
sum(rate(http_requests_total[5m])) by (job)   # correct
rate(sum(http_requests_total[5m])) by (job)   # wrong
```

---

## Match `step` to your scrape interval

Stepping a range query finer than the underlying scrape interval just repeats
data points; stepping much coarser than 4× the `rate()`/`increase()` window
under-samples. See [range query](/query/range-query#choosing-the-right-step)
for the HTTP-level guidance on choosing `step`.

---

## Prefer `rate()` for alerts and recording rules

`increase()` is `rate()` scaled by the window — clearer to read on a
dashboard, but purely syntactic sugar. Use `rate()` in [recording
rules](/rules-and-alerts) and alert conditions so the underlying series stays
consistently per-second; reserve `increase()` for human-facing panels.

---

## Know the lookback window

A series with no sample in the last 5 minutes (the default lookback,
overridable per-query with `lookback_delta`) is treated as stale and
disappears from results — even though the data is still on disk. If a graph
looks like it has unexplained gaps right after a deploy or a scrape hiccup,
check whether you're looking at a staleness gap before assuming data loss.

---

## Use recording rules for expensive, frequently-run queries

If a dashboard panel or alert re-runs the same non-trivial aggregation on
every refresh, define a [recording rule](/rules-and-alerts) so the result is
pre-computed once and every reader just reads a cheap series back.

---

## Reach for `on()`/`ignoring()` before `group_left`/`group_right`

Many-to-one matching is the sharper, harder-to-get-right tool. If the two
sides of a binary operation genuinely share a 1:1 label set once you ignore a
couple of labels, `ignoring(...)` alone usually gets there — reach for
`group_left`/`group_right` only when one side really does have more series
per key than the other.

---

## Treat gated functions as unavailable

`limitk`, `limit_ratio`, `info()`, `sort_by_label()`, `mad_over_time()`, and
the rest of the [experimental function list](/promql/functions#experimental-functions)
require the `promql-experimental-functions` feature flag, which isn't enabled
here. A query using one of them will fail to parse — reach for the stable
alternative listed alongside each one instead.
