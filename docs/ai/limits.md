---
id: ai-limits
title: Limits
sidebar_label: Limits
slug: /ai/limits
---

# Limits

Nothing here is metered. The limits apply to the shape of one answer and the rate of calls.

## Time ranges

| Signal | Longest window |
|---|---|
| Metrics | 31 days |
| Logs | 7 days |
| Traces | 24 hours |

A longer window comes back clamped, and the answer says so. Nobody reads 30 days of log lines, and the useful form of that question is a metric over the same window.
## One answer

| | Default | Most a caller may ask for |
|---|---|---|
| Series per query | 8 | |
| Points per series | 120 | |
| Log lines | 50 | 500 |
| Bytes per log line | 2 KiB | |
| Traces per search | 20 | 100 |
| Spans per trace | 60 | |
| Metric, label or attribute names per listing | 200 | 2000 |
| Panels summarised from a dashboard | 40 | 200 |
| Text block | 32 KiB | |
| Structured block | 128 KiB | |

## Rate and time

| | Limit |
|---|---|
| One tool call | 90 seconds |
| Calls running at once | 8 per server instance |
| Per connection | about one cheap call a second sustained, with a burst of 30 |
| OAuth endpoints, per address | 5 requests a second, burst of 20 |
| Client registrations, per address | 5 an hour |

Calls cost different amounts against that burst: listing environments costs 1, most reads cost 2, a query or a dashboard write costs 3, and creating an alert rule costs 4.
