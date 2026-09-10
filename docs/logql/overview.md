---
id: overview
title: LogQL Overview
sidebar_label: Overview
slug: /logql/overview
---

# LogQL Overview

LogQL is the query language for logs in xScaler. It borrows its stream selector
syntax from PromQL, then adds a pipeline for filtering, parsing, and reshaping
log lines. Any tool that speaks LogQL works against the [log query
API](/log-query/overview) without modification.

xScaler runs a Loki-compatible backend, so the [upstream LogQL
reference](https://grafana.com/docs/loki/latest/query/) applies in full. These
pages summarise the parts you reach for most.

---

## Two kinds of query

| Type | Returns | Example |
|------|---------|---------|
| [Log query](/logql/log-queries) | Log lines | `{job="app"} \|= "error"` |
| [Metric query](/logql/metric-queries) | A numeric vector or matrix | `sum by (service) (rate({job="app"} \|= "error" [5m]))` |

A metric query always wraps a log query in a range aggregation such as `rate` or
`count_over_time`.

---

## Anatomy of a query

```logql
{job="app", env="production"}   | json | status >= 500 | line_format "{{.message}}"
└────────── selector ─────────┘ └───────────── pipeline ──────────────────────────┘
```

- The **stream selector** in `{}` is mandatory. It picks streams by label and is
  the only part backed by the index, so it decides how much data the query
  touches.
- The **pipeline** is a chain of `|` stages evaluated left to right. Each stage
  filters lines, extracts labels, or rewrites the line.

### Comments

`#` starts a comment that runs to the end of the line — handy for annotating
multi-line queries in Grafana.

```logql
{app="foo"}          # select the stream
  | json
  # | env="prod"     this line is ignored
  | status >= 500    # only server errors
```

---

## Stream selector operators

| Operator | Meaning |
|----------|---------|
| `=` | Label exactly equals |
| `!=` | Label does not equal |
| `=~` | Label matches regex (fully anchored) |
| `!~` | Label does not match regex |

```logql
{job="app"}
{job="app", env!="dev"}
{job=~"app|api", env="production"}
```

---

## Binary operators

Metric queries support the usual PromQL operators.

| Group | Operators |
|-------|-----------|
| Arithmetic | `+`  `-`  `*`  `/`  `%`  `^` |
| Comparison | `==`  `!=`  `>`  `<`  `>=`  `<=` |
| Logical / set | `and`  `or`  `unless` |

```logql
# Percentage of requests that error
sum(rate({job="app"} |= "error" [5m]))
  /
sum(rate({job="app"} [5m]))
```

Precedence, highest to lowest: `^`, then `* / %`, then `+ -`, then comparison,
then `and unless`, then `or`. Operators of equal precedence are left-associative
except `^`, which is right-associative.

See [metric queries](/logql/metric-queries#binary-operators) for the `bool`
modifier, vector matching (`on`, `ignoring`, `group_left`), and `label_replace`.

---

## Where to go next

- [Log queries](/logql/log-queries) — selectors, line filters, parsers, formatting
- [Metric queries](/logql/metric-queries) — range aggregations, unwrap, vector aggregations
- [Template functions](/logql/template-functions) — helpers for `line_format` and `label_format`
- [Query best practices](/logql/best-practices) — keep queries fast and cheap
