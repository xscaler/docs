---
id: email
title: Email
sidebar_label: Email
slug: /insights/alerting/contact-points/email
---

# Email

Alert email is sent through your own SMTP server, from your own domain. xScaler
does not relay it, so your deliverability, spam filtering and rate limits stay
yours.

## What you need

An SMTP server that accepts mail from the internet, and a set of credentials
for it. Any transactional mail provider works: Amazon SES, SendGrid, Postmark,
Mailgun, or your own Postfix.

Create a dedicated sending user rather than reusing a person's mailbox
credentials.

## Create the contact point

**Insights → Alerting → Contact points → New contact point**, type **Email**.

| Field | Notes |
|-------|-------|
| Addresses | Recipients, comma-separated: `alerts@acme.io, oncall@acme.io` |
| SMTP host | Your mail server, for example `email-smtp.eu-west-1.amazonaws.com` |
| SMTP port | `587` for STARTTLS, `465` for implicit TLS, `25` for an unauthenticated relay |
| From address | The envelope sender. Use an address on a domain you control |
| SMTP username | Leave blank for an unauthenticated relay |
| SMTP password | Required when a username is set |
| Send a single email to all recipients | One message addressed to everyone, instead of one message each |
| Subject | Optional. Takes a template |
| Message body | Optional. Takes a template |

Then **Test**.

## Provider settings

| Provider | Host | Port | Username |
|----------|------|------|----------|
| Amazon SES | `email-smtp.<region>.amazonaws.com` | 587 | The SMTP credential, which differs from your AWS access key |
| SendGrid | `smtp.sendgrid.net` | 587 | `apikey`, literally |
| Postmark | `smtp.postmarkapp.com` | 587 | Your server API token, as both username and password |
| Mailgun | `smtp.mailgun.org` | 587 | `postmaster@<your-domain>` |

Whichever you use, verify the sending domain with the provider first. An
unverified `From address` is the most common cause of alert email that leaves
xScaler and never arrives.

## Deliverability

Alert mail is transactional and bursty, which is exactly the shape spam filters
dislike.

- Set SPF and DKIM on the sending domain.
- Send from a subdomain such as `alerts.acme.io`, so an alerting burst cannot
  affect your main domain's reputation.
- Group alerts so an incident is one message rather than forty. See
  [Notification policies](/insights/alerting/notification-policies).
- Check your provider's rate limit against your busiest incident.

:::warning[Email is a poor paging channel]
Mail is queued, filtered and batched by systems you do not control, so it
arrives minutes late often enough to matter. Use email for warnings and
records, and page through [PagerDuty](/insights/alerting/contact-points/pagerduty),
[Opsgenie](/insights/alerting/contact-points/opsgenie) or
[Slack](/insights/alerting/contact-points/slack).
:::

## Common failures

| Delivery attempt says | Cause |
|-----------------------|-------|
| `535`, `authentication failed` | Wrong username or password. SES and Postmark both use credentials that differ from the ones you log in with |
| `530 must issue a STARTTLS command` | Port mismatch. Try 587 |
| `connection refused`, `timeout` | The host or port is wrong, or the server does not accept connections from the internet |
| `550 not authorized`, `rejected` | The From address or its domain is not verified with the provider |
| A private or internal address | The SMTP host resolves to a private, loopback or metadata address. Delivery there is refused |
| `re-enter the contact point secrets` | The save changed the SMTP host and left the password untouched. Re-enter it |
| Sent, nothing received | Your mail server's logs are next. The message left xScaler |

## Changing the SMTP host later

The stored password is bound to the host it was saved against. Change the host
and you have to re-enter the password in the same save. See
[Contact points](/insights/alerting/contact-points).
