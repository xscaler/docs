---
id: pagerduty
title: PagerDuty
sidebar_label: PagerDuty
slug: /insights/alerting/contact-points/pagerduty
---

# PagerDuty

xScaler uses the PagerDuty Events API v2. Firing alerts trigger an incident,
and resolved alerts resolve it.

## What you need

An integration key from the PagerDuty service you want to page.

1. In PagerDuty, open **Services → Service Directory** and pick the service, or
   create one.
2. Open its **Integrations** tab and **Add another integration**.
3. Choose **Events API v2**.
4. Copy the **Integration Key**, a 32-character string.

Create the integration on the service that owns the escalation policy you want.
The key decides who gets paged, so a key from the wrong service pages the wrong
team no matter how your routing is set up.

## Create the contact point

**Insights → Alerting → Contact points → New contact point**, type
**PagerDuty**.

| Field | Notes |
|-------|-------|
| Integration key | The key you copied |
| Severity | `critical`, `error`, `warning` or `info`. Defaults to `critical` |
| Class | Free text describing the kind of problem, for example `latency` |
| Component | The part that failed, for example `checkout-api` |
| Group | A logical grouping, for example `prod-eu` |
| Summary | The incident title. Takes a template |

Then **Test**.

## Grouping and deduplication

xScaler sends one PagerDuty event per notification group, using the group's
identity as the deduplication key. PagerDuty therefore keeps one incident open
per group and updates it rather than opening a new one each time.

This makes your **Group by** setting the thing that decides how many incidents
appear:

| Group by | PagerDuty sees |
|----------|----------------|
| `alertname` | One incident per rule, however many hosts are affected |
| `alertname`, `instance` | One incident per host |

Grouping by `alertname` alone is usually right for paging. One incident, one
responder, one timeline.

## Severity

The Severity field applies to every alert this contact point delivers. To page
at different severities, use two contact points and route to them on the alert's
`severity` label:

```
If severity = critical  → pagerduty-critical
If severity = warning   → pagerduty-warning
```

See [Notification policies](/insights/alerting/notification-policies).

## Resolving

When every alert in the group resolves, xScaler sends a resolve event and the
incident closes on its own. Nobody has to close it by hand.

## Common failures

| Delivery attempt says | Cause |
|-----------------------|-------|
| `400 Bad Request` | The severity is not one of the four allowed values |
| `202` but no incident | The key belongs to a service whose escalation policy sends nowhere, or the service is in maintenance |
| `no integrationKey setting` | The field is empty |
| Sent, nobody paged | Check the service's own event log in PagerDuty, and its escalation policy |

PagerDuty's service page has an **Alerts** log showing every event it received,
which settles whether the problem is xScaler or PagerDuty.
