---
id: alert-rules
title: Alert rules
sidebar_label: Alert rules
slug: /insights/alerting/alert-rules
---

# Alert rules

A rule is a query, a condition, and how long the condition has to hold. Open
**Insights → Alerting → Alert rules**.

## Start from a query you are already looking at

Run the query in [Metrics](/insights/metrics) or [Logs](/insights/logs), get
the result you want, then use **Create alert**. The editor opens with the
expression and the source already filled in, which saves retyping the
expression and getting it subtly wrong.

**Create alert** appears on metric and log queries. Trace queries do not have
it, because alert conditions are evaluated against metrics and logs.

## Create a rule from scratch

**New alert rule** opens a four-step form.

### 1. Define query and alert condition

Pick a source and write the query. Metrics sources take PromQL, log sources
take LogQL, and both editors have the same Builder and Code toggle as
Explore, with autocomplete over the last ten minutes of your data.

Below the query sits the condition, read as a sentence:

> WHEN `last` OF `A` IS ABOVE `0`

| Part | Options |
|------|---------|
| Reducer | `last`, `avg`, `min`, `max`, `sum`, `count` |
| Query | Any query in the rule, by its letter |
| Comparison | is above, is below, is equal to |
| Threshold | A number |

**Add query** adds a second query, lettered B, C and so on. The condition reads
one query at a time, picked by its letter, so switch the condition to the query
you want it to watch.

A rule with an empty query will not save. A rule whose condition names a query
that is not in the rule will not save either.

### 2. Set evaluation behaviour

| Field | What it does |
|-------|--------------|
| Folder | Groups rules in the list. Also becomes the `grafana_folder` label |
| Evaluation group | A name you choose for related rules. Rules in one group share an evaluation interval |
| Pending period | How long the condition must hold before the alert fires. Default `5m` |
| Evaluation interval | How often the rule runs. Default `1m` |

The pending period is the field that decides how noisy a rule is. A CPU rule
with a pending period of `0s` pages you about a compile job. The same rule at
`10m` pages you about a problem.

The two timing fields do different jobs. The evaluation interval is how often
the query runs, and the pending period is how long the result has to stay bad.
An interval of `1m` with a pending period of `5m` means the condition is
checked every minute and has to hold for five of them.

Shorter intervals notice faster and query more often. `1m` suits almost
everything. Go below it only for a rule where thirty seconds of detection time
is worth the query load.

### 3. Labels

Labels are how notification policies find this alert. New rules start with
`severity: warning`.

Set the labels your routing reads:

```
severity: critical
team: payments
```

Then route on them once, in [Notification policies](/insights/alerting/notification-policies),
and every future rule carrying `team: payments` is routed the day it is
written.

Labels can read from the firing series:

```
host: {{ $labels.instance }}
```

### 4. Annotations

Annotations are what the notification carries when a rule fires.

| Field | Use it for |
|-------|-----------|
| Summary | One line. What is wrong |
| Description | What it means and why it matters |
| Runbook URL | The page that says what to do |

Leave the summary blank and the rule's name is used instead.

Annotations can read the firing series and its value:

```
Summary:     Checkout latency is high on {{ $labels.instance }}
Description: p95 is {{ $value }}ms, over the 400ms budget. Check the
             database connection pool first.
```

`{{ $labels.<name> }}` is any label on the series that fired.
`{{ $value }}` is the number the condition compared.

:::tip[Write the runbook URL first]
The runbook link is the difference between an alert somebody acts on and an
alert somebody mutes. A page with three commands on it counts as a runbook.
:::

## Check the rule before you save it

**Preview** runs the rule against current data and reports how many series the
condition matches right now.

Read the number it reports, not only that it ran:

| Preview says | Meaning |
|--------------|---------|
| 0 series | The condition is false right now. Expected for a healthy system, and worth double-checking against an incident you remember |
| 1 series | One alert |
| 400 series | 400 alerts. Group them, or narrow the query, before you save |

A query that cannot run is reported here rather than as a rule that quietly
never fires.

## Folders

**Manage folders** creates, renames and deletes folders. A folder has to be
empty before it can be deleted.

Rules whose folder is missing appear under **Unfiled**.

## Pause a rule

The pause control on each row stops the rule evaluating and keeps everything
else about it. Resuming puts it back as it was. Use it instead of deleting a
rule you might want next week.

A paused rule notifies about nothing, and its state reads Paused.

## Read the rule list

Each row carries the rule's state, its name, the summary annotation, its
labels, its evaluation group and its pending period.

| Chip | Meaning |
|------|---------|
| Firing | At least one instance has held past the pending period |
| Pending | The condition is true and still inside the pending period |
| Normal | The condition is false |
| Paused | Evaluation is stopped |

Rules in **No data** or **Error** read as Normal in the list, because they are
not firing. See [How alerting works](/insights/alerting/how-it-works) for what
those two states do.

## Change what happens on no data or an error

By default a rule with no data notifies nobody, and a rule whose query fails
notifies nobody while holding on to anything it was already firing. To be told
instead, alert on the absence directly:

```promql
absent(up{job="checkout"})
```

That gives you a rule with a name and a runbook that actually fires when the
metric stops arriving.

## Delete a rule

Deleting is permanent and takes a confirmation naming the rule. Pause instead
if you are unsure.

## Permissions

| Action | Role |
|--------|------|
| View rules, open a rule read-only, run Preview | Member |
| Create, edit, pause and delete rules | Editor |

## Next

- [Contact points](/insights/alerting/contact-points) so the alert has
  somewhere to go.
- [Best practices](/insights/alerting/best-practices) for what to alert on.
