---
id: best-practices
title: LogQL Query Best Practices
sidebar_label: Best practices
slug: /logql/best-practices
---

# LogQL Query Best Practices

A LogQL query is evaluated left to right. Every stage should make the working
set smaller, so order matters as much as content. These habits keep queries fast
and inside the [2-minute query timeout](/log-query/overview#query-timeout).

---

## Narrow the time range first

The range decides how many chunks the backend reads before any filtering. Use
the Grafana time picker, or `start` / `end` on
[`/api/v1/query_range`](/log-query/range-query). A tight range beats every other
optimisation.

---

## Select streams with the most specific label

Only labels are indexed, so the stream selector is the one part of the query
that avoids scanning data. Lead with the label that isolates your target — pick
`app="checkout"` over `namespace="prod"` — and you often need no second matcher.

Avoid selectors that match a huge number of streams (`{job=~".+"}`) unless a
metric query genuinely needs them.

---

## Filter with literal strings before regex

`|=` and `!=` are evaluated far faster than `|~` and `!~`. Put a literal filter
first to shrink the set, then let regex run on what remains.

```logql
# good — literal filter narrows before the regex
{job="app"} |= "error" |~ `user_id=\d+`

# slower — regex runs on every line
{job="app"} |~ `error.*user_id=\d+`
```

---

## Parse after filtering

`json`, `logfmt`, `pattern`, `regexp`, and `unpack` run per line. Place them
after your line filters so they only process lines you already care about.

```logql
{job="api"} |= "level=error" | logfmt | status >= 500
```

Extract only the fields you need (`| logfmt status, duration`) rather than every
key.

---

## Prefer `pattern` over `regexp`

For fixed-layout lines such as access logs, the `pattern` parser is faster and
easier to read than an equivalent named-group regex.

---

## Keep metric windows sensible

The `[range]` in `rate({…}[5m])` should be at least 4× your query `step`. Wider
windows smooth the graph but read more data. For long time ranges, raise `step`
so you return 200–400 points, not thousands.

---

## Promote a slow query to a recording rule

If a dashboard or alert runs the same expensive metric query on every refresh,
define a [recording rule](/rules-and-alerts) so it is precomputed. Panels then
read a cheap, ready-made series.
