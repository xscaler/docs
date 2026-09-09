---
id: best-practices
title: Best practices
sidebar_label: Best practices
slug: /insights/alerting/best-practices
---

# Best practices

## Alert on symptoms people feel

A rule that fires on "checkout p95 is over 400ms" is worth waking somebody for.
A rule that fires on "CPU is over 80%" is worth a dashboard.

Start from the four questions a user would ask:

| Question | Alert on |
|----------|---------|
| Is it up? | Availability, or the absence of a heartbeat |
| Is it fast? | Latency at p95 or p99, against a number you would defend |
| Is it working? | Error rate as a share of traffic |
| Is it full? | Saturation, with enough headroom to act |

Resource alerts earn their place when they predict a symptom: a disk filling at
a rate that hits 100% inside four hours is worth a page, and a disk at 85% and
flat is not.

## One rule, many dimensions

Write one rule with a `by` clause rather than one rule per host:

```promql
100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)
```

One rule to maintain, one alert per host, and the host name arrives on the
alert. Adding hosts needs no edit.

Group by the label that tells the responder where to look.

## Route on labels, never on rule names

Put `team` and `severity` on every rule, then build the routing tree once
against those labels. A new rule carrying `team=payments` reaches the payments
on-call the day it is written, with nobody touching the tree.

A tree matching rule names has to be edited every time a rule is added, and the
edit is the step everybody forgets.

## Set the pending period deliberately

The pending period is the single biggest lever on noise.

| Signal | Pending period |
|--------|---------------|
| Availability check for a paged service | 1m to 2m |
| Latency or error rate | 5m to 10m |
| Saturation trends | 15m or more |
| Anything derived from a batch job | Longer than the batch interval |

A rule that flaps is a rule with too short a pending period, or a threshold sat
right on the normal operating range.

## Write the runbook link first

An alert with a runbook URL is one a responder can act on without being
expected to improvise. An alert without one gets muted. If there is no runbook,
three commands in a wiki page counts.

Put the first thing to check in the description:

```
Description: p95 is {{ $value }}ms against a 400ms budget.
             Check the database connection pool first, then upstream latency.
```

## Two severities, and mean them

`critical` pages a person. `warning` reaches a channel somebody reads during
the day. A third level means nobody knows which ones matter.

Then add one inhibition rule so criticals hide their own warnings:

| Field | Value |
|-------|-------|
| Source matchers | `severity = critical` |
| Target matchers | `severity = warning` |
| Equal labels | `alertname`, `cluster` |

## Alert on absence explicitly

A threshold rule cannot fire on a metric that stopped arriving, because there
is nothing to compare. Write the absence as its own rule:

```promql
absent(up{job="checkout"})
```

Give it a name and a runbook of its own. "Checkout is not reporting" is a
different problem from "checkout is slow", and the runbooks differ.

## Test the contact point before you depend on it

Use **Test** on every contact point when you create it, and again after
rotating a credential. A webhook with a typo fails silently, and the day you
find out is the day you needed it.

## Keep silences narrow and short

Silence the alert, not the severity. `alertname = DiskFull, instance = db-3`
for two hours beats `severity = critical` for a day. Put the incident number in
the comment.

For anything recurring, use a mute timing instead. A silence somebody has to
remember to set is a silence somebody forgets.

## Review what fires

Once a month, look at the delivery history and ask two questions about each
recurring alert:

- Did anybody do anything about it? If not, it belongs on a dashboard.
- Did it arrive before somebody noticed the problem another way? If not, the
  threshold or the pending period is wrong.

Deleting a rule nobody acts on makes the remaining alerts mean something.

## Related

- [How alerting works](/insights/alerting/how-it-works)
- [Notifications are not arriving](/insights/alerting/troubleshooting)
