---
id: functions
title: PromQL Functions
sidebar_label: Functions
slug: /promql/functions
---

# PromQL Functions

Built-in functions, grouped by purpose. Unless noted, a function operates on
float samples and silently ignores histogram samples in its input.

---

## Counters and rates

| Function | Computes |
|----------|----------|
| `rate(range-vector)` | per-second average rate of increase, adjusted for counter resets |
| `irate(range-vector)` | per-second rate from just the last two points — for volatile, fast-moving counters |
| `increase(range-vector)` | total increase over the range (`rate()` × range length, for readability) |
| `delta(range-vector)` | difference between first and last sample — **gauges only** |
| `idelta(range-vector)` | difference between the last two samples — **gauges only** |
| `deriv(range-vector)` | per-second derivative via linear regression — **gauges only** |
| `predict_linear(range-vector, t)` | linear-regression-predicted value `t` seconds from now |
| `resets(range-vector)` | number of counter resets in the range |
| `changes(range-vector)` | number of value changes in the range |

```promql
rate(http_requests_total{job="api-server"}[5m])
increase(http_requests_total{job="api-server"}[5m])
predict_linear(node_filesystem_free_bytes[6h], 4 * 3600)  # free space in 4h
```

`rate`/`increase` extrapolate to the edges of the window, so a non-integer
result from integer counters is normal and expected.

:::tip Aggregate after rate, not before
`rate()` needs the raw counter to detect a reset. Take the rate first, then
aggregate:

```promql
sum(rate(http_requests_total[5m])) by (job)   # correct
rate(sum(http_requests_total[5m])) by (job)   # wrong — can miss resets
```

The same order applies to `irate()` and to any `_over_time` function.
:::

---

## Over-time aggregations

Aggregate each series of a range vector into one instant-vector value.

| Function | Computes |
|----------|----------|
| `avg_over_time` | mean (floats and histograms) |
| `sum_over_time` | sum (floats and histograms) |
| `min_over_time` / `max_over_time` | extremes (floats only) |
| `count_over_time` | sample count |
| `present_over_time` | `1` if any sample is present |
| `last_over_time` / `first_over_time` | most recent / oldest sample |
| `quantile_over_time(φ, range-vector)` | φ-quantile, `0 ≤ φ ≤ 1` |
| `stddev_over_time` / `stdvar_over_time` | population deviation / variance |

```promql
quantile_over_time(0.99, http_request_duration_seconds[5m])
```

`first_over_time(m[1m])` differs from `m offset 1m`: the former is the first
sample strictly inside the 1-minute window; the latter is the most recent
sample from *before* that window (subject to the lookback period).

---

## Histograms

For classic histograms (a `_bucket`/`_count`/`_sum` series triplet with an
`le` label) and for native histograms.

### histogram_quantile

`histogram_quantile(φ, b)` — the φ-quantile from a histogram, `0 ≤ φ ≤ 1`.

```promql
# classic histogram: φ over the buckets, aggregated by job — keep `le` in the by()
histogram_quantile(0.9, sum by (job, le) (rate(http_request_duration_seconds_bucket[10m])))

# native histogram: no `le` label needed
histogram_quantile(0.9, sum by (job) (rate(http_request_duration_seconds[10m])))
```

`histogram_quantile(0, …)` / `histogram_quantile(1, …)` give the estimated
min/max. Values are interpolated within the bucket containing the quantile,
so results are an estimate except at exact bucket boundaries.

### Other histogram functions

| Function | Computes |
|----------|----------|
| `histogram_fraction(lower, upper, b)` | estimated fraction of observations between two bounds |
| `histogram_avg(b)` | mean of observations — native histograms only |
| `histogram_count(b)` / `histogram_sum(b)` | observation count / sum — native histograms only |
| `histogram_stddev(b)` / `histogram_stdvar(b)` | estimated standard deviation / variance — native histograms only |

```promql
histogram_fraction(0, 0.2, rate(http_request_duration_seconds[1h]))  # ≤200ms fraction
histogram_avg(rate(http_request_duration_seconds[5m]))
```

---

## Labels

