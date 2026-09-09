---
id: ai-uc-trace-id
title: "Reconstruct a bug from a trace id"
sidebar_label: "Reconstruct a bug"
slug: /ai/use-cases/trace-id
---

# Reconstruct a bug from a trace id

> Customer says checkout failed at 09:41 and support pasted a trace id into the ticket. Nobody knows which service broke.

## Prerequisites

- A connected client with `traces:read` and `logs:read`. See [Connect a client](/ai/connect).
- A trace id, from a support ticket, an error page or a log line.

## Step 1: Get the request path

Ask:

```text
Show me trace 4bf92f3577b34da6a3ce929d0e0e4736 in production.
```

What comes back:

```text
GET /api/checkout
4bf92f3577b34da6a3ce929d0e0e4736  2026-09-09T09:41:02Z  842.11ms
9 spans, 2 failed
services: checkout (4), payments (3), postgres (2)

  GET /api/checkout  842.11ms  +0µs
  checkout
    POST /payments/authorize  611.24ms  +38.5ms
    payments
!     INSERT public.payment_attempts  520.88ms  +102.3ms
      postgres
      canceling statement due to statement timeout
      db.system="postgresql", db.name="payments"

Open in xscaler: https://portal.xscalerlabs.com/acme/insight/explore?...
```

The `!` marks a span whose status is an error. A large trace is summarised rather than truncated: every failed span is kept whatever the budget, then the slowest, then the parents that put them in context, so the reason you are reading survives the reduction.

## Step 2: Find the logs for the span that failed

Ask:

```text
What logs describe that failing postgres span?
```

The agent calls `correlate_span` rather than guessing a selector:

```text
postgres: INSERT public.payment_attempts
span 5f2a1c9d4e7b in trace 4bf92f3577b34da6a3ce929d0e0e4736
2026-09-09T09:41:02Z  520.88ms
this span failed: canceling statement due to statement timeout
db.name="payments", db.system="postgresql"

Run these over 2026-09-09T09:40:57Z to 2026-09-09T09:41:08Z, which is the
span's own window widened by this environment's configured shifts.

Logs, for query_logs:
  {service_name="payments"} | trace_id="4bf92f3577b34da6a3ce929d0e0e4736"
```

This matters more than it looks. The selector comes from the environment's own trace-to-logs configuration, so it uses the label your telemetry is actually keyed on. An agent writing `{service="payments"}` by hand against data labelled `service_name` gets an empty result and reports that there were no logs.

## Step 3: Read the lines

Ask:

```text
Run that log query.
```

```text
{service_name="payments"} | trace_id="4bf92f3577b34da6a3ce929d0e0e4736"
2026-09-09T09:40:57Z to 2026-09-09T09:41:08Z, newest first
every line: service_name="payments"
4 lines

2026-09-09T09:41:02.741Z  statement timeout after 500ms, rolling back
2026-09-09T09:41:02.740Z  lock wait on payment_attempts_pkey exceeded
2026-09-09T09:41:02.219Z  BEGIN authorize tenant=acme amount=4210
2026-09-09T09:40:58.004Z  pool at 20/20 connections, queueing
```

The last line is the answer: the pool was exhausted before the statement ever ran.

## Refine the investigation

- "Was anything else failing in that minute?"
- "How many traces hit that same statement timeout in the last hour?"
- "What does the connection pool metric look like around 09:41?"
- "Show me a successful checkout trace from the same minute so I can compare."

## Which tool did what

| Step | Tool | What it does |
|---|---|---|
| 1 | `get_trace` | Fetches the trace and returns the spans as a tree, keeping every failed span |
| 2 | `correlate_span` | Reads the environment's trace-to-logs configuration and builds the selector and the window |
| 3 | `query_logs` | Runs the selector and returns the lines |

## Next steps

- [Find where latency is going](/ai/use-cases/latency)
- [Find when a problem started](/ai/use-cases/when-it-started)
