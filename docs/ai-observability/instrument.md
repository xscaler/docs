---
id: instrument
title: Instrument your app
sidebar_label: Instrument your app
slug: /ai-observability/instrument
---

# Instrument your app

Model calls become spans and metrics the same way the rest of your application
does, through the OpenTelemetry SDK. This page covers the GenAI-specific part.

## Prerequisites

An [xScaler agent](/fleet-management/enroll-agents) reachable from your
application, listening on `4317` for OTLP/gRPC or `4318` for OTLP/HTTP. The
agent holds the credentials, so your application never sees a token.

If you send to xScaler directly instead of through an agent, use the endpoints
and headers in [Regions & endpoints](/regions).

## Point the SDK at the agent

```bash
export OTEL_SERVICE_NAME=checkout-api
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
export OTEL_EXPORTER_OTLP_PROTOCOL=grpc
```

On Kubernetes, point the endpoint at the agent's service rather than
`localhost`.

## Python

The OpenTelemetry contrib packages instrument the provider SDKs directly:

```bash
pip install opentelemetry-distro opentelemetry-exporter-otlp \
            opentelemetry-instrumentation-openai-v2
```

Run under the agent-side auto-instrumentation wrapper:

```bash
opentelemetry-instrument python app.py
```

Every `chat.completions.create` call now produces a span with the model,
operation, token counts and finish reason, plus the two GenAI metrics.

### Message content is off by default

Prompts and completions are not recorded unless you ask for them:

```bash
export OTEL_INSTRUMENTATION_GENAI_CAPTURE_MESSAGE_CONTENT=true
```

:::warning[Read this before turning content capture on]
Prompts and completions frequently contain personal data, credentials pasted by
users, and whatever your retrieval layer fetched. Once captured they are stored
with your logs and visible to anyone who can read your telemetry.

Leave it off in production unless you have a reason, and if you turn it on, turn
it on for one service at a time.
:::

## Other languages

Auto-instrumentation coverage varies by language and provider. Where a provider
has no instrumentation package, wrap the call yourself. The attributes matter
more than the mechanism.

### A manual span

```python
from opentelemetry import trace

tracer = trace.get_tracer("checkout.summariser")

with tracer.start_as_current_span("chat gpt-4o") as span:
    span.set_attribute("gen_ai.operation.name", "chat")
    span.set_attribute("gen_ai.system", "openai")
    span.set_attribute("gen_ai.request.model", "gpt-4o")
    span.set_attribute("gen_ai.request.max_tokens", 512)

    response = client.chat.completions.create(...)

    span.set_attribute("gen_ai.response.model", response.model)
    span.set_attribute("gen_ai.response.id", response.id)
    span.set_attribute("gen_ai.usage.input_tokens", response.usage.prompt_tokens)
    span.set_attribute("gen_ai.usage.output_tokens", response.usage.completion_tokens)
    span.set_attribute(
        "gen_ai.response.finish_reasons",
        [c.finish_reason for c in response.choices],
    )
```

Name the span `<operation> <model>`, which is what the conventions specify and
what keeps a trace list readable.

`gen_ai.response.model` is worth setting separately from the request model.
Providers alias model names, and the response tells you what actually ran.

### Record the metrics too

Spans are sampled. Metrics are not, so cost and latency questions should be
answered from metrics:

```python
from opentelemetry import metrics

meter = metrics.get_meter("checkout.summariser")
tokens = meter.create_histogram(
    "gen_ai.client.token.usage", unit="{token}",
    description="Tokens used per model call",
)

attrs = {
    "gen_ai.operation.name": "chat",
    "gen_ai.system": "openai",
    "gen_ai.request.model": "gpt-4o",
}
tokens.record(response.usage.prompt_tokens, {**attrs, "gen_ai.token.type": "input"})
tokens.record(response.usage.completion_tokens, {**attrs, "gen_ai.token.type": "output"})
```

## Keep the cardinality sane

Model, operation and provider are safe labels. A user ID, a session ID, a prompt
hash or a document ID is not: each new value is a new series, and a per-user
label on a token histogram will hit the limits in
[Limits & quotas](/limits) quickly.

Put the high-cardinality identifiers on the span, where they cost nothing, and
keep them off the metric.

## Verify it arrived

1. Make a request that calls the model.
2. Open **Insights → Traces**, pick your service, and look for a span named
   after the operation and model.
3. Open **Insights → Metrics** and search for `gen_ai`. If the histogram is
   there, the metrics pipeline is working too.

If the span is missing, the agent's own logs are the next place to look. See
[Agent troubleshooting](/fleet-management/troubleshooting).

## Next

- [GenAI metrics](/ai-observability/metrics) for the metric names and queries.
- [Trace an LLM call](/ai-observability/traces) for reading the result.
