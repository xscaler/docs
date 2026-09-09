---
id: ai-uc-alert-rule
title: "Create an alert rule and check it first"
sidebar_label: "Create an alert rule"
slug: /ai/use-cases/alert-rule
---

# Create an alert rule and check it first

> The queue backed up over the weekend and nobody knew until Monday. There should be an alert, and it should not page on every blip.

## Prerequisites

- A connected client with `alerts:write`. That needs the editor role or above. See [Capabilities](/ai/capabilities).

## Step 1: Check the condition before saving anything

Ask:

```text
If I alerted when the queue depth stays above 500 for ten minutes,
what would that do against today's data?
```

```text
Checked against the data as it is now.
The condition is true right now, on 3 series.
  queue="exports", service_name="worker"
  queue="thumbnails", service_name="worker"
  queue="webhooks", service_name="worker"
It fires once that has held for 10m. One check cannot say whether it will.
Evaluated at 2026-09-09T10:52:14Z. Nothing was saved.
```

This is the step worth doing. A condition that already holds on three queues is a rule that will notify about three things the moment it is saved. Better to learn that now than from the notification.

`check_alert_rule` takes the same description `create_alert_rule` takes and writes nothing, so it is free to run as many times as it takes to get the threshold right.

## Step 2: Narrow it and check again

Ask:

```text
Only the exports queue, and make it 2000 for fifteen minutes.
```

```text
Checked against the data as it is now.
The condition is false right now.
Evaluated at 2026-09-09T10:53:02Z. Nothing was saved.
```

## Step 3: Save it

Ask:

```text
Good. Create that rule, severity warning, and tell me what it will do.
```

```text
Created "Exports queue is backing up", reading production.
uid f4c81a0e2, in group default, folder 3b7d19ca
It fires when the last value of max by (queue) (queue_depth{queue="exports"})
is above 2000, held for 15m.

Checked before saving:
The condition is false right now.
It fires once that has held for 15m. One check cannot say whether it will.

Open in xscaler: https://portal.xscalerlabs.com/acme/insight/alerting/f4c81a0e2
```

**The model never writes the rule's query graph.** It supplies a query, how the values reduce to one number, and what that is compared against. The three-node evaluation graph is built server-side, which is what stops the failure this guards against: a rule saved with no query lists fine, reports normal, and never fires.

The query is also run once before the rule is saved. A query that cannot run is refused rather than stored as a rule that reports nothing forever. A condition that is quiet because nothing is wrong saves anyway, since that is the point of alerting.

## Step 4: Quieten one later

Ask:

```text
Pause the exports queue rule while we drain the backlog.
```

`pause_alert_rule` writes the paused flag and nothing else, so an edit somebody else is making to the same rule survives it. Pass `paused false` to resume, and the rule comes back exactly as it was. No tool deletes a rule.

## Refine the result

- "What else is firing in this organization right now?"
- "Who gets told when this rule fires?"
- "Show me the rule's condition and what it does on no data."

## Which tool did what

| Step | Tool | What it does |
|---|---|---|
| 1, 2 | `check_alert_rule` | Runs the condition against current data and saves nothing |
| 3 | `create_alert_rule` | Builds the evaluation graph, runs the query once, then saves |
| 4 | `pause_alert_rule` | Writes only the paused flag, so a concurrent edit survives |

## Next steps

- [Audit who gets told when something fires](/ai/use-cases/who-gets-told)
- [Build a dashboard by describing it](/ai/use-cases/dashboard)
