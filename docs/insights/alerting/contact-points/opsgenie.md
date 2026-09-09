---
id: opsgenie
title: Opsgenie
sidebar_label: Opsgenie
slug: /insights/alerting/contact-points/opsgenie
---

# Opsgenie

Firing alerts create an Opsgenie alert. Resolved alerts close it.

## What you need

An API key from an Opsgenie API integration.

1. In Opsgenie, open **Settings → Integrations** and **Add integration**.
2. Pick **API**.
3. Enable **Create and Update Access**.
4. Assign the team that should be notified.
5. Copy the **API Key**.

The team on the integration decides who is notified, so create it on the team
that owns the service.

## Create the contact point

**Insights → Alerting → Contact points → New contact point**, type
**Opsgenie**.

| Field | Notes |
|-------|-------|
| API key | The key you copied |
| Priority | `P1` to `P5` |
| Message | The alert title. Takes a template. Truncated at 130 characters |
| Tags | Comma-separated, for example `prod, db` |

Then **Test**.

:::info[EU accounts]
The integration posts to Opsgenie's default API host. An account on Opsgenie's
EU instance answers a correct key with an authentication error there, so check
which instance your account is on before you spend time on the key.
:::

## Deduplication and closing

xScaler uses the notification group's identity as the Opsgenie alias, so one
Opsgenie alert exists per group and repeats update it rather than piling up.

When the group resolves, xScaler closes the Opsgenie alert.

## Priority from a label

The Priority field applies to everything this contact point delivers. To set
priority per alert, put an `og_priority` label on the rule:

```
og_priority: P1
```

An `og_priority` label on any alert in the group sets that group's priority and
overrides the field.

## Common failures

| Delivery attempt says | Cause |
|-----------------------|-------|
| `401`, `Could not authenticate` | Wrong key, or an account on Opsgenie's EU instance |
| `403` | The integration does not have Create and Update Access |
| `422` | The message is empty. Set a Message or a summary annotation on the rule |
| `no apiKey setting` | The field is empty |
| Created, nobody notified | The integration is assigned to a team with no on-call schedule, or its notification rules filter it out |
