---
id: ai
title: "xScaler & AI Tools"
sidebar_label: Overview
slug: /ai
---

# xScaler & AI Tools

Ask your telemetry questions in plain language, from the editor you already have open. Point a coding agent at xScaler and it investigates production from your real metrics, logs and traces instead of guessing.

## MCP server

The xScaler MCP server implements the Model Context Protocol and connects your telemetry to your coding agent. Plug it into Claude Code or Cursor in a couple of minutes and every session after that has your production data in it.

- Query metrics, logs and traces by asking, with no PromQL, LogQL or TraceQL to write yourself
- Follow one signal into the next, from a metric to the trace behind it to the logs that describe the span
- Read your dashboards and alert rules, and create new ones
- Works with Claude Code, Claude Desktop, Cursor, VS Code and other MCP clients
- Included on every plan, with no key to create and no agent to run

[Connect a client →](/ai/connect)

## Answers you can check

An agent is only as good as what it reads, so every answer says how much of the data it actually saw.

- Statistics are exact, computed from the full series before anything is reduced
- Anything capped, clamped or summarised is named, with the remedy and a downgraded confidence
- A connection can never do more than the person who approved it
- Every answer links back to the same query in the portal
- Every change an agent makes lands in the audit trail

[Reading an answer →](/ai/answers)

## Use cases

Questions an agent answers from your own telemetry:

- Ask what changed after a deploy when latency or errors jump
- Find the slowest trace through a service, and which span is eating the time
- Ask when the 5xx rate started climbing and what the first error line said
- Ask which metrics a service exports and what units they are in
- Have an agent build a dashboard for a service: request rate, error rate and p95 latency
- Describe an alert in words and check the condition against today's data before saving it

It works through these the way a person does in the portal. It lists the environments, learns the metric names and labels, writes the query, reads the result, and follows one signal into the next.

[Browse the tools →](/ai/tools)
