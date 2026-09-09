---
id: teams
title: Microsoft Teams
sidebar_label: Microsoft Teams
slug: /insights/alerting/contact-points/teams
---

# Microsoft Teams

Teams has two kinds of incoming webhook, and Microsoft is retiring the older
one. xScaler detects which kind you paste and sends the matching card format,
so both work.

| Kind | Recognised by | Card sent |
|------|--------------|-----------|
| Workflows (Power Automate) | `logic.azure.com`, `powerautomate`, `powerplatform.com`, or `/workflows/` in the URL | Adaptive Card |
| Classic Office 365 connector | Anything else | MessageCard |

New setups should use Workflows. Microsoft has announced the end of Office 365
connectors.

## Create a Workflows webhook

1. In Teams, right-click the channel and choose **Workflows**, or open the
   **Workflows** app.
2. Pick the template **Post to a channel when a webhook request is received**.
3. Confirm the connection, choose the team and channel, and **Add workflow**.
4. Copy the HTTP POST URL it gives you.

The URL is long and contains `logic.azure.com`. Copy all of it, including the
query string, which carries the signature.

## Create the contact point

**Insights → Alerting → Contact points → New contact point**, type
**MS Teams**.

| Field | Notes |
|-------|-------|
| Webhook URL | The URL from the workflow |
| Title | Optional. Takes a template |
| Message | Optional. Takes a template |

Then **Test**.

## What arrives

An Adaptive Card with the title, the alert list, and a link to the alert source
where one is available. Firing and resolved notifications both arrive in the
channel.

## Common failures

| Delivery attempt says | Cause |
|-----------------------|-------|
| `400 Bad Request` | The URL was truncated. The query string carries the signature, so paste the whole thing |
| `401`, `403` | The workflow was turned off, or its connection needs re-authorising. Open it in Power Automate and check the run history |
| `404` | The workflow was deleted |
| `410 Gone` | A classic connector URL that Microsoft has retired. Create a Workflows webhook |
| Sent, nothing in the channel | The workflow ran but posted elsewhere. Check the channel it targets in Power Automate |

Power Automate keeps a run history for the workflow, which shows whether the
request arrived and what the card did.
