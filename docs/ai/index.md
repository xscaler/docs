---
id: ai
title: "xScaler & AI Tools"
sidebar_label: Overview
slug: /ai
---

# xScaler & AI Tools

xScaler exposes your telemetry to a coding agent through an MCP server. Add
`https://mcp.xscalerlabs.com/mcp` to Claude Code, Cursor or any other MCP
client, and the agent reads the same metrics, logs and traces you see in the
portal. It writes the PromQL, LogQL or TraceQL itself and moves between
signals: from a metric to the trace behind it, to the logs that describe a
span.

No API key is involved. Whoever connects signs in through the browser and ticks
the capabilities the connection may use. See [Connect a client](/ai/connect)
to set one up.

## What a connection can do

The server exposes 25 tools in five groups. [Tools](/ai/tools) lists them with
the capability each one needs.

- **Read telemetry.** Query metrics, logs and traces. When a window holds more
  than one answer can carry, the tools return exact statistics computed from
  the whole series and say what they reduced. See [Reading an answer](/ai/answers).
- **Correlate signals.** The store keeps the link between a metric point, the
  trace that produced it and the logs written while it ran, so a slow metric
  can hand back a real trace and the log lines around it.
- **Read dashboards and alerting.** List folders and dashboards, read alert
  rules and firing alerts, and see where notifications route.
- **Make changes.** Create dashboards and alert rules within the capabilities
  granted. Nothing deletes, and every change an agent makes lands in the audit
  trail.

A connection acts as the person who approved it and never exceeds that person's
role. See [Capabilities](/ai/capabilities) for what a connection can and cannot
do.

## Use cases

The [use cases](/ai/use-cases) walk through real investigations, prompt by
prompt: reconstruct a bug from a trace id, find when a problem started, check
what changed after a deploy, and the rest.
