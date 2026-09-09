---
id: suppress
title: Silences, mute timings and inhibition rules
sidebar_label: Suppressing alerts
slug: /insights/alerting/suppress
---

# Silences, mute timings and inhibition rules

Three ways to stop notifications, for three different reasons.

| Use | When |
|-----|------|
| Silence | You know about this one, right now, for a few hours |
| Mute timing | Every Saturday night, every month end, every deploy window |
| Inhibition rule | The cause is already paging somebody, so hide the symptoms |

None of them stop a rule evaluating. The alert still fires and still appears in
Active alerts, marked **Suppressed**, and only the notification is held back.
To stop a rule evaluating, pause it. See
[Alert rules](/insights/alerting/alert-rules).

## Silences

Open **Insights → Alerting → Silences**.

A silence matches alert labels and holds their notifications for a fixed
window.

**New silence** takes:

| Field | Notes |
|-------|-------|
| Matchers | Label conditions. All of them have to hold |
| Duration | 1h, 2h, 6h, 12h or 1d. Default 2h |
| Comment | Required. Say why |

The panel beside the form counts the matchers you have filled in, so you can
see the silence has something to match on before you save it.

### Silence from an alert

The quickest route is from the alert. Open a row in
[Active alerts](/insights/alerting/monitor), use **Silence**, and the silence
opens with matchers already built from that alert's labels.

### States

| State | Meaning |
|-------|---------|
| Active | Holding notifications now |
| Scheduled | Starts later |
| Expired | Over. Kept for the record |

### Expire a silence

**Expire now** ends a silence immediately and resumes notifications for the
alerts it was holding. Expiring cannot be undone. Create a new silence if you
need the quiet back.

### Write a comment somebody can act on

The comment is the only record of why the noise stopped. `INC-4412, db failover
scheduled 02:00-04:00` tells the next person what to do. `testing` does not.

:::warning[Silences outlive incidents]
A 1d silence on `severity = critical` set during an incident is still holding
tomorrow's real alert. Silence the narrowest thing that works, for the shortest
time that works.
:::

## Mute timings

Open **Insights → Alerting → Mute timings**.

A mute timing is a named set of recurring windows. It suppresses nothing on its
own. Attach it to a notification policy, and that policy stays quiet during the
windows. See
[Notification policies](/insights/alerting/notification-policies).

**New mute timing** takes a name and one or more time intervals.

| Field | Example | Notes |
|-------|---------|-------|
| Days of week | Sat, Sun | Leave empty for every day |
| Start time, End time | `22:00`, `06:00` | 24-hour clock |
| Days of month | `1, 15, -1` | Negative counts back from the end of the month, so `-1` is the last day |
| Months | `january, 6:8` | Names or ranges |

**Add time interval** adds another window to the same timing, so one mute
timing can cover both weekends and weeknight hours.

The name is what a notification policy references, so name it after the
schedule: `weekends`, `month-end-close`, `nightly-batch`.

### An example

A `nightly-batch` timing covering 01:00 to 04:00 every day, attached to the
policy that routes `team = data` warnings, stops the batch window generating
pages while leaving critical alerts on their own policy untouched.

## Inhibition rules

Open **Insights → Alerting → Inhibition rules**.

An inhibition rule suppresses one class of alert while another is firing. This
is how one "cluster unreachable" alert arrives instead of a hundred "service
unreachable" alerts behind it.

**New inhibition rule** takes:

| Field | Meaning |
|-------|---------|
| Source matchers | The alert that triggers the muting |
| Target matchers | The alerts that get muted |
| Equal labels | Labels the source and target must share the same values for |

The equal labels are what keep this from being a blunt instrument. A critical
alert in `cluster=eu-west-1` should not mute warnings in `cluster=us-east-1`,
and listing `cluster` under equal labels is what stops it.

### The common one

| Field | Value |
|-------|-------|
| Source matchers | `severity = critical` |
| Target matchers | `severity = warning` |
| Equal labels | `alertname`, `cluster` |

A critical alert mutes the warning-level version of the same alert in the same
cluster.

### What can inhibit

Any alert firing in your organization can act as a source, including alerts
from other rules. Resolved alerts cannot inhibit anything, so notifications
resume as soon as the cause clears.

## Provisioned entries

Mute timings and inhibition rules marked **Provisioned** are managed outside
the portal and read as read-only.

## Permissions

| Action | Role |
|--------|------|
| View silences, mute timings and inhibition rules | Member |
| Create and expire silences, write mute timings | Editor |
| Write inhibition rules | Editor |

## Next

[Active alerts](/insights/alerting/monitor) shows what is suppressed and what
got through.
