---
id: metrics
title: GenAI metrics
sidebar_label: GenAI metrics
slug: /ai-observability/metrics
---

# GenAI metrics

Two histograms answer most questions about a model call: how many tokens it
used, and how long it took.

## Names after ingest

OTLP metric names contain dots. Prometheus names cannot, so ingest normalises
them: dots become underscores, and a histogram expands into `_bucket`, `_sum`
and `_count` series.

| OTLP name | Query it as |
|-----------|-------------|
| `gen_ai.client.token.usage` | `gen_ai_client_token_usage_bucket`, `_sum`, `_count` |
| `gen_ai.client.operation.duration` | `gen_ai_client_operation_duration_bucket`, `_sum`, `_count` |

Attributes normalise the same way.

| Attribute | Label | Values |
|-----------|-------|--------|
| `gen_ai.token.type` | `gen_ai_token_type` | `input`, `output` |
| `gen_ai.request.model` | `gen_ai_request_model` | The model you asked for |
| `gen_ai.response.model` | `gen_ai_response_model` | The model that answered |
| `gen_ai.operation.name` | `gen_ai_operation_name` | `chat`, `embeddings`, `execute_tool` |
| `gen_ai.system` | `gen_ai_system` | `openai`, `anthropic`, and so on |

The quickest way to see what your instrumentation actually emits is
**Insights → Metrics**, search `gen_ai`, then break down by label.

## Queries

### Tokens per second, by model

```promql
sum by (gen_ai_request_model) (
  rate(gen_ai_client_token_usage_sum[5m])
)
```

### Input against output tokens

Output tokens usually cost several times what input tokens cost, so keep them
apart:

```promql
sum by (gen_ai_token_type) (
  rate(gen_ai_client_token_usage_sum[5m])
)
```

### Tokens per call

Rising tokens per call with flat traffic means your prompts are growing, which
is the usual cause of a bill that climbs while usage does not:

```promql
sum(rate(gen_ai_client_token_usage_sum[1h]))
  /
sum(rate(gen_ai_client_token_usage_count[1h]))
```

### Call rate

`_count` on the duration histogram counts calls:

```promql
sum by (gen_ai_request_model, gen_ai_operation_name) (
  rate(gen_ai_client_operation_duration_count[5m])
)
```

### p95 latency, by model

```promql
histogram_quantile(0.95,
  sum by (le, gen_ai_request_model) (
    rate(gen_ai_client_operation_duration_bucket[5m])
  )
)
```

Provider latency varies with load you do not control. Alert on a level you can
live with rather than on a change, or you will page yourself about someone
else's afternoon.

### Errors

The duration histogram carries `error_type` when a call fails:

```promql
sum by (error_type) (
  rate(gen_ai_client_operation_duration_count{error_type!=""}[5m])
)
```

Rate limiting from the provider shows up here first.

## Build the dashboard

A daily view fits in four panels:

1. Tokens per second, split by `gen_ai_token_type`.
2. Tokens per call, as a single stat.
3. p95 and p99 duration, by model.
4. Error rate, by `error_type`.

Add it from **Insights → Dashboards**, or use **Add to dashboard** on any of the
queries above. See [Dashboards](/insights/dashboards).

## Alert on it

Rules worth setting up:

- Error rate above your tolerated level for 10 minutes.
- Tokens per call up sharply against the same hour last week, which catches a
  prompt-building regression.
- p95 duration past the point where your own timeout fires.

See [Alerting](/insights/alerting).

## Next

[Tokens & cost](/ai-observability/cost) turns these counts into money.
