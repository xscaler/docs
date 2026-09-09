---
id: telegram
title: Telegram
sidebar_label: Telegram
slug: /insights/alerting/contact-points/telegram
---

# Telegram

Telegram delivery uses a bot and a chat ID. There is no webhook URL.

## 1. Create the bot

1. Message [@BotFather](https://t.me/botfather) in Telegram.
2. Send `/newbot`, then follow the prompts for a name and a username.
3. Copy the token it gives you. It is a numeric bot ID, a colon, then a long
   secret.

## 2. Get the chat ID

Add the bot to the group or channel that should receive alerts, then find the
chat's numeric ID.

**For a group:**

1. Add the bot to the group.
2. Send any message in the group.
3. Open `https://api.telegram.org/bot<your-token>/getUpdates` in a browser.
4. Read `result[].message.chat.id`. A group ID is negative, for example
   `-1001234567890`.

**For a channel:** add the bot as an administrator with permission to post, then
use the same `getUpdates` call after posting in the channel.

**For a direct message:** message the bot first, then read the positive `chat.id`
from `getUpdates`.

:::warning[The bot has to be messaged first]
Telegram will not let a bot start a conversation. Until somebody messages the
group or the bot, `getUpdates` is empty and delivery fails.
:::

## 3. Create the contact point

**Insights → Alerting → Contact points → New contact point**, type
**Telegram**.

| Field | Notes |
|-------|-------|
| Bot token | The token from BotFather |
| Chat ID | The numeric ID, including the leading minus for a group |
| Message | Optional. Takes a template |

Then **Test**.

## Common failures

| Delivery attempt says | Cause |
|-----------------------|-------|
| `401 Unauthorized` | The token is wrong, or the bot was deleted in BotFather |
| `400 chat not found` | The chat ID is wrong, or the leading minus was dropped from a group ID |
| `403 bot was kicked` | The bot was removed from the group |
| `403 bot is not a member` | Add the bot to the group or channel |
| `400 not enough rights` | In a channel, the bot needs administrator rights to post |
| `no bot token setting`, `no chat ID setting` | A field is empty |

## Notes

The token is the bot's full identity. Anyone holding it can read and post
everywhere the bot is a member, so use a bot dedicated to alerting.
