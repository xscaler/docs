---
id: webhook
title: Webhook
sidebar_label: Webhook
slug: /insights/alerting/contact-points/webhook
---

# Webhook

A webhook posts JSON to a URL you control. Use it for anything without a
dedicated integration: your own service, an incident tool, a chatops bot, a
queue.

## Create the contact point

**Insights → Alerting → Contact points → New contact point**, type
**Webhook**.

| Field | Notes |
|-------|-------|
| URL | Where to post. Has to be reachable on the public internet |
| HTTP method | `POST` or `PUT`. Defaults to `POST` |
| Username | Optional. Sets HTTP basic auth with the password below |
| Password | The basic auth password |
| Max alerts | How many alerts to include in one request. `0` means all of them |

Then **Test**.

## The payload

The body is JSON with `Content-Type: application/json`:

```json
{
  "receiver": "ops-webhook",
  "status": "firing",
  "groupKey": "receiver=ops-webhook\nalertname=HighErrorRate\ncluster=eu-west-1",
  "alerts": [
    {
      "labels": {
        "alertname": "HighErrorRate",
        "grafana_folder": "production",
        "severity": "critical",
        "cluster": "eu-west-1",
        "service": "checkout-api"
      },
      "annotations": {
        "summary": "Error rate is 7.2% on checkout-api",
        "description": "Above the 5% budget. Check upstream latency first.",
        "runbook_url": "https://runbooks.acme.io/high-error-rate"
      },
      "startsAt": "2026-09-09T10:14:02Z",
      "status": { "state": "firing" }
    }
  ]
}
```

| Field | What it holds |
|-------|--------------|
| `receiver` | The contact point's name |
| `status` | `firing` or `resolved` for the group as a whole |
| `groupKey` | The group's identity. Stable across notifications about the same group, so it works as a deduplication key |
| `alerts` | Every alert in the group |

Each alert carries `labels`, `annotations`, `startsAt`, and `status.state` of
`firing` or `resolved`. A resolved alert also carries `endsAt`.

## Writing the receiving end

**Key on `groupKey`.** It identifies the group rather than one notification, so
use it to update an existing record instead of creating a new one on every
repeat.

**Read `status`, and each alert's own `status.state`.** A group can contain both
firing and resolved alerts, so check per alert rather than trusting the group
status alone.

**Return 2xx quickly.** Any status outside 200-299 is recorded as a failed
delivery. Acknowledge first, process afterwards.

**Expect repeats.** The same group arrives again on the repeat interval, four
hours by default, and after any change to its contents. Handle a duplicate
without side effects.

## Authentication

Basic auth is built in through the Username and Password fields.

For anything else, put a reverse proxy or an API gateway in front of your
endpoint and check the credential there. A shared secret in the URL path works
and is visible to anyone who can read the contact point's settings.

:::warning[Headers that name a tenant are dropped]
`X-Scope-OrgID` and other xScaler tenant headers are stripped from outbound
webhook requests, so they cannot be used to reach another tenant's data.
:::

## Reachable addresses

The URL has to resolve to a public address. Delivery to private, loopback,
link-local and cloud metadata addresses is refused, and so are redirects to
them.

To reach a service inside your network, put a publicly reachable relay in front
of it and let the relay forward inward.

## Max alerts

Leave it at `0` unless your endpoint has a body size limit. Setting it to `10`
truncates the `alerts` array at ten, and the remaining alerts in that group are
not sent anywhere.

## Common failures

| Delivery attempt says | Cause |
|-----------------------|-------|
| `receiver returned 401 Unauthorized` | Wrong basic auth credentials, or your gateway wants a different scheme |
| `receiver returned 404 Not Found` | The path is wrong. Check for a trailing slash |
| `receiver returned 500` | Your handler threw. Check its logs |
| `timeout` | Your endpoint took too long. Acknowledge before processing |
| A private or internal address | The URL resolves inside a private range. Use a public relay |
| `receiver has no webhook URL setting` | The URL field is empty |

## Other protocols

xScaler also delivers to Amazon SNS. For a queue or a broker, post to a small
HTTP endpoint that enqueues, which keeps the retry behaviour under your
control. See [Amazon SNS](/insights/alerting/contact-points/sns).
