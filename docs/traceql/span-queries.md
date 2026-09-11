---
id: span-queries
title: TraceQL Span Queries
sidebar_label: Span queries
slug: /traceql/span-queries
---

# TraceQL Span Queries

A span query selects traces by matching conditions against their spans. The
simplest query, `{ }`, matches every span. Everything else narrows that down.

```traceql
{ resource.service.name = "frontend" && name = "POST /api/orders" }
```

---

## Intrinsic fields

Fields every span, trace, event, or link has — always written `<scope>:<field>`.

| Field | Type | Meaning |
|-------|------|---------|
| `span:status` | enum | `error`, `ok`, or `unset` |
| `span:statusMessage` | string | text accompanying the status |
| `span:duration` | duration | end − start of the span |
| `span:name` | string | operation name |
| `span:kind` | enum | `server`, `client`, `producer`, `consumer`, `internal`, `unspecified` |
| `span:id` / `span:parentID` | string | hex span / parent ID |
| `span:childCount` | integer | number of direct children |
| `trace:duration` | duration | max(end) − min(start) across the trace |
| `trace:rootName` / `trace:rootService` | string | name / service of the root span |
| `trace:id` | string | hex trace ID |
| `event:name` | string | span event name |
| `event:timeSinceStart` | duration | event time relative to span start |
| `link:spanID` / `link:traceID` | string | linked span/trace ID |
| `instrumentation:name` / `instrumentation:version` | string | instrumentation scope |

```traceql
{ span:duration > 100ms }
{ trace:rootService = "gateway" }
{ span:childCount = 0 }             # leaf spans
```

Trace-level intrinsics (`trace:duration`, `trace:rootName`, `trace:rootService`)
are the same for every span in a trace and cheaper to evaluate than an
equivalent span-level condition — prefer them.

---

## Attribute fields

Custom key/value data, written `<scope>.<key>` — `span.`, `resource.`,
`event.`, `link.`, or `instrumentation.`. `resource` and `trace` have no
intrinsics of their own beyond what's listed above; everything else on them is
an attribute.

```traceql
{ span.http.method = "GET" }
{ resource.deployment.environment = "production" }
{ event.exception.message =~ ".*timeout.*" }
{ link.opentracing.ref_type = "child_of" }
{ instrumentation.name = "grpc" }
```

An attribute name with terminal characters (a period, a space) needs quoting:

```traceql
{ span."attribute name with space" = "value" }
{ span.attribute."nested name" = "value" }
```

### Arrays

If an attribute holds an array, `=` / `=~` match when **any** element
satisfies the condition; `!=` / `!~` match only when **no** element does.

```traceql
{ span.foo = "bar" }     # true if any element of the array equals "bar"
{ span.foo != "bar" }    # true only if no element equals "bar"
```

---

## Field expressions

All conditions inside one `{}` must hold on the **same span**.

```traceql
{ span.http.status_code >= 200 && span.http.status_code < 300 }
{ span.http.method = "DELETE" && status != ok }
```

---

## Combining spansets

### Logical (`&&`, `||`)

Separate `{}` blocks can match on *different* spans within the same trace.

```traceql
{ resource.cloud.region = "us-east-1" } && { resource.cloud.region = "us-west-1" }
{ resource.cloud.region = "us-east-1" } || { resource.cloud.region = "us-west-1" }
```

Contrast with putting both conditions in one `{}` — that requires a single
span to match both, which is impossible here since a span has one region.

`=~` with an alternation is usually more efficient than `||`:

```traceql
{ resource.cloud.region =~ "us-east-1|us-west-1" }
```

### Structural

These look at the trace's parent/child/sibling structure. They always return
matches from the **right-hand** side.

| Operator | Matches spans on the right that are… |
|----------|----------------------------------------|
| `A >> B` | descendants of a span matching `A` |
| `A << B` | ancestors of a span matching `A` |
| `A > B` | direct children of a span matching `A` |
| `A < B` | direct parents of a span matching `A` |
| `A ~ B` | siblings of a span matching `A` |

```traceql
{ span.http.url = "/checkout" } >> { span.db.name = "orders-db" }
```

**Union structural** (`&>>` `&<<` `&>` `&<` `&~`) return matches from **both**
sides — use them to pull the triggering span and its matching relatives in one
result:

```traceql
{ span.http.url = "/checkout" && status = error } &>> { status = error }
```

**Experimental** not-structural operators (`!>>` `!<<` `!>` `!<` `!~`) can
produce false positives but are useful for finding leaf/terminal spans:

```traceql
{ } !< { resource.service.name = "checkout" }   # leaf spans in checkout
{ status = error } !< { status = error }        # last error in a cascade
```

---

## Aggregate filters

Run inside the pipeline of a single query to filter on properties of the whole
matched spanset — distinct from [metrics queries](/traceql/metrics-queries),
which produce a time series.

| Function | Returns |
|----------|---------|
| `count()` | number of matching spans |
| `avg(field)` / `min(field)` / `max(field)` / `sum(field)` | aggregate of a numeric attribute or intrinsic |

```traceql
{ span.http.status_code = 200 } | count() > 3
avg(duration) > 20ms
{ } | sum(span.bytesProcessed) > 1000000000
```

### Grouping

```traceql
{ status = error } | by(resource.service.name) | count() > 1
```

---

## Arithmetic

```traceql
{ span.http.request_content_length > 10 * 1024 * 1024 }
```

---

## select()

Pull specific fields onto the result without them being part of the match
condition — cheap, since selected fields aren't fetched until every other
condition is already satisfied.

```traceql
{ status = error } | select(span.http.status_code, span.http.url)
```

---

## most_recent hint (experimental)

By default the query engine returns the first `N` matches it finds, which may
not be the newest. `with (most_recent=true)` forces a deeper search that
returns the freshest traces first — useful when triaging a live incident.

```traceql
{ } with (most_recent=true)
{ span.foo = "bar" } >> { status = error } with (most_recent=true)
```

This makes the search non-deterministic (repeating it can return a different
list) and costs more, so reach for it only when recency matters more than
speed.
