---
id: troubleshooting
title: Notifications are not arriving
sidebar_label: Notifications not arriving
slug: /insights/alerting/troubleshooting
---

# Notifications are not arriving

Work the path in order. Each step tells you whether to stop there or keep
going.

## 1. Is the rule firing?

**Insights → Alerting → Alert rules**.

| State | What it means |
|-------|--------------|
| Firing | The rule is doing its job. Go to step 2 |
| Pending | The condition is true and the pending period has not elapsed. Wait, or shorten the pending period |
| Normal | The condition is false. Go to step 1a |
| Paused | Somebody paused it. Resume it |

### 1a. Normal when you expected Firing

Open the rule and use **Preview**. It runs the condition against current data
and reports how many series match.

| Preview | Cause |
|---------|-------|
| Reports an error | The query cannot run. Fix the expression |
| 0 series | The condition is false, or inverted. Check the comparison and the threshold |
| Some series | The condition holds now and has not held long enough yet. Check the pending period |

A rule can also read Normal because its query returned nothing at all. A
metric that stopped being written does not fire a threshold rule. Alert on the
absence instead:

```promql
absent(up{job="checkout"})
```

## 2. Is the alert suppressed?

**Insights → Alerting → Active alerts**. Find the alert and read its chip.

**Suppressed** means a silence or an inhibition rule is holding it.

- Check **Silences** for an active silence whose matchers cover this alert. A
  1d silence set during last night's incident is the usual culprit.
- Check **Inhibition rules** for a rule whose target matchers cover this alert
  while a source alert is firing.

## 3. Does routing reach a real contact point?

**Insights → Alerting → Notification policies**.

A banner at the top of that page reports the two failures that stop everything:

| Banner | Fix |
|--------|-----|
| The default policy delivers to a contact point that does not exist | Pick a real one from the banner |
| The default policy delivers to a contact point with no integrations | Add an integration, or route somewhere else |

With no banner, walk the tree the way xScaler does: from the top, first match
per level wins unless the policy has **Continue** turned on. A broad matcher
sitting above a specific one catches the alert first.

Check the alert's labels against the matchers. **Active alerts** shows the full
label set when you open a row, and a `severity` of `warning` will not match
`severity = critical`.

## 4. Was a notification attempted?

**Insights → Alerting → Settings → Recent delivery attempts**.

| What you see | What it means |
|--------------|--------------|
| No row for this alert | Routing did not produce a delivery. Back to step 3 |
| Pending | Group wait or group interval has not elapsed. Default group wait is 30s |
| Suppressed | The repeat interval has not elapsed. The first message went out earlier; this is the repeat |
| Muted | A mute timing on the matching policy is active |
| Skipped | The contact point has no integrations, or it disables resolved notifications and everything in the group is resolved |
| Failed | The error is on the row. Go to step 5 |
| Sent | xScaler delivered it. Go to step 6 |

## 5. Delivery failed

Read the error on the row.

| Error mentions | Cause |
|----------------|-------|
| 401, 403, invalid token | The credential is wrong or was rotated. Re-enter it and use **Test** |
| 404 | The webhook URL or channel no longer exists |
| Timeout, connection refused | The destination is unreachable from the internet |
| A private or internal address | The destination resolves to a private, loopback or metadata address. Delivery there is refused. Put a publicly reachable relay in front of it |
| `re-enter the contact point secrets` | The save changed the type or destination and left the secret untouched. Re-enter it |
| Receiver type is not implemented | The contact point's integration type cannot be delivered by this platform |

**Test** on the contact point is the fastest confirmation that a fix worked. It
sends a real notification, so warn whoever is watching.

## 6. Sent, and still nobody saw it

The notification left xScaler. Look at the destination.

| Destination | Check |
|-------------|-------|
| Slack | The webhook's channel still exists, and the app was not removed from it |
| The bot posted to the wrong channel | A webhook URL is bound to one channel. The `recipient` field cannot override it |
| Email | Your mail server's logs. Alert email leaves from your SMTP server, so spam filtering and rate limits are yours |
| PagerDuty | The service's own event log, and whether the integration key belongs to the service you expected |
| Webhook | Your endpoint's access log |

## Too many notifications

The opposite problem, in the order worth trying:

| Symptom | Fix |
|---------|-----|
| One message per host | Group by `alertname` on the default policy, so one rule is one message |
| The same alert every few minutes | Raise the repeat interval on the policy |
| Flapping in and out | Raise the pending period on the rule |
| Warnings arriving behind criticals | An inhibition rule on `severity`, with `alertname` and `cluster` as equal labels |
| Noise during a known window | A mute timing on the policy |
| Noise from one thing, right now | A silence with narrow matchers |

See [Best practices](/insights/alerting/best-practices).

## A rule I did not write is firing

Check the rule's folder and labels in the rule list, then
[Activity log](/portal/activity) for who created it. Rules can also be created
through the xScaler MCP server by an AI assistant, and those writes are logged
the same way. See [Manage access](/ai/manage).

## Still stuck

Collect these before opening a ticket:

- The rule name and its current state.
- What **Preview** reports for it.
- The matching policy's contact point.
- The delivery attempt row, including the error text.

See [Support](/troubleshooting).
