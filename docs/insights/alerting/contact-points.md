---
id: contact-points
title: Contact points
sidebar_label: Contact points
slug: /insights/alerting/contact-points
---

# Contact points

A contact point is where notifications are delivered. Open
**Insights → Alerting → Contact points**.

Set one up before you write your first rule. A rule that fires with nowhere to
send is silent, and it looks exactly like a rule that is working.

## Integration types

| Type | What you need |
|------|--------------|
| Slack | An incoming webhook URL, or a bot token and a channel |
| Email | Your own SMTP server, and the addresses to send to |
| PagerDuty | An Events API v2 integration key |
| Webhook | A URL, and optionally basic auth |
| Opsgenie | An API key |
| MS Teams | A webhook URL |
| Telegram | A bot token and a chat ID |
| Discord | A webhook URL |
| Amazon SNS | A topic ARN and a region |

## Create one

**New contact point**, give it a name, pick a type, fill in the fields.

The name is what you pick in notification policies, so name it after the
audience rather than the tool: `payments-oncall` reads better in a routing tree
than `slack-webhook-2`.

**Add another integration** puts a second destination under the same name.
A contact point called `payments-oncall` can page PagerDuty and post to Slack
at once, and the routing tree still only has one thing to point at.

## Test it

**Test** sends a notification through the contact point using a sample alert.

Do this every time you create one. A webhook with a typo in the URL fails
silently for weeks otherwise.

:::warning[Test notifications are real]
The test is delivered for real. Anyone watching that channel, inbox or pager
is notified. Warn the on-call before testing a paging integration.
:::

## Secrets

Tokens, keys and passwords are stored write-only. Once saved, the field reads
as set and the value is never sent back to the browser. Admins and owners can
reveal a stored secret; editors cannot.

To replace a secret, type the new value over the field. To keep it, leave the
field alone.

:::warning[Changing the destination clears the secret]
Change a contact point's type, or the address it sends to, and you have to
re-enter its secrets in the same save. A save that changes the destination
while leaving the secret field untouched is refused with
`re-enter the contact point secrets when changing its type or destination`.

This stops a stored credential being carried to an address it was not issued
for.
:::

## Email

Alert email goes out through the SMTP server on the contact point, from your
own domain and your own sending reputation. xScaler does not relay it.

| Field | Notes |
|-------|-------|
| Addresses | Comma-separated recipients |
| SMTP host | Your mail server |
| SMTP port | 587 for STARTTLS, 465 for implicit TLS, 25 for an unauthenticated relay |
| From address | The envelope sender |
| SMTP username | Leave blank for an unauthenticated relay |
| SMTP password | Required when a username is set |
| Send a single email to all recipients | One message with everyone on it, instead of one each |

## Webhooks and reachable addresses

A webhook, SMTP host or custom endpoint has to be reachable on the public
internet. Delivery to private, loopback, link-local and cloud metadata
addresses is refused, and redirects to them are refused too.

Custom headers naming a tenant, such as `X-Scope-OrgID`, are dropped from
outbound webhook requests.

To reach a service inside your own network, put a relay in front of it that has
a public address.

## Health

Each contact point shows a health chip. A warning means the routing tree does
not deliver to it, which usually means a name changed on one side and not the
other.

## Provisioned contact points

A contact point marked **Provisioned** is managed outside the portal and reads
as read-only. Change it wherever it is defined.

## Delete one

Deleting removes every integration under the name, and any notification policy
routing there stops delivering. Check
[Notification policies](/insights/alerting/notification-policies) first.

## Permissions

| Action | Role |
|--------|------|
| View contact points and which settings are filled in | Member |
| Create, edit, test and delete them | Editor |
| Read a stored secret back | Admin |

## Next

[Notification policies](/insights/alerting/notification-policies) decide which
alerts arrive here.
