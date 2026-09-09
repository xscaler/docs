---
id: discord
title: Discord
sidebar_label: Discord
slug: /insights/alerting/contact-points/discord
---

# Discord

## 1. Create the webhook

1. In Discord, open **Server Settings → Integrations → Webhooks**, or the
   channel's **Edit Channel → Integrations**.
2. **New Webhook**, name it, and pick the channel.
3. **Copy Webhook URL**. It is on `discord.com/api/webhooks/`, followed by a
   numeric webhook ID and a secret.

You need **Manage Webhooks** on the server to do this.

## 2. Create the contact point

**Insights → Alerting → Contact points → New contact point**, type
**Discord**.

| Field | Notes |
|-------|-------|
| Webhook URL | The URL you copied |
| Title | Optional. Takes a template |
| Avatar URL | Optional. An image URL to use as the sender's avatar |

Then **Test**.

## What arrives

An embed, red while firing and green when resolved, with the alert list in the
description and a link to the alert source where one is available.

Discord's own limits apply, so a long notification is trimmed: 256 characters
for the title, 4096 for the description. Grouping alerts keeps you well inside
that. See [Notification policies](/insights/alerting/notification-policies).

## Common failures

| Delivery attempt says | Cause |
|-----------------------|-------|
| `404 Unknown Webhook` | The webhook was deleted, or the channel was |
| `401` | The token part of the URL is wrong. Copy the whole URL again |
| `429` | Discord rate-limited the channel. Group more, or raise the repeat interval |
| `no webhook URL setting` | The URL field is empty |
| Sent, nothing in the channel | The webhook posts to the channel it was created on. Check which one that is in Discord |

:::warning[A webhook URL is a credential]
Anyone with the URL can post to that channel. Treat it like a token, and delete
the webhook in Discord if it leaks.
:::
