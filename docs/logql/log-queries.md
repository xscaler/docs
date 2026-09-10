---
id: log-queries
title: LogQL Log Queries
sidebar_label: Log queries
slug: /logql/log-queries
---

# LogQL Log Queries

A log query returns log lines. It is a stream selector followed by an optional
pipeline of `|` stages.

```logql
{container="query-frontend", namespace="prod"} |= "metrics.go" | logfmt | duration > 10s
```

---

## Stream selector

Selects streams by label. See [operators](/logql/overview#stream-selector-operators).

```logql
{app="mysql", name="mysql-backup"}
```

Regex matchers (`=~`, `!~`) are fully anchored — `{job=~"app"}` matches the whole
value, not a substring. Use `.` freely; add the `(?s)` flag if a value can span
newlines.

Keep the selector as tight as you can. Everything after `{}` runs on the lines
the selector already pulled from storage.

---

## Line filter expressions

A distributed `grep` over the raw line.

| Operator | Keeps lines that… |
|----------|-------------------|
| `\|=` | contain a string |
| `!=` | do not contain a string |
| `\|~` | match a regex (not anchored) |
| `!~` | do not match a regex |

```logql
{job="mysql"} |= "error"
{job="mysql"} |= "error" != "timeout"
{name="cassandra"} |~ `error=\w+`
{instance=~"kafka-[23]"} != "kafka.server:type=ReplicaManager"
```

Chain filters to narrow progressively. `|=` and `!=` are much faster than the
regex forms, so filter on a literal string first and let regex work on the
smaller result.

Use backticks for regex patterns so you don't have to escape backslashes.
Regex matching is case-sensitive; prefix with `(?i)` for case-insensitive.

### or between filters

Match any of several terms in a single stage with `or`. Every operand in the
chain must use the same operator.

```logql
{job="app"} |= "error" or "warn" or "fatal"
{job="app"} !~ `2\d\d` or `3\d\d`
```

### Pattern match filters

`|>` and `!>` match a line against a pattern instead of a regex — `<_>` is a
wildcard for any run of text. Faster and easier to read than the equivalent
regex.

```logql
{job="nginx"} |> `<_> "GET <_>" 200 <_>`
{job="nginx"} !> `<_> level=debug <_>`
```

### decolorize

Strip ANSI colour codes before matching or displaying:

```logql
{job="app"} | decolorize
```

---

## Label filter expressions

Filter on labels — either stream labels or labels a parser extracted.

```logql
{job="app"} | json | status >= 500 and duration > 250ms
```

Value types and comparators:

| Type | Example | Comparators |
|------|---------|-------------|
| String | `"GET"`, `` `GET` `` | `=` `!=` `=~` `!~` |
| Number | `250`, `89.923` | `=` `==` `!=` `>` `>=` `<` `<=` |
| Duration | `"250ms"`, `"1.5h"`, `"2h45m"` | as number |
| Bytes | `"42MB"`, `"1.5KiB"` | as number |

Combine predicates with `and` / `or`, or with a comma, pipe, or space (all mean
`and`). Parentheses set evaluation order.

```logql
| duration >= 20ms or size == 20KB and method !~ "2.."
```

`and` is evaluated before `or`. A `|` ends the predicate list and starts a new
stage, so it groups everything before it: `| a or b | c` means `(a or b) and c`.

### IP address matching

`ip("…")` matches an address, a range, or a CIDR block — for IPv4 and IPv6 —
without the false positives of a substring filter.

```logql
{job="app"} |= ip("10.0.0.0/8")                 # line filter: only |= and !=
{job="app"} | logfmt | remote_addr = ip("2001:db8::1-2001:db8::8")   # label filter: only = and !=
{job="app"} | logfmt | addr = ip("192.168.4.0/24") or addr = ip("10.10.15.0/24")
```

### distinct

`| distinct label[,label…]` keeps the first line for each distinct value and
drops later repeats — useful for "show me one example per user".

```logql
{job="app"} | json | distinct user_id
```

---

## Structured metadata

Structured metadata is key-value data attached to a log line but **not** indexed
as a stream label. OpenTelemetry attributes that xScaler does not promote to
stream labels — `trace_id`, `span_id`, `service.instance.id`, and similar — land
here.

Filter on it directly, with no parser:

```logql
{service_name="checkout"} | trace_id="8f2b1c..."
{service_name="checkout"} | level="error" or level="warn"
```

Put these filters **before** any parser, `line_format`, or `label_format` stage.
A structured-metadata filter that runs before the pipeline mutates labels is
cheaper.

---

## Parser expressions

Parsers extract labels from the line so you can filter, format, or aggregate on
their values.

### json

```logql
| json                                   # every field becomes a label
| json first_server="servers[0]", ua="request.headers[\"User-Agent\"]"
```

Nested keys are flattened with `_` (`request_method`). Arrays are skipped unless
you index into them explicitly.

### logfmt

```logql
| logfmt                                 # every key=value pair
| logfmt host, fwd_ip="fwd"              # only these keys
| logfmt --strict --keep-empty host
```

`--strict` fails on malformed pairs; `--keep-empty` keeps keys whose value is
empty.

### pattern

Match the line's shape with named captures. `<_>` skips a segment.

```logql
| pattern `<ip> - - <_> "<method> <uri> <_>" <status> <size>`
```

Fast and readable for fixed-layout lines such as access logs.

### regexp

RE2 with named groups; each group becomes a label.

```logql
| regexp `(?P<method>\w+) (?P<path>[\w/]+)`
```

### unpack

Restores labels packed by a collector's `pack` stage (for example Grafana
Alloy's), replacing the line with the original `_entry` value.

```logql
| unpack
```

---

## Line format expression

Rewrite the line with a Go [text/template](/logql/template-functions). Label
names are the variables.

```logql
{container="frontend"} | logfmt | line_format "{{.query}} took {{.duration}}"
```

- `{{.__line__}}` is the current line, `{{.__timestamp__}}` its timestamp.
- Backticks avoid escaping quotes inside the template.
- Template functions are available: `line_format "{{ .path }} {{ div .duration 1000 }}ms"`.

---

## Label format expression

Rename or synthesise labels.

```logql
| label_format http_status=status                      # rename, drops `status`
| label_format endpoint="{{.method}} {{.path}}"        # new label, keeps sources
```

The rename form (`dst=src`) takes a bare identifier on the right. The template
form takes a quoted string.

---

## drop and keep

```logql
| drop __error__, level, app=~"debug.*"     # remove these labels
| keep level, method="GET"                  # remove everything else
```

Use `drop __error__` to discard the pipeline errors a parser adds on malformed
lines. `keep` never drops `__error__` / `__error_details__`.

---

## Pipeline errors

When a stage can't process a line — malformed JSON, a label that won't convert
to a number, a bad unwrap — the line is **not** dropped. It continues down the
pipeline with an `__error__` label (for example `JSONParserErr`) and an
`__error_details__` label.

Filter these out with a label filter placed **after** the stage that produced
the error:

```logql
{job="app"} | json | __error__ = ""              # keep only lines that parsed
{job="app"} | json | __error__ != "JSONParserErr" # drop one specific error
{job="app"} | json | __error__ != ""             # inspect only the failures
```

`__error__` is tested as a string (`= ""`, `!= ""`); numeric comparisons against
it fail to parse. In an unwrapped metric query the filter goes inside the range:

```logql
quantile_over_time(0.99,
  {job="app"} | json | unwrap latency_seconds | __error__="" [5m]) by (route)
```
