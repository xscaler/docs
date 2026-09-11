---
id: operators
title: PromQL Operators
sidebar_label: Operators
slug: /promql/operators
---

# PromQL Operators

PromQL has unary, binary, and aggregation operators.

---

## Unary minus

`-` negates a scalar or every element of an instant vector.

```promql
-http_requests_total
```

---

## Binary operators

Defined between scalar/scalar, vector/scalar, and vector/vector operands.
Between two vectors, each left-hand element is matched to one right-hand
element (see [vector matching](#vector-matching)); elements with no match are
dropped from the result.

### Arithmetic

| Operator | Meaning |
|----------|---------|
| `+` `-` `*` `/` `%` `^` | addition, subtraction, multiplication, division, modulo, power |

```promql
sum(rate(http_requests_total[5m])) * 2
(instance_memory_limit_bytes - instance_memory_usage_bytes) / 1024 / 1024
```

A vector-vector arithmetic op always drops the metric name from the result,
even when `on()` explicitly names `__name__`.

### Trigonometric

`atan2` behaves like an arithmetic operator (works in radians, supports vector
matching) rather than a plain function — useful when you need to combine two
vectors trigonometrically.

### Histogram trim

`</` (trim upper) and `>/` (trim lower) drop native-histogram observations
above or below a threshold, interpolating the boundary bucket. Left-hand side
must be a native histogram; right-hand side a float threshold.

### Comparison

| Operator | Meaning |
|----------|---------|
| `==` `!=` `>` `<` `>=` `<=` | equal, not-equal, greater/less than (or equal) |

By default these **filter**: elements where the comparison is false (or find
no match) are dropped. Add `bool` to get `0`/`1` back instead of filtering:

```promql
count_over_time(foo[1m]) > 10          # filters
count_over_time(foo[1m]) > bool 10     # keeps every series, value 0 or 1
```

Between two scalars, `bool` is mandatory. Without `bool`, a vector-vector
comparison keeps the left-hand metric name — unless `on()` is used (drops it)
or `group_right` is used (keeps the right-hand name instead, to avoid a
collision).

### Logical / set

Defined only between two instant vectors:

| Operator | Result |
|----------|--------|
| `and` | left-hand elements that have a label-matching element on the right |
| `or` | every left-hand element, plus right-hand elements with no match on the left |
| `unless` | left-hand elements that have **no** matching element on the right |

```promql
rate({app=~"foo|bar"}[1m]) and rate({app="bar"}[1m])
```

---

## Vector matching

### on / ignoring

Vector-vector operators match by default on identical label sets. Adjust that:

| Keyword | Effect |
|---------|--------|
| `on(labels)` | match using only the listed labels |
| `ignoring(labels)` | match on everything except the listed labels |

```promql
method_code:http_errors:rate5m{code="500"} / ignoring(code) method:http_requests:rate5m
```

### group_left / group_right

For many-to-one or one-to-many matches — one side has more series per matched
key than the other. Name the higher-cardinality side:

```promql
method_code:http_errors:rate5m / ignoring(code) group_left method:http_requests:rate5m
```

A label list on the group modifier pulls extra labels from the "one" side into
the result: `group_left(info_label)`. Group modifiers only apply to
comparison, arithmetic, and trigonometric operators — `and`/`or`/`unless`
already match against every entry on the right by default.

### Fill modifiers (experimental)

`fill(v)`, `fill_left(v)`, `fill_right(v)` substitute a default value for a
missing match instead of dropping the element. **Requires the
`promql-binop-fill-modifiers` feature flag**, which is not enabled here —
document these as unavailable until that changes.

---

## Aggregation operators

Collapse an instant vector to fewer elements, aggregating values.

| Operator | Computes |
|----------|----------|
| `sum` | total |
| `avg` | mean |
| `min` / `max` | extremes (floats only) |
| `stddev` / `stdvar` | population deviation / variance (floats only) |
| `count` | number of elements |
| `count_values(label, v)` | one series per distinct value, counting occurrences |
| `group` | `1` for every group that has any value |
| `quantile(φ, v)` | φ-quantile, `0 ≤ φ ≤ 1` (floats only) |
| `topk(k, v)` / `bottomk(k, v)` | the `k` largest / smallest elements, with original labels |

```promql
sum by (application, group) (memory_consumption_bytes)
sum without (instance) (memory_consumption_bytes)   # equivalent, if instance is the only other label
topk(5, memory_consumption_bytes)
count_values("version", build_version)
```

`by (labels)` keeps only the listed labels; `without (labels)` drops them and
keeps the rest. Either clause can go before or after the parenthesised
expression. `topk`/`bottomk` return series sorted by value on an instant
query; range queries have no such ordering guarantee.

### limitk / limit_ratio (experimental)

`limitk(k, v)` samples `k` series; `limit_ratio(r, v)` samples a
deterministic, pseudo-random ratio `r` (`-1 ≤ r ≤ 1`; negative selects the
complement) — handy for exploring a high-cardinality metric without pulling
every series. **Both require the `promql-experimental-functions` feature
flag**, which is not enabled here.

---

## Precedence

Highest to lowest:

1. `^`
2. `*` `/` `%` `atan2`
3. `+` `-`
4. `==` `!=` `<=` `<` `>=` `>`
5. `and` `unless`
6. `or`

Same-precedence operators are left-associative, except `^`, which is
right-associative: `2 * 3 % 2` is `(2 * 3) % 2`, but `2 ^ 3 ^ 2` is `2 ^ (3 ^ 2)`.
