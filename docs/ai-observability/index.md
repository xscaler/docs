---
id: ai-observability
title: AI observability
sidebar_label: Overview
slug: /ai-observability
---

# AI observability

An application that calls a model has two costs your existing dashboards cannot
see: tokens, and the latency of somebody else's inference. This section covers
instrumenting that application so both show up in production, next to the rest
of your telemetry.

:::info[This section covers the AI you ship]
Here you instrument an application that calls a model. To point a coding agent
at your own telemetry instead, see [xScaler & AI tools](/ai).
:::

## What you get

**Traces.** One span per model call, carrying the model, the operation, the
token counts and the finish reason. The span sits inside the request that
triggered it, so a slow endpoint shows the inference time as part of the
waterfall rather than as an unexplained gap.

**Metrics.** Token usage and call duration as histograms, split by model and
operation. These answer the recurring questions: which model is burning the
budget, whether p95 latency moved, how many calls failed.

## How it reaches xScaler

Your app emits OpenTelemetry GenAI spans and metrics. They leave through the
OTLP exporter your SDK already has, into the
[xScaler agent](/fleet-management) on `4317`, and the agent forwards them with
the same two headers every other xScaler write uses. There is no second
collector to run and no separate AI product to enable.

Everything then reads back in [Insights](/insights) like any other telemetry.

## Start here

| Page | What it covers |
|------|----------------|
| [Instrument your app](/ai-observability/instrument) | Auto-instrumentation, and manual spans for the SDKs it does not cover |
| [GenAI metrics](/ai-observability/metrics) | The metric names after ingest, with queries |
| [Trace an LLM call](/ai-observability/traces) | The span attributes and what to read in a waterfall |
| [Tokens & cost](/ai-observability/cost) | Turning token counts into money |

## Conventions

The attribute and metric names here come from the OpenTelemetry GenAI semantic
conventions. They are the reason a dashboard built against one provider keeps
working when you add a second: `gen_ai.request.model` means the same thing
whoever served the request.

Those conventions are still moving. Names in this section reflect what current
instrumentation emits. Pin your instrumentation library version so a dashboard
does not quietly go blank on an upgrade.
