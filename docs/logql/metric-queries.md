---
id: metric-queries
title: LogQL Metric Queries
sidebar_label: Metric queries
slug: /logql/metric-queries
---

# LogQL Metric Queries

A metric query applies a function to the result of a log query and returns
numbers instead of lines — an error rate, a p99 latency, the noisiest service.
Use it with the [range query API](/log-query/range-query) to graph a result, or
the [instant query API](/log-query/instant-query) for a single value.

```logql
sum by (service) (rate({job="app"} |= "error" [5m]))
```

---

## Log range aggregations

These operate on a log stream over a `[duration]` window.

| Function | Returns |
|----------|---------|
| `rate(range)` | Entries per second |
| `count_over_time(range)` | Entry count in the window |
| `bytes_rate(range)` | Bytes per second |
| `bytes_over_time(range)` | Bytes in the window |
| `absent_over_time(range)` | `1` if the selector matched nothing, else empty |

```logql
count_over_time({job="mysql"}[5m])
sum by (level) (count_over_time({job="app"} | json [5m]))
```

### offset modifier

Shift the window back in time. It must come right after the range selector:

```logql
count_over_time({job="mysql"}[5m] offset 5m)     # valid
count_over_time({job="mysql"}[5m]) offset 5m     # invalid
```

---

## Unwrapped range aggregations

Add `| unwrap <label>` to turn an extracted label into the sample value, then
aggregate it. Conversion helpers: `unwrap duration(field)`, `unwrap
duration_seconds(field)`, `unwrap bytes(field)`.

| Function | Returns |
|----------|---------|
| `rate(range)` | Per-second rate of the summed values |
| `rate_counter(range)` | Per-second rate, treating values as a counter |
| `sum_over_time(range)` | Sum of values |
| `avg_over_time(range)` | Mean |
| `min_over_time` / `max_over_time` | Extremes |
| `first_over_time` / `last_over_time` | Edge values |
| `stddev_over_time` / `stdvar_over_time` | Spread |
| `quantile_over_time(φ, range)` | φ-quantile, `0 ≤ φ ≤ 1` |
| `absent_over_time(range)` | `1` if no data, else empty |

```logql
# p99 request duration by route
quantile_over_time(0.99, {job="app"} | json | unwrap duration_ms [5m]) by (route)

# Bytes written per second, from a logged field
sum by (pod) (rate({job="app"} | logfmt | unwrap bytes(out) [1m]))
```

Grouping syntax:

```
<aggr>([param,] <unwrapped-range>) [by (labels) | without (labels)]
```

---

## Vector aggregation operators

Wrap a range aggregation to combine series.

| Operator | Effect |
|----------|--------|
| `sum` | Total |
| `avg` | Mean |
| `min` / `max` | Extremes |
| `count` | Number of series |
| `stddev` / `stdvar` | Spread |
| `topk(k, …)` / `bottomk(k, …)` | k largest / smallest series |
| `sort` / `sort_desc` | Order the result (instant queries only) |

```logql
topk(10, sum by (path) (rate({job="nginx"} | json [5m])))
sum by (service) (rate({job="app"} |= "error" [5m]))
```

`by (labels)` keeps only the listed labels; `without (labels)` drops them.

### vector

`vector(s)` returns scalar `s` as a labelless series — handy as an `or` fallback
so a panel shows `0` rather than "No data":

```logql
sum(count_over_time({namespace="traefik"}[5m])) or vector(0)
```

### approx_topk

`approx_topk(k, <vector>)` approximates `topk` cheaply over very large result
sets. Instant queries only, no grouping.

---

## Binary operators

Combine two metric queries, or a query and a scalar.

| Group | Operators |
|-------|-----------|
| Arithmetic | `+` `-` `*` `/` `%` `^` |
| Comparison | `==` `!=` `>` `>=` `<` `<=` |
| Logical / set | `and` `or` `unless` |

```logql
# error ratio
sum(rate({app="foo"} |= "error" [5m])) / sum(rate({app="foo"} [5m]))

# streams that logged more than 10 lines in the last minute
count_over_time({foo="bar"}[1m]) > 10
```

Precedence, high to low: `^`, then `* / %`, then `+ -`, then comparison, then
`and unless`, then `or`. All are left-associative except `^`.

### bool modifier

By default a comparison **filters** series. Add `bool` after the operator to keep
every series and set its value to `1` (passes) or `0` (fails) instead.

```logql
count_over_time({foo="bar"}[1m]) > bool 10
```

### Vector matching

When both sides are vectors, elements are matched by identical label sets. Adjust
the match with `on` / `ignoring`, and fan out one-to-many with `group_left` /
`group_right`.

```logql
# match only on the `app` label
sum by (app, status) (rate({job="http"} | json [5m]))
  / on (app) group_left
sum by (app)         (rate({job="http"} | json [5m]))
```

`on (labels)` matches on only those labels; `ignoring (labels)` matches on all
but those. `group_left(extra)` / `group_right(extra)` name the higher-cardinality
side and carry `extra` labels through from the other side. Grouping modifiers
work with arithmetic and comparison operators only.

---

## label_replace

Rewrite or add a label on each series in an instant vector.

```
label_replace(v, dst_label, replacement, src_label, regex)
```

`regex` is matched against `src_label`; on a match, `dst_label` is set to
`replacement` with `$1`, `$2`… expanded from the capture groups. No match leaves
the series untouched.

```logql
label_replace(
  rate({job="api", service="a:c"} |= "err" [1m]),
  "team", "$1", "service", "(.*):.*")
```

---

## Result ordering

Metric results come back in no particular order unless the outer operator is
`sort` or `sort_desc`, and those only apply to instant queries. For range
queries, sort client-side.
