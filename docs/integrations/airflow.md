---
id: airflow
title: Apache Airflow
sidebar_label: Apache Airflow
slug: /integrations/airflow
---

# Apache Airflow

Monitor Apache Airflow — scheduler heartbeat, executor slots, task instance states, DAG processing time, and DAG run counts — via the built-in StatsD exporter or Prometheus endpoint.

**Pattern:** Airflow StatsD → statsd_exporter → Prometheus scrape → xScaler `remote_write`

---

## Prerequisites

- Apache Airflow 2.x
- xScaler tenant credentials (token + tenant ID)

---

## Enable StatsD Metrics

In `airflow.cfg`:

```ini
[metrics]
statsd_on = True
statsd_host = localhost
statsd_port = 8125
statsd_prefix = airflow
```

Run the Prometheus StatsD exporter with Airflow mappings:

```bash
docker run -d \
  -p 9102:9102 \
  -p 8125:8125/udp \
  -v $(pwd)/statsd_mapping.yml:/tmp/statsd_mapping.yml \
  prom/statsd-exporter \
  --statsd.mapping-config=/tmp/statsd_mapping.yml
```

---

## Option A — Prometheus

```yaml
scrape_configs:
  - job_name: airflow
    static_configs:
      - targets: ['localhost:9102']

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
prometheus.scrape "airflow" {
  targets    = [{"__address__" = "localhost:9102"}]
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

## Option C — OpenTelemetry Collector (Airflow 2.7+ built-in endpoint)

Airflow 2.7+ has a native Prometheus endpoint at `/metrics`:

```yaml
receivers:
  prometheus:
    config:
      scrape_configs:
        - job_name: airflow
          static_configs:
            - targets: ['localhost:8080']
          metrics_path: /metrics

processors:
  batch:
    timeout: 10s

exporters:
  otlphttp/xscaler:
    endpoint: https://euw1-01.m.xscalerlabs.com
    headers:
      Authorization: "Bearer <token>"
      X-Scope-OrgID: "<tenant-id>"
    compression: gzip

service:
  pipelines:
    metrics:
      receivers:  [prometheus]
      processors: [batch]
      exporters:  [otlphttp/xscaler]
```

---

## Logs

Collect Airflow scheduler, webserver, and task logs. Add the following to your Alloy config:

```river
local.file_match "airflow_logs" {
  path_targets = [{
    __address__ = "localhost",
    __path__    = "/opt/airflow/logs/**/*.log",
    instance    = constants.hostname,
    job         = "integrations/airflow",
  }]
}

loki.source.file "airflow_logs" {
  targets    = local.file_match.airflow_logs.targets
  forward_to = [loki.write.xscaler.receiver]
}

loki.write "xscaler" {
  endpoint {
    url = "https://euw1-01.l.xscalerlabs.com/api/v1/push"

    http_client_config {
      authorization {
        type        = "Bearer"
        credentials = env("XSCALER_TOKEN")
      }
    }

    headers = { "X-Scope-OrgID" = env("XSCALER_TENANT_ID") }
  }
}
```

## Key metrics

| Metric | Description |
|--------|-------------|
| `airflow_scheduler_heartbeat` | Scheduler liveness counter |
| `airflow_executor_open_slots` | Available executor slots |
| `airflow_executor_queued_tasks` | Tasks waiting for execution |
| `airflow_executor_running_tasks` | Currently running tasks |
| `airflow_dag_processing_total_parse_time` | DAG file parse duration |
| `airflow_task_instance_created` | Task instances created by state |
| `airflow_dagrun_duration_success` | Successful DAG run duration |
