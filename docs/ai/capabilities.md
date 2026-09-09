---
id: ai-capabilities
title: Capabilities
sidebar_label: Capabilities
slug: /ai/capabilities
---

# Capabilities

Two things bound a connection: your role in the organization, and the capabilities you ticked. Both are checked on every call, so a role change or a removed membership applies on the next call. There is nothing to revoke by hand.

Capabilities only subtract from your role. Connecting a client can never widen what you are able to do.

| Capability | On the consent screen | What the client can do | Minimum role |
|---|---|---|---|
| `tenants:read` | See your environments | List the environments in this organization and which telemetry each one holds | Member |
| `metrics:read` | Read your metrics | Run metric queries, read results, list metrics and labels | Member |
| `logs:read` | Read your logs | Search logs and read matching lines | Member |
| `traces:read` | Read your traces | Search traces and read spans, including their attributes | Member |
| `dashboards:read` | See your dashboards | List folders and dashboards and read their contents | Member |
| `alerts:read` | See your alerting setup | Read alert rules, firing alerts and notification routing | Member |
| `dashboards:write` | Create dashboards | Create dashboards and folders | Editor |
| `alerts:write` | Create and pause alert rules | Create alert rules, pause and resume them | Editor |

**No tool here deletes anything.** No tool deletes a dashboard, a folder, an alert rule, a contact point or any telemetry. The dashboard tools only create. Importing the same file twice leaves two dashboards and never overwrites one that somebody else owns.

---

[See which tool each capability unlocks →](/ai/tools)
