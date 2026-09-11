---
id: overview
title: PromQL Overview
sidebar_label: Overview
slug: /promql/overview
---

# PromQL Overview

PromQL is the query language for metrics in xScaler. Any tool that speaks
PromQL works against the [metrics query API](/query/overview) without
modification.

An instant query evaluates an expression at one point in time; a range query
evaluates it repeatedly at equally-spaced steps between a start and an end
time. The language is identical either way — a range query is just an instant
query run many times.

---

## Data types

An expression evaluates to one of four types:

| Type | Description |
|------|-------------|
| Instant vector | One sample per time series, all at the same timestamp |
| Range vector | A range of samples over time, per time series |
| Scalar | A single floating-point number |
| String | A string value (largely unused in practice) |

Instant queries accept any of the four as a top-level result. Range queries
only accept scalar and instant-vector expressions.

### Samples: floats and native histograms

A sample is either a plain float, or a **native histogram** — a single sample
that carries a full count/sum/bucket distribution rather than the classic
`_bucket`/`_count`/`_sum` series triplet. Most functions below only operate on
floats and silently ignore histogram samples unless stated otherwise; the
[histogram functions](/promql/functions#histograms) are the ones that read them.

---

## Literals

| Type | Example |
|------|---------|
| String | `"GET"`, `'GET'`, `` `GET` `` |
| Float | `23`, `-2.43`, `3.4e-9`, `1_000_000` |
| Duration (as a float, in seconds) | `1s`, `2m`, `1h30m`, `54s321ms` |

Duration units: `ms` `s` `m` `h` `d` `w` `y`. Combine units by concatenating
them longest-to-shortest (`1h30m`, `12h34m56s`); a given unit can appear only
once.

### Duration expressions

Wherever a duration is expected — a range vector's `[...]`, or an `offset` —
you can write an arithmetic expression instead of a literal:

```promql
rate(http_requests_total[5m * 2])          # 10-minute range
http_requests_total offset (1h / 2)        # 30-minute offset
```

Supported operators: `+` `-` `*` `/` `%` `^`, at the usual precedence.
`offset` needs the expression wrapped in parentheses, or only the first value
is used.

---

## Time series selectors

### Instant vector selector

A bare metric name selects every series with that name:

```promql
http_requests_total
```

Add label matchers in `{}` to narrow it:

| Operator | Selects labels that… |
|----------|----------------------|
| `=` | exactly equal a string |
| `!=` | do not equal a string |
| `=~` | regex-match a string |
| `!~` | do not regex-match a string |

```promql
http_requests_total{job="api", status!~"4.."}
```

Regex matches are fully anchored — `env=~"foo"` means `env=~"^foo$"`.

A matcher against an empty string (`env=""`) also matches series that don't
have the label at all. The metric name is itself the internal `__name__`
label, so `{__name__=~"job:.*"}` selects by a name pattern.

A selector needs a metric name or at least one matcher that doesn't match the
empty string — `{job=~".*"}` is invalid; `{job=~".+"}` is fine.

### Range vector selector

Append `[duration]` to fetch a window of samples per series instead of one:

```promql
http_requests_total{job="api"}[5m]
```

The range is left-open, right-closed: a sample exactly at the start of the
window is excluded, one exactly at the end is included.

### offset modifier

Shifts a selector's evaluation time into the past (or, with a negative value,
the future). Must immediately follow the selector:

```promql
http_requests_total offset 5m                    # good
rate(http_requests_total[5m] offset 1w)           # good — a week-old 5m rate
sum(http_requests_total{method="GET"}) offset 5m  # invalid — offset applies too late
```

### @ modifier

Pins a selector to a fixed evaluation timestamp (a Unix time as a float
literal), regardless of the query's own time range:

```promql
http_requests_total @ 1609746000
rate(http_requests_total[5m] @ 1609746000)
```

`@` and `offset` can combine, in either order, with the same result. The
special values `start()` and `end()` resolve to the query's start/end time (or
the evaluation time, for an instant query):

```promql
rate(http_requests_total[5m] @ end())
```

### Subquery

Runs an inner instant query repeatedly to produce a range vector, with its own
resolution:

```
<instant_query> [ <range> : [<resolution>] ] [ @ <time> ] [ offset <duration> ]
```

```promql
# 5-minute rate of http_requests_total, over the last 30 minutes, sampled every 1m
rate(http_requests_total[5m])[30m:1m]
```

Omit the resolution to use the default evaluation interval. Nest subqueries
sparingly — they multiply query cost fast.

---

## Comments

```promql
# everything after a # to end of line is ignored
sum(rate(http_requests_total[5m]))  # request rate
```

---

## Regular expressions

All regexes use [RE2 syntax](https://github.com/google/re2/wiki/Syntax) and are
fully anchored, in both label matchers and function arguments that take a
regex.

---

## Staleness

A query samples each series at timestamps chosen independently of that
series' actual data — necessary so that aggregated series line up. Each series
gets the value of its most recent sample at or before that timestamp, as long
as that sample is within the **lookback period** (5 minutes by default,
overridable per query with `lookback_delta`). A series with no sample inside
that window is treated as stale and contributes nothing — this is why a graph
can show a gap right after a target stops reporting, even though older data is
still on disk.

---

## Where to go next

- [Operators](/promql/operators) — arithmetic, comparison, logical/set, vector matching, aggregations
- [Functions](/promql/functions) — rate/counters, over-time aggregations, histograms, labels, and more
- [Best practices](/promql/best-practices) — keep queries fast and correct
