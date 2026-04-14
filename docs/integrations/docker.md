---
id: docker
title: Docker
sidebar_label: Docker
slug: /integrations/docker
---

# Docker

Collect container-level metrics from a Docker host — CPU, memory, network I/O, and block I/O per container — using the OpenTelemetry Collector's Docker Stats receiver.

**Pattern:** OTel Collector `docker_stats` receiver → xScaler OTLP endpoint

---

## Prerequisites

- Docker Engine running on the host
- OTel Collector deployed on the same host (or with access to the Docker socket)
- xScaler tenant credentials

---

## Configuration

Save as `otel-collector-config.yaml`:

```yaml
receivers:
  docker_stats:
    endpoint: unix:///var/run/docker.sock
    collection_interval: 15s
    timeout: 20s
    api_version: "1.24"

processors:
  memory_limiter:
    check_interval: 1s
    limit_mib: 256
  batch:
    timeout: 10s
    send_batch_size: 1000
  resourcedetection:
    detectors: [env, system, docker]
    timeout: 5s

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
      receivers:  [docker_stats]
      processors: [memory_limiter, resourcedetection, batch]
      exporters:  [otlphttp/xscaler]
```

---

## Run the collector

```bash
docker run --rm \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  -v $(pwd)/otel-collector-config.yaml:/etc/otelcol-contrib/config.yaml \
  otel/opentelemetry-collector-contrib:latest
```

:::info Docker socket access
The collector needs read access to `/var/run/docker.sock` to query container stats. The `:ro` flag mounts it read-only.
:::

---

## Key metrics

| Metric | Description |
|--------|-------------|
| `container.cpu.usage.total` | Total CPU usage in nanoseconds |
| `container.cpu.percent` | CPU usage as a percentage of available cores |
| `container.memory.usage.total` | Total memory usage in bytes |
| `container.memory.percent` | Memory usage as a percentage of the limit |
| `container.blockio.io_service_bytes_recursive` | Block I/O bytes read/written |
| `container.network.io.usage.rx_bytes` | Network bytes received |
| `container.network.io.usage.tx_bytes` | Network bytes transmitted |

---

## Useful PromQL queries

```promql
# CPU usage % per container
rate(container_cpu_usage_seconds_total[5m]) * 100

# Memory usage per container (bytes)
container_memory_usage_bytes

# Network receive rate per container
rate(container_network_receive_bytes_total[5m])

# Top 10 containers by memory
topk(10, container_memory_usage_bytes)
```
