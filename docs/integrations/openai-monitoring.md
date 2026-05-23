---
id: openai-monitoring
title: OpenAI API Usage
sidebar_label: OpenAI API Usage
slug: /integrations/openai-monitoring
---

# OpenAI API Usage

Track OpenAI API token consumption, request latency, error rates, and cost estimates by instrumenting your application with Prometheus counters and histograms.

**Pattern:** Application instrumentation → Prometheus scrape → xScaler `remote_write`

---

## Prerequisites

- OpenAI API key
- Application using openai SDK (Python, Node.js, or Go)
- xScaler tenant credentials (token + tenant ID)

---

## Option A — Python Instrumentation

```bash
pip install openai prometheus-client
```

```python
from prometheus_client import Counter, Histogram, Gauge, start_http_server
import openai, time

TOKENS_PROMPT = Counter('openai_tokens_prompt_total',
  'Prompt tokens used', ['model'])
TOKENS_COMPLETION = Counter('openai_tokens_completion_total',
  'Completion tokens used', ['model'])
REQUEST_DURATION = Histogram('openai_request_duration_seconds',
  'OpenAI API request duration', ['model'])
ERRORS = Counter('openai_errors_total',
  'OpenAI API errors', ['model', 'error_type'])

start_http_server(8000)

def chat(messages, model='gpt-4o'):
  start = time.time()
  try:
    resp = openai.chat.completions.create(model=model, messages=messages)
    TOKENS_PROMPT.labels(model=model).inc(resp.usage.prompt_tokens)
    TOKENS_COMPLETION.labels(model=model).inc(resp.usage.completion_tokens)
    REQUEST_DURATION.labels(model=model).observe(time.time() - start)
    return resp
  except Exception as e:
    ERRORS.labels(model=model, error_type=type(e).__name__).inc()
    raise
```

```yaml
scrape_configs:
  - job_name: openai_app
    static_configs:
      - targets: ['localhost:8000']

remote_write:
  - url: https://euw1-01.m.xscalerlabs.com/api/v1/push
    authorization:
      credentials: <token>
    headers:
      X-Scope-OrgID: <tenant-id>
```

---

## Option B — Grafana Alloy

```river
prometheus.scrape "openai_app" {
  targets    = [{"__address__" = "localhost:8000"}]
  forward_to = [prometheus.remote_write.xscaler.receiver]
}

prometheus.remote_write "xscaler" {
  endpoint {
    url = "https://euw1-01.m.xscalerlabs.com/api/v1/push"
    authorization {
      type        = "Bearer"
      credentials = "<token>"
    }
    headers = { "X-Scope-OrgID" = "<tenant-id>" }
  }
}
```

---

## Option C — OpenTelemetry SDK

```bash
pip install opentelemetry-sdk opentelemetry-exporter-otlp
```

```python
from opentelemetry import metrics
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.exporter.otlp.proto.http.metric_exporter import OTLPMetricExporter

exporter = OTLPMetricExporter(
  endpoint="https://euw1-01.m.xscalerlabs.com/v1/metrics",
  headers={"Authorization": "Bearer <token>", "X-Scope-OrgID": "<tenant-id>"}
)
provider = MeterProvider()
metrics.set_meter_provider(provider)
meter = metrics.get_meter("openai_monitor")

token_counter = meter.create_counter("openai.tokens.total")
```

---

## Logs

OpenAI API usage — there are no local log files to collect. Use the API-based metrics exporter to monitor request counts, latency, and token usage.

## Key metrics

| Metric | Description |
|--------|-------------|
| `openai_tokens_prompt_total` | Prompt tokens used by model |
| `openai_tokens_completion_total` | Completion tokens generated |
| `openai_requests_total` | Total API calls |
| `openai_request_duration_seconds` | API call latency histogram |
| `openai_errors_total` | API errors by type |
| `openai_rate_limit_remaining` | Remaining rate limit tokens |
