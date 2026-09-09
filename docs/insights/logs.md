---
id: logs
title: Logs in Insights
sidebar_label: Logs
slug: /insights/logs
---

# Logs in Insights

Pick a stream by label, then narrow it until the lines that matter are on
screen.

Open **Insights → Logs**.

## Narrow the stream

Start from a label, usually `service_name` or `namespace`. The filter bar reads
the label keys and values that exist in your data, so you are choosing from what
is actually there.

Three things to narrow with:

**Labels.** Indexed at write time. Filtering on a label is the cheapest cut you
can make, so make it first.

**Detected fields.** Parsed out of the line itself. Insights lists the fields it
found along with how often each value occurs, which is how you find the one
`user_id` responsible for a spike.

**Patterns.** Lines grouped by shape, with the variable parts collapsed. A
thousand lines usually reduce to a handful of patterns, and excluding the noisy
one clears the view faster than any text search.

## Read the volume first

The volume panel above the list is a stacked bar chart by log level, drawn from
`detected_level`. Levels keep the same colour and the same stack order
everywhere, so a red band appearing at 14:32 is legible before you read a single
line.

Click and drag on it to zoom the time range.

## Work through the lines

The options rail on the right controls how the list reads:

| Control | What it does |
|---------|--------------|
| Newest first | Flip the sort |
| Filter levels | Show only the levels you tick |
| Deduplication | Collapse repeats, see below |
| Timestamps | Show or hide the timestamp column |
| Wrap lines | Soft-wrap long lines instead of scrolling sideways |
| Escape newlines | Render `\n` inside a line as a real break |
| Small font size | Fit more lines on screen |
| Download logs | Save the current lines as `.txt`, `.json` or `.csv` |

`Cmd+F` (`Ctrl+F` on Linux and Windows) opens search inside the panel rather
than the browser's find bar. Escape closes it.

### De-duplication

Four strategies, applied to consecutive lines:

| Strategy | Collapses |
|----------|-----------|
| None | Nothing |
| Exact | Lines that are byte-for-byte identical |
| Numbers | Lines that are identical once numbers are ignored |
| Signature | Lines with the same punctuation-only signature |

Each surviving line shows how many duplicates it absorbed. **Numbers** is the
one to reach for on retry loops, where only a counter or a duration changes.

## Open the trace

Click a line to expand it. The detail view lists every label and detected field
on that line, and each is one click from being added to the filter.

If the line carries a `trace_id`, the detail view links to that trace in
[Traces](/insights/traces). This is the fastest route from a logged error to the
request that caused it.

## What to do with a result

**Add to dashboard** writes the current query into a panel.

**Create alert** opens the rule editor with the LogQL expression filled in.

**Share** copies a link that reproduces the view, filters and focused line
included.

## The same data over HTTP

This page queries the Loki-compatible endpoint. See
[Log query API overview](/log-query/overview) for LogQL over HTTP.
