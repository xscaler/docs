---
id: notification-policies
title: Notification policies
sidebar_label: Notification policies
slug: /insights/alerting/notification-policies
---

# Notification policies

A notification policy reads an alert's labels and hands the alert to a contact
point. Open **Insights → Alerting → Notification policies**.

## The default policy

Every organization has one policy at the root of the tree. It has no matchers,
so every alert reaches it, and it carries the grouping and timing that the rest
of the tree inherits.

A new organization routes to a placeholder contact point with no integrations,
which delivers nowhere. The page says so in a banner and offers a picker to
re-point it. Do that first.

| Warning | What to do |
|---------|-----------|
| The default policy delivers to a contact point that does not exist | Pick a real one from the banner |
| The default policy delivers to a contact point with no integrations | Add an integration to it, or point the policy somewhere else |

## Add a route

**+** on any policy adds a nested one under it. A nested policy has matchers,
and alerts that match go to its contact point instead of the parent's.

| Field | What it does |
|-------|--------------|
| Matchers | Label conditions the alert has to satisfy |
| Deliver to contact point | Where matching alerts go. `(inherit)` keeps the parent's |
| Continue matching subsequent sibling policies | Keep going after this one matches |
| Mute timings | Recurring windows where this policy stays quiet |

### Matchers

| Operator | Meaning |
|----------|---------|
| `=` | Equals |
| `!=` | Does not equal |
| `=~` | Matches this regular expression |
| `!~` | Does not match this regular expression |

Matchers on one policy are combined with AND. All of them have to hold.

The **Form** and **Text** toggle switches between one row per matcher and
free text like `severity = critical`.

### How a match is chosen

xScaler walks the tree from the top. Within a level, the first policy that
matches takes the alert and the walk stops there, unless that policy has
**Continue matching subsequent sibling policies** turned on.

Put the specific policies above the general ones. A policy matching
`severity =~ .*` at the top of a level catches everything below it.

Use **Continue** when an alert genuinely needs two destinations, for example a
critical database alert that pages on-call and posts to the database team's
channel.

## Grouping

Grouping decides how many messages you get. Set it on the default policy under
**Group by**.

| Group by | Result |
|----------|--------|
| `alertname` | One message per rule. Forty hosts firing one rule is one message listing forty |
| `alertname`, `cluster` | One message per rule per cluster |
| `...` | One message per alert. Every label is part of the group |
| Nothing | One message for everything firing |

Group by the label that decides who acts. Grouping a paging alert by
`alertname` alone means one page for an incident spanning three clusters, and
the first responder has to read the message to work out which.

## Timing

| Field | Default | What it does |
|-------|---------|--------------|
| Group wait | 30s | How long to hold a new group before the first message, so alerts arriving together arrive in one message |
| Group interval | 5m | How long to wait before sending an update when the group's contents change |
| Repeat interval | 4h | How often to re-send a message about a group that is still firing |

Nested policies inherit these from their parent. Set a different repeat
interval on a nested policy to page more often for one class of alert.

Longer group wait means fewer, fuller messages and a slower first alert.
30 seconds suits most paging. A chat channel for warnings can sit at a few
minutes.

## Mute timings on a policy

Attach a mute timing to any policy to keep it quiet during recurring windows.
See [Silences, mute timings and inhibition rules](/insights/alerting/suppress).

A mute timing applies to the policy you attach it to. Nested policies do not
inherit it, so attach it to each policy that needs it.

## Save changes

Edits to the tree are held until you use **Save changes** in the banner at the
top. **Discard** throws them away.

## Reset to default

**Reset to default** removes every policy in the tree and restores the single
default route. It asks you to type `Reset` because there is no undo for a
routing tree.

## A worked example

Three teams, two severities, one paging integration:

```
Default policy
  Deliver to: warnings-slack
  Group by: alertname, cluster
  Wait 30s, interval 5m, repeat 4h

  If severity = critical
    Deliver to: oncall-pagerduty
    Repeat interval: 30m

    If team = payments
      Deliver to: payments-oncall

  If team = data
    Deliver to: data-slack
```

A critical payments alert reaches `payments-oncall`. A critical alert from any
other team reaches `oncall-pagerduty`. A data team warning reaches
`data-slack`. Everything else reaches `warnings-slack`.

The rules themselves carry `severity` and `team` as labels, and nothing in this
tree names a rule. Adding a rule to the payments team is one label.

## Permissions

| Action | Role |
|--------|------|
| View the tree | Member |
| Edit, add, reset | Editor |

## Next

- [Silences, mute timings and inhibition rules](/insights/alerting/suppress) to
  cut noise.
- [Notifications are not arriving](/insights/alerting/troubleshooting) when
  routing looks right and nothing lands.
