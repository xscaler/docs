---
id: ai-uc-who-gets-told
title: "Audit who gets told when something fires"
sidebar_label: "Who gets told"
slug: /ai/use-cases/who-gets-told
---

# Audit who gets told when something fires

> An incident ran for forty minutes before anyone noticed. The rule was firing the whole time. Somebody needs to find out where the notification went.

## Prerequisites

- A connected client with `alerts:read`. Any member role can grant it. See [Capabilities](/ai/capabilities).

## Step 1: See what is firing and where it goes

Ask:

```text
What is firing in production right now, and who is being told?
```

`list_firing_alerts` answers with the rule that raised each alert, the series it is about, how long it has been firing, and the contact points it routes to. It also says when an alert routes to **nothing**, and when a silence is holding one back. Those two are the answer to the question above far more often than a broken integration is.

## Step 2: Follow the routing tree

Ask:

```text
Show me the notification policy.
```

`get_notification_policy` returns the routing tree: the matchers on each branch, how alerts are grouped and repeated, and any window during which a branch sends nothing. Read against the labels a rule actually sets, this is what says whether a notification had anywhere to go.

## Step 3: Check the destinations exist

Ask:

```text
List the contact points and tell me which ones nothing routes to.
```

`list_contact_points` returns each contact point's name and integration, which of its settings are filled in, and whether the policy routes anything to it. A contact point nothing routes to is configured and unreachable, which reads as working to anyone looking at a list of integrations.

**No setting value is ever returned, for any setting, encrypted or not.** You learn that a webhook URL is set, never what it is. A "non-secret" settings blob routinely carries a token inside a URL, so the whole blob is dropped rather than filtered. There is no contact point write tool, so no input accepts a secret either.

## Step 4: Read the rule that should have paged

Ask:

```text
Why did the checkout error rule not reach anybody?
```

`get_alert_rule` returns the rule's exact state, the queries its condition is built from, what it does when it gets no data or fails to evaluate, and every series it is currently firing on. A rule reported as not firing is either healthy or receiving no data, and this is the tool that separates those.

## Refine the audit

- "Which rules have no severity label, so the policy cannot route them?"
- "Are any rules paused that should not be?"
- "Which rules are failing to evaluate rather than not firing?"
- "Is anything silenced right now?"

## Which tool did what

| Step | Tool | What it does |
|---|---|---|
| 1 | `list_firing_alerts` | What is firing, the contact points reached, and the branches that reach nobody |
| 2 | `get_notification_policy` | The routing tree, its matchers, grouping and mute windows |
| 3 | `list_contact_points` | Names, integrations, which settings are filled in, and whether anything routes there |
| 4 | `get_alert_rule` | One rule's state, condition, no-data behaviour and firing series |

## Next steps

- [Create an alert rule and check it first](/ai/use-cases/alert-rule)
- [Security](/ai/security)
