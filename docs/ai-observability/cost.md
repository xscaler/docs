---
id: cost
title: Tokens & cost
sidebar_label: Tokens & cost
slug: /ai-observability/cost
---

# Tokens & cost

xScaler stores token counts. It does not know what you pay per token, so the
conversion to money is one multiplication you supply.

## Why the rate is yours

Prices differ by provider, by model, by tier, and by whatever your contract
says. A rate baked into the platform would be wrong for most people and
silently stale for the rest. Put your rates in the query, or in a recording
rule, where you can see them and update them.

## Cost per hour, by model

Two rates per model, since output tokens cost more than input tokens. Replace
the placeholders with your own per-token prices.

```promql
# Input tokens
sum by (gen_ai_request_model) (
  rate(gen_ai_client_token_usage_sum{gen_ai_token_type="input"}[1h])
) * 3600 * [YOUR INPUT RATE PER TOKEN]

  +

# Output tokens
sum by (gen_ai_request_model) (
  rate(gen_ai_client_token_usage_sum{gen_ai_token_type="output"}[1h])
) * 3600 * [YOUR OUTPUT RATE PER TOKEN]
```

Provider prices are quoted per million tokens. A price of $2.50 per million
input tokens is `0.0000025` per token.

## Per-model rates in one expression

Rather than one query per model, encode the rates as a label join. Write a
recording rule holding the rates:

```yaml
groups:
  - name: genai-rates
    rules:
      - record: genai:token_rate:usd
        expr: vector(0.0000025)
        labels:
          gen_ai_request_model: gpt-4o
          gen_ai_token_type: input
      - record: genai:token_rate:usd
        expr: vector(0.00001)
        labels:
          gen_ai_request_model: gpt-4o
          gen_ai_token_type: output
```

Then cost is one multiplication across all models:

```promql
sum by (gen_ai_request_model) (
    rate(gen_ai_client_token_usage_sum[1h]) * 3600
  * on (gen_ai_request_model, gen_ai_token_type) group_left
    genai:token_rate:usd
)
```

Adding a model becomes two lines of rules rather than a dashboard edit.

:::info[Where rules run]
xScaler does not host a Ruler. Recording rules run wherever your rule evaluation
lives, in your own Prometheus or Grafana, writing the result back to xScaler.
See [Alerts](/rules-and-alerts).
:::

## Cost per request

To price a feature per request:

```promql
sum(rate(gen_ai_client_token_usage_sum[1h]))
  /
sum(rate(gen_ai_client_operation_duration_count[1h]))
```

That is tokens per call. Multiply by your blended rate for money per call, then
compare it against what the request earns you.

## What to watch

**Tokens per call, over weeks.** Prompt templates accumulate. A retrieval step
that started returning five documents instead of three shows up here and nowhere
else.

**Output tokens as a share of the total.** Output is the expensive half. A
change in this ratio usually means a prompt change altered how much the model
says.

**Cost by operation.** Embeddings are cheap per call and easy to run far too
often. Split by `gen_ai_operation_name` and the caching opportunity becomes
obvious.

## Alert on spend

Token rate is a better alert signal than a monthly total, because it fires while
you can still do something:

```promql
sum(rate(gen_ai_client_token_usage_sum{gen_ai_token_type="output"}[15m])) * 3600
  > [YOUR HOURLY TOKEN BUDGET]
```

A runaway agent loop trips this within the quarter hour. A monthly bill alert
tells you afterwards.

See [Alerting](/insights/alerting) for the rule editor.

## Attributing cost

To answer "which customer, which feature", the label has to be on the metric,
and a customer ID on a token histogram is a cardinality problem. Two options
that work:

**A bounded label.** `tenant_tier` or `feature` has few values and answers most
of the question.

**Spans for the rest.** Put the customer ID on the span, where cardinality costs
nothing, and query traces for the individual cases. See
[Trace an LLM call](/ai-observability/traces).

[Limits & quotas](/limits) lists the cardinality limits you are working inside.