| Function | Does |
|----------|------|
| `label_replace(v, dst, replacement, src, regex)` | regex-match `src`; on match, set `dst` to `replacement` (`$1`, `$name`, …) |
| `label_join(v, dst, sep, src1, src2, …)` | join several label values with `sep` into `dst` |

```promql
label_replace(up{service="a:c"}, "team", "$1", "service", "(.*):.*")
label_join(up{src1="a",src2="b",src3="c"}, "combined", ",", "src1", "src2", "src3")
```

---

## Sorting and vector/scalar conversion

| Function | Does |
|----------|------|
| `sort(v)` / `sort_desc(v)` | order by value, ascending / descending — instant queries only |
| `vector(s)` | scalar `s` as a labelless one-element vector |
| `scalar(v)` | the single value of a one-element vector, else `NaN` |

```promql
sum(count_over_time({namespace="checkout"}[5m])) or vector(0)   # 0 instead of "no data"
```

---

## Absence

| Function | Returns |
|----------|---------|
| `absent(v)` | a 1-element vector if `v` matched nothing, else empty |
| `absent_over_time(range-vector)` | same, over a range — useful for "no data for N minutes" alerts |

```promql
absent(up{job="payments"})
absent_over_time(up{job="payments"}[10m])
```

---

## Math

| Function | Does |
|----------|------|
| `abs(v)` | absolute value |
| `ceil(v)` / `floor(v)` | round up / down |
| `round(v, to_nearest=1)` | round to nearest integer, or nearest multiple of `to_nearest` |
| `clamp(v, min, max)` / `clamp_min(v, min)` / `clamp_max(v, max)` | bound values |
| `exp(v)` / `ln(v)` / `log2(v)` / `log10(v)` / `sqrt(v)` | exponential, logarithms, square root |
| `sgn(v)` | `1`, `-1`, or `0` for the sign |

---

## Trigonometric

Radians, floats only: `sin` `cos` `tan` `asin` `acos` `atan` `sinh` `cosh`
`tanh` `asinh` `acosh` `atanh`. Plus `deg(v)` / `rad(v)` for unit conversion
and `pi()` for the constant.

---

## Time

| Function | Returns |
|----------|---------|
| `time()` | seconds since epoch, at query evaluation time |
| `timestamp(v)` | timestamp of each sample in `v` |
| `hour` / `minute` / `day_of_week` / `day_of_month` / `day_of_year` / `days_in_month` / `month` / `year` `(v=vector(time()))` | that field of each sample's timestamp, in UTC |

```promql
day_of_week() == 0   # it's Sunday
```

---

## Experimental functions

These require the `promql-experimental-functions` feature flag. **That flag is
not enabled here** — treat everything in this section as unavailable until
that changes, and reach for the stable equivalent instead.

| Function | Would compute | Stable alternative |
|----------|------|---------------------|
| `info(v, [selector])` | join in labels from an info series (e.g. `target_info`) | a manual `* on(...) group_left(...)` join |
| `double_exponential_smoothing(range-vector, sf, tf)` | smoothed trend forecast (formerly `holt_winters`) | `deriv()` / `predict_linear()` |
| `histogram_quantiles(v, label, φ1, φ2, …)` | several quantiles at once, labelled | repeat `histogram_quantile()` |
| `sort_by_label(v, label, …)` / `sort_by_label_desc(...)` | sort by label value instead of sample value | `sort()` / `sort_desc()` |
| `min_of(a, b)` / `max_of(a, b)` | smaller/larger of two scalars | — |
| `start()` / `end()` / `range()` / `step()` | the query's start/end timestamp, range length, or step, as a value usable anywhere | the `@ start()` / `@ end()` modifier keywords, which **are** stable |
| `mad_over_time(range-vector)` | median absolute deviation | `stddev_over_time()` |
| `ts_of_min_over_time` / `ts_of_max_over_time` / `ts_of_last_over_time` / `ts_of_first_over_time` `(range-vector)` | timestamp of the extreme/edge sample | `timestamp()` combined with the corresponding `_over_time` function |

`limitk()` and `limit_ratio()` are aggregation operators with the same gating
— see [Operators](/promql/operators#limitk--limit_ratio-experimental).
