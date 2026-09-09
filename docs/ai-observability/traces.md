---
id: traces
title: Trace an LLM call
sidebar_label: Trace an LLM call
slug: /ai-observability/traces
---

# Trace an LLM call

A model call is one span inside the request that made it. That placement is the
point: the endpoint that got slow shows you how much of the time was inference,
how much was retrieval, and how much was your own code.

## What the span carries

| Attribute | Why you want it |
|-----------|-----------------|
| `gen_ai.operation.name` | `chat`, `embeddings`, `execute_tool` |
| `gen_ai.system` | Which provider served it |
| `gen_ai.request.model` | The model you asked for |
| `gen_ai.response.model` | The model that answered, which can differ |
| `gen_ai.request.max_tokens` | Whether a truncated answer was your own limit |
| `gen_ai.request.temperature` | Which settings a bad answer was produced under |
| `gen_ai.usage.input_tokens` | Prompt size for this specific call |
| `gen_ai.usage.output_tokens` | Answer size for this specific call |
| `gen_ai.response.finish_reasons` | `stop`, `length`, `tool_calls`, and so on |
| `gen_ai.response.id` | The provider's own request ID, for a support ticket |

`finish_reasons` is the attribute people forget and then need. A `length` finish
means the model was cut off, which explains a truncated answer without any
guesswork.

## Read it in Insights

Open **Insights → Traces**, pick the service, and open a trace.

**The waterfall** shows where the time went. A chat span is usually the widest
bar in the trace, and the interesting question is what sits beside it: embedding
calls, a vector search, a tool call round trip.

**Critical path** tells you which spans actually determined the duration. A
retrieval step running in parallel with something slower is not your problem,
however slow it looks.

**Span detail** lists every attribute above, so you can read the exact token
counts and settings for the one request somebody complained about.

See [Traces in Insights](/insights/traces) for the full set of views.

## Useful queries

Slow chat calls, in **Insights → Traces** with the query drawer open:

```
{ span.gen_ai.operation.name = "chat" && duration > 5s }
```

Truncated answers:

```
{ span.gen_ai.response.finish_reasons =~ ".*length.*" }
```

Calls to one model:

```
{ span.gen_ai.request.model = "gpt-4o" }
```

## Tool calls and agent loops

An agent that calls tools produces one span per tool invocation, with
`gen_ai.operation.name` set to `execute_tool`. A loop that will not terminate is
visible as a repeating pattern in the waterfall, which is a much faster
diagnosis than reading application logs.

If you build agent loops, set a span attribute for the iteration number. It
turns "why did this request take 40 seconds" into "it went round eleven times".

## Sampling

Spans are usually sampled. Keep cost and volume questions on
[metrics](/ai-observability/metrics), which are not, and use traces for the
individual request you are investigating.

If you sample, sample by trace rather than by span, or you will get chat spans
whose parent request is missing.

## Prompts and completions

Message content is not on the span unless you enabled content capture. See the
warning in [Instrument your app](/ai-observability/instrument).
