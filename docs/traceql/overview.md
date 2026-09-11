---
id: overview
title: TraceQL Overview
sidebar_label: Overview
slug: /traceql/overview
---

# TraceQL Overview

TraceQL is the query language for traces in xScaler. It uses similar syntax and
semantics to PromQL and LogQL where possible. Any tool that speaks TraceQL works
against the [trace query API](/trace-query/overview) without modification.

A query is evaluated one trace at a time, as a pipeline of chained expressions.
`{}` always selects a set of spans; everything after it narrows, groups, or
aggregates that selection.

---

## Two kinds of query

| Type | Returns | Example |
|------|---------|---------|
| [Span query](/traceql/span-queries) | Traces containing matching spans | `{ status = error }` |
| [Metrics query](/traceql/metrics-queries) | A time series computed over spans | `{ status = error } \| rate()` |

A metrics query always appends an aggregation function — `rate()`,
`count_over_time()`, and similar — to a span query.

---

## Anatomy of a query

```traceql
{ resource.service.name = "checkout" && span.http.status_code >= 500 } | count() > 2
└──────────────────────── span selection ────────────────────────┘ └─ pipeline ─┘
```

- `{}` selects spans matching every condition inside it — all conditions must
  hold on the **same span**.
- Everything after `|` is a pipeline stage: an aggregate filter, a `by()`
  grouping, a `select()`, or (for metrics queries) a rate/count/quantile
  function.
- Multiple `{}` blocks combined with `&&`, `||`, or a structural operator
  (`>>`, `>`, `~`, …) let conditions span different spans in the same trace.

---

## Intrinsics vs. attributes

- **Intrinsics** are fields every span or trace has, referenced with a colon:
  `span:duration`, `span:status`, `trace:rootService`, `event:name`.
- **Attributes** are the key/value pairs your instrumentation attaches,
  referenced with a period and a scope: `span.http.method`,
  `resource.service.name`, `event.exception.message`, `link.opentracing.ref_type`.

```traceql
{ span:status = error }
{ span.http.status_code >= 500 }
{ resource.service.name = "checkout" }
```

Prefer trace-level intrinsics (`trace:duration`, `trace:rootService`,
`trace:rootName`) over span-level ones when they answer the question — they're
identical for every span in the trace and cheaper to evaluate.

See [span queries](/traceql/span-queries) for the full intrinsics table and
attribute scopes.

---

## Value types and literals

| Type | Example |
|------|---------|
| String | `"GET"` |
| Integer | `200`, `-1` |
| Float | `1.5` |
| Duration | `100ms`, `5s`, `2h` |
| Status / kind enum | `error`, `ok`, `unset`; `server`, `client`, `producer`, `consumer`, `internal` |
| `nil` | attribute missing or null |

`minInt` / `maxInt` are built-in constants for the 64-bit integer bounds.

---

## Comparison operators

`=` `!=` `>` `>=` `<` `<=` `=~` `!~`

Regexes use Go RE2 syntax and are **fully anchored** — `{ span.foo =~ "bar" }`
matches only the exact value `bar`, not any value containing it. Use
`.*bar.*` for an unanchored match.

```traceql
{ span.http.status_code >= 400 && span.http.status_code < 500 }
{ span.http.method =~ "GET|DELETE" }
{ span.any_attribute != nil }
```

---

## Where to go next

- [Span queries](/traceql/span-queries) — selection, structural operators, aggregate filters, grouping
- [Metrics queries](/traceql/metrics-queries) — rate, count/sum/quantile over time, arithmetic, `compare()`
- [Best practices](/traceql/best-practices) — keep queries fast and cheap
