---
id: monitor
title: Monitor alerts
sidebar_label: Monitor alerts
slug: /insights/alerting/monitor
---

# Monitor alerts

Two pages answer "what is happening" and "did anyone get told": **Active
alerts** and **Settings**.

## Active alerts

Open **Insights → Alerting → Active alerts**.

Everything firing right now, grouped by the contact point it routes to. The
grouping is the useful part: it shows the routing tree's decisions, so an alert
sitting under a contact point you did not expect is a routing problem you can
see rather than guess at.

Summary counts and a refresh control sit at the top. The authoritative state
for any single alert is the chip on its row.

### Filter

| Control | Use |
|---------|-----|
| Search | Match on an alert name or a label, for example `cluster=us-east-1` |
| State | All, Firing, Silenced, Inhibited |
| Receiver | Narrow to one contact point |

### Read a row

Each row carries a severity dot, the alert name, its state, the summary
annotation and how long it has been active. Open a row for the full label set.

| Chip | Meaning |
|------|---------|
| Firing | Notifying normally |
| Suppressed | A silence or an inhibition rule is holding the notification back |

### Act on a row

**Silence** opens a new silence with matchers already built from that alert's
labels. See [Silences](/insights/alerting/suppress).

## Settings

Open **Insights → Alerting → Settings**.

### Delivery attempts

The recent notification deliveries, with what happened to each one. This is the
page that answers "did that page actually go out".

| Status | Meaning |
|--------|---------|
| Sent | Delivered to the contact point |
| Failed | The contact point rejected it or could not be reached. The error is on the row |
| Pending | Waiting for group wait or group interval to elapse |
| Suppressed | The repeat interval has not elapsed, so this is a repeat that was held |
| Muted | A mute timing on the policy is active |
| Skipped | Nothing to deliver to, most often a contact point with no integrations |

A row here for every notification you expected, all reading Sent, means the
problem is downstream in Slack or the mail server. No row at all means the
problem is in routing.

### Configuration history

Every applied alerting configuration, newest first, with the receiver it routed
to and how many contact points it had.

**Restore** puts a previous configuration back. Use it when a routing edit
broke notifications and you would rather roll back than debug.

Restoring replaces the current routing tree, contact points, templates, mute
timings and inhibition rules with the ones in that entry. Anything created
since is gone. Alert rules and silences are separate and are left alone.

### Alertmanager status

Version, cluster status, uptime and peer count. Worth a glance when
notifications stop across the board rather than for one rule.

## Rule state

The alert rule list carries each rule's current state. See
[Alert rules](/insights/alerting/alert-rules) for what the chips mean.

## History retention

Alert state changes and delivery records are kept for 30 days.

## Permissions

| Action | Role |
|--------|------|
| View active alerts, delivery attempts, history and status | Member |
| Silence an alert | Editor |
| Restore a configuration | Editor |

## Next

[Notifications are not arriving](/insights/alerting/troubleshooting) walks the
delivery path from rule to inbox.
