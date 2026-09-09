---
id: ai-use-cases
title: "Use cases"
sidebar_label: "Use cases"
slug: /ai/use-cases
---

# Use cases

Workflows you can run from any MCP client connected to xScaler. Each one walks through a real scenario: the prompt to send, what comes back, and which tools the agent used to get there.

[Connect a client](/ai/connect) first. Every workflow below names the capabilities it needs.

## Investigate

### [Reconstruct a bug from a trace id](/ai/use-cases/trace-id)

Paste a trace id from a support ticket and get the request path, the span that failed, and the log lines around it.

### [Find where latency is going](/ai/use-cases/latency)

Ask why an endpoint is slow and get a real trace of a slow request, chosen by the metric rather than at random.

### [Find when a problem started](/ai/use-cases/when-it-started)

Read a log window from the oldest end, which is the only way to find the first occurrence of something.

### [Check what changed after a deploy](/ai/use-cases/after-a-deploy)

Compare the same query across two windows and see which series moved.

## Build

### [Build a dashboard by describing it](/ai/use-cases/dashboard)

Describe the panels you want and get a dashboard wired to the right store, or import an export from grafana.com.

### [Create an alert rule and check it first](/ai/use-cases/alert-rule)

Describe a threshold in words, see what the condition does against today's data, then save the rule.

### [Audit who gets told when something fires](/ai/use-cases/who-gets-told)

Follow a rule through the notification policy to the contact points it reaches, and find the branches that reach nobody.
