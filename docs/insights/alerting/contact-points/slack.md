---
id: slack
title: Slack
sidebar_label: Slack
slug: /insights/alerting/contact-points/slack
---

# Slack

Two ways to reach Slack. Pick one.

| Method | Use it when |
|--------|------------|
| Incoming webhook | You want one channel and the least setup. Recommended |
| Bot token | You want one contact point that can post to different channels, or your workspace does not allow webhooks |

## Incoming webhook

### 1. Create the webhook in Slack

1. Go to [api.slack.com/apps](https://api.slack.com/apps) and **Create New App
   → From scratch**. Name it something recognisable, such as `xScaler Alerts`,
   and pick your workspace.
2. Open **Incoming Webhooks** and turn it on.
3. **Add New Webhook to Workspace**, choose the channel, and **Allow**.
4. Copy the webhook URL. It is on `hooks.slack.com`, with three path segments
   after `/services/`: a team ID, a webhook ID and a secret.

### 2. Create the contact point

**Insights → Alerting → Contact points → New contact point**, type **Slack**.

| Field | Value |
|-------|-------|
| Webhook URL | The URL you copied |
| Recipient | Leave blank |

Then **Test**.

:::warning[A webhook URL is bound to one channel]
Slack ties the webhook to the channel you picked when you created it. The
Recipient field cannot move messages to another channel over a webhook. For a
second channel, create a second webhook, or use a bot token.
:::

## Bot token

### 1. Create the app and scopes

1. Create an app at [api.slack.com/apps](https://api.slack.com/apps) as above.
2. Open **OAuth & Permissions**, and under **Bot Token Scopes** add
   `chat:write`. Add `chat:write.public` as well if you want it to post in
   public channels it has not been invited to.
3. **Install to Workspace**, then copy the **Bot User OAuth Token**. It starts
   with `xoxb-`.
4. In Slack, invite the bot to the channel: `/invite @xScaler Alerts`.

### 2. Create the contact point

| Field | Value |
|-------|-------|
| Recipient | `#alerts`, or a user ID for a direct message |
| API token | The `xoxb-` token |
| Webhook URL | Leave blank |

## Optional fields

| Field | What it does |
|-------|--------------|
| Username | Overrides the display name on the message |
| Icon emoji | The avatar, for example `:rotating_light:` |
| Title | Replaces the message title. Takes a template |
| Message body | Replaces the message text. Takes a template |
| Mention users | Slack user IDs to mention, comma-separated, for example `U012AB3CD` |

Mention users takes IDs rather than handles. Find one in Slack under
**Profile → More → Copy member ID**.

## What arrives

One message per notification group, with a coloured attachment: red while
firing, green when resolved. The title is the first alert's summary annotation,
and the body lists each alert in the group with its labels.

To change the wording, write a template and put it in **Title** or
**Message body**. See [Notification templates](/insights/alerting/templates).

## Common failures

| Delivery attempt says | Cause |
|-----------------------|-------|
| `404` | The webhook was revoked, or the app was removed from the workspace. Create a new webhook |
| `invalid_auth` | The bot token is wrong or was rotated |
| `channel_not_found` | The bot is not in that channel. Invite it, or add `chat:write.public` |
| `no webhook URL or token setting` | Neither field is filled in |
| `no recipient channel for token delivery` | Token mode needs a Recipient |
| Sent, nothing in Slack | The webhook points at a different channel than you think. Check it in Slack under the app's Incoming Webhooks |

Use **Test** after any change. It posts a real message to the channel.
