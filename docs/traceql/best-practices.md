---
id: best-practices
title: TraceQL Query Best Practices
sidebar_label: Best practices
slug: /traceql/best-practices
---

# TraceQL Query Best Practices

TraceQL has to scan spans across potentially huge numbers of traces before it
can return a match. These habits keep queries fast and inside the
[2-minute query timeout](/trace-query/overview#query-timeout).

---

## Narrow the time range first

The range decides how many blocks the backend has to search before any
condition is even evaluated. Use the Grafana time picker, or `start` / `end` on
the [search API](/trace-query/search). A tight range beats every other
optimisation.

---

## Prefer trace-level intrinsics

`trace:duration`, `trace:rootName`, and `trace:rootService` are identical for
every span in a trace, so they're far cheaper to evaluate than an equivalent
span-level condition.

```traceql
{ trace:duration > 5s }                       # good
{ span:duration > 5s && span:parentID = "" }  # more expensive, same idea
```

---

## Start broad, then narrow with `&&`

Begin with `{ }` while exploring, then add conditions on the same span joined
with `&&` — cheaper than combining separate `{}` blocks with `&&`/`||`, which
forces the engine to correlate across spans.

```traceql
{ resource.service.name = "frontend" && name = "POST /api/orders" }
```

---

## Use attribute scopes to prune the read

`span.`, `resource.`, `event.`, and `link.` scopes let the engine skip
reading data outside the scope you asked for. A bare, unscoped condition (or
one that could match on any span) reads more than a scoped one.

```traceql
{ span.http.method = "GET" }          # scoped — reads only span.http.*
```

---

## Put the most selective condition first in a structural query

Structural operators (`>>`, `>`, `~`, …) always return matches from the
right-hand side, but the engine still benefits from a tight left-hand filter to
anchor the search.

```traceql
{ span.http.url = "/checkout" } >> { span.db.name = "orders-db" }
```

---

## Reach for `select()`, not a wider match

Need extra fields on the result? Add `select()` rather than loosening the span
condition — selected fields are fetched only after every other condition
already matched, so it's nearly free.

```traceql
{ status = error } | select(span.http.status_code, span.http.url)
```

---

## Combine related metrics in one query

Arithmetic expressions (`+ - * /`) let you compute a ratio or a scaled value in
a single query instead of running two and combining them client-side.

```traceql
100 * ({status=error} | count_over_time()) / ({} | count_over_time())
```

---

## Sample expensive metrics queries

A `with(sample=true)` (or a fixed `span_sample` / `trace_sample`) hint trades a
little accuracy for a much cheaper query — useful for exploratory dashboards
where an exact count isn't the point.

```traceql
{ resource.service.name="frontend" } | rate() with(sample=true)
```

---

## Reach for `most_recent` only when recency matters

`with (most_recent=true)` guarantees the freshest traces but does a deeper,
non-deterministic search that costs more. Use it for live-incident triage;
leave it off for routine queries where the default (first-`N`-found) ordering
is fine.
