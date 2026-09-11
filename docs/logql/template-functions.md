---
id: template-functions
title: LogQL Template Functions
sidebar_label: Template functions
slug: /logql/template-functions
---

# LogQL Template Functions

`line_format` and `label_format` templates use Go
[text/template](https://pkg.go.dev/text/template) syntax. Extracted labels are
the pipeline variables (`{{ .status }}`), and the functions below are available
inside the template.

```logql
{job="app"} | json | line_format "{{ .method | upper }} {{ .path }} → {{ .status }}"
```

Pipe values through functions with `|`, or call them directly:
`{{ div .duration 1000 }}`.

---

## Line and timestamp

| Function | Description |
|----------|-------------|
| `__line__` | The original log line, unmodified |
| `__timestamp__` | The log line's timestamp as `time.Time` |

```logql
| line_format "{{ __timestamp__ }} {{ __line__ }}"
```

---

## Strings

| Function | Signature | Notes |
|----------|-----------|-------|
| `lower` / `upper` | `(s)` | Case conversion |
| `title` | `(s)` | Title Case |
| `trim` | `(s)` | Trim whitespace both ends |
| `trimAll` | `(chars, s)` | Trim the given cutset both ends |
| `trimPrefix` / `trimSuffix` | `(fix, s)` | Trim one end |
| `replace` | `(old, new, s)` | Replace every occurrence |
| `substr` | `(start, end, s)` | Substring by index |
| `repeat` | `(n, s)` | Repeat `s` n times |
| `indent` / `nindent` | `(spaces, s)` | Indent each line; `nindent` prepends a newline |
| `alignLeft` / `alignRight` | `(width, s)` | Pad or truncate to `width` |
| `printf` | `(format, args…)` | Go-style formatting |
| `default` | `(fallback, s)` | `fallback` when `s` is empty |
| `b64enc` / `b64dec` | `(s)` | Base64 |
| `urlencode` / `urldecode` | `(s)` | URL encoding |

```logql
| line_format `{{ alignRight 8 .status }} {{ .path | default "/" }}`
```

---

## Tests

| Function | Signature |
|----------|-----------|
| `contains` | `(substr, s) bool` |
| `hasPrefix` | `(prefix, s) bool` |
| `hasSuffix` | `(suffix, s) bool` |

```logql
| line_format "{{ if hasPrefix \"/api\" .path }}API {{ end }}{{ .path }}"
```

---

## Regex

| Function | Signature | Notes |
|----------|-----------|-------|
| `regexReplaceAll` | `(regex, s, repl)` | `repl` may reference groups (`$1`) |
| `regexReplaceAllLiteral` | `(regex, s, repl)` | No group expansion |
| `count` | `(regex, s) int` | Number of matches |

```logql
| line_format `{{ regexReplaceAll "[0-9]+" .path "«id»" }}`
```

---

## Numbers

Integer forms: `add` `sub` `mul` `div` `mod` `max` `min`.
Float forms: `addf` `subf` `mulf` `divf` `modf` `maxf` `minf`.
Rounding: `ceil` `floor` `round(x, places)`.
Conversion: `int` `float64` `toFloat64`.

```logql
| json | line_format "{{ div .duration_ns 1000000 }}ms"
```

---

## Dates

| Function | Description |
|----------|-------------|
| `now` | Current time |
| `date` / `toDate` / `toDateInZone` | Format / parse with a Go layout |
| `unixEpoch` / `unixEpochMillis` / `unixEpochNanos` | Epoch from a `time.Time` |
| `unixToTime` | `time.Time` from an epoch string |

```logql
| line_format "{{ .ts | toDate \"2006-01-02T15:04:05Z\" | date \"15:04:05\" }}"
```

---

## Parsing helpers

| Function | Description |
|----------|-------------|
| `duration` / `duration_seconds` | Humanised duration (`"2h45m"`) → seconds as float |
| `bytes` | Number → readable string (`"83 MB"`) |
| `fromJson` | Decode a JSON string into a value you can index |

```logql
| logfmt | line_format "{{ (fromJson .payload).userId }}"
```
