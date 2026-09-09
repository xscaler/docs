---
id: ai-uc-when-it-started
title: "Find when a problem started"
sidebar_label: "Find when it started"
slug: /ai/use-cases/when-it-started
---

# Find when a problem started

> Errors are everywhere now. The question in the incident channel is when this began, because that decides which change caused it.

## Prerequisites

- A connected client with `logs:read`. See [Connect a client](/ai/connect).

## The trap this avoids

Ask for the errors in a window and you get the newest lines first. If the window holds more lines than the limit, the earliest line you were handed is not the earliest line there is, and an agent that reads it as the beginning reports a start time that is simply the bottom of the page.

`query_logs` takes `order=oldest` for exactly this. The tool's own description tells the model so, but naming the direction in your prompt is what makes it certain.

## Step 1: Bound the window with a count

Ask:

```text
Count the checkout error lines per minute in production over the last 6 hours.
```

```text
sum(count_over_time({service_name="checkout"} |= "error" [1m]))
2026-09-09T04:31:00Z to 2026-09-09T10:31:00Z
This query aggregates, so it answers with a series rather than lines.
1 series

{service_name="checkout"}
  ▁▁▁▁▁▁▁▁▁▁▁▁▁▁▂▅███▇███▇███▇███
  min 0  max 214  mean 61.4  p95 198  last 187
```

An aggregating expression comes back as a series rather than lines, which is what makes this cheap. The sparkline puts the onset a little over halfway through a six-hour window, so the next question has a much smaller window to read.

## Step 2: Read the oldest lines in that window

Ask:

```text
Show me the oldest checkout error lines between 07:30 and 08:00, oldest first.
```

```text
{service_name="checkout"} |= "error"
2026-09-09T07:30:00Z to 2026-09-09T08:00:00Z, oldest first
every line: service_name="checkout"
50 lines

2026-09-09T07:41:19.882Z  error: catalog returned 503, giving up after 3 retries
2026-09-09T07:41:19.204Z  warn: catalog retry 3 of 3
2026-09-09T07:41:18.771Z  warn: catalog retry 2 of 3

What was left out:
- asked for 50 lines and the window holds more, so the oldest 50 were returned
```

The first line is 07:41:19. Because the read was oldest first, that is the first occurrence in the window and not the bottom of a page of recent ones.

## Step 3: Cross-check the cause

Ask:

```text
What was catalog doing at 07:41?
```

Now the question has a timestamp, so it can be pointed at another service, at a deployment, or at the metric for whatever catalog depends on.

## Refine the investigation

- "Was there an error before 07:41 anywhere else in this environment?"
- "Show me the same count for catalog, so I can see which one moved first."
- "What is the longest window I can ask about for logs?"

## Under the hood

| Step | Tool | What it does |
|---|---|---|
| 1 | `query_logs` | An aggregating LogQL expression returns a series, so a wide window costs one small answer |
| 2 | `query_logs` with `order=oldest` | Reads from the older end of the window, which is the only way to find a first occurrence |

Logs are capped at a 7 day window. A question wider than that is better asked as a metric, which is capped at 31 days. See [Limits](/ai/limits).

## Next steps

- [Reconstruct a bug from a trace id](/ai/use-cases/trace-id)
- [Check what changed after a deploy](/ai/use-cases/after-a-deploy)
