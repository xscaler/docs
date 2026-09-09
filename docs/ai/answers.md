---
id: ai-answers
title: Reading an answer
sidebar_label: Reading an answer
slug: /ai/answers
---

# Reading an answer

Every answer has four parts: the prose to read, the structured data the numbers came from, a list of anything it left out, and a link into the portal.

```text
sum by (service_name) (rate(http_server_request_duration_count[5m]))
2026-09-09T09:04:11Z to 2026-09-09T10:04:11Z, step 30s
8 of 214 matching series

{service_name="checkout"}
  ▄▄▃▃▄▃▃▃▃▄▃▄▄▃▃▃▅▇█▇▆▆▅▄▅▅▅▅▄▃▃▃
  min 7.342  max 7.783  mean 7.516  p95 7.704  last 7.425

...

What was left out:
- 214 series matched and the 8 with the highest peak values were returned
  Instead: narrow the query with a label matcher, or wrap it in topk() to choose which ones

Open in xscaler: https://portal.xscalerlabs.com/acme/insight/explore?ds=xmetrics-...&expr=...&tenant=...
```

Each series' statistics are exact. The minimum, maximum, mean, p95 and last come from every point in that series, computed before the points were reduced, so they describe all of the data and not just the points listed.

The reduction keeps the minimum and maximum of every bucket, so a spike cannot be dropped. The bucket that holds it reports it as that bucket's maximum.

Every reduction is listed under **What was left out**, and the answer sets `confidence` to `reduced`. An answer with nothing reduced reports `exact`.

| `confidence` | Meaning |
|---|---|
| `exact` | Nothing was reduced. Everything queried is in the answer |
| `reduced` | Something was capped, clamped, downsampled or truncated, and the notices say what |
| `unverified` | The answer may not mean what it looks like, and the notice says why |

An empty result comes back as a success, carrying a status and a diagnostic. A query that ran against an environment with no data reads as "no data", so an agent moves on instead of retrying.

A failed query leads the answer. When one query in a batch fails, that is the first thing the text says, because an agent that only read the absence would mistake it for an absence of data.

[What the caps are →](/ai/limits)
