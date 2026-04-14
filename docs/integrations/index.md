---
id: integrations
title: Integrations
sidebar_label: Overview
slug: /integrations
---

# Integrations

Connect any metrics source to xScaler. Every integration below describes how to collect metrics from a specific system and forward them to your xScaler tenant using Prometheus `remote_write`, Grafana Alloy, or the OpenTelemetry Collector.

:::info Two headers on every request
Whichever integration you use, every request to xScaler requires:
```
Authorization: Bearer <token>
X-Scope-OrgID: <tenant-id>
```
:::

---

## How integrations work

Most integrations follow one of two patterns:

**Pattern A — Prometheus Exporter → remote_write**
```
[Service] → [Exporter] → [Prometheus scrape] → [xScaler remote_write]
```
A sidecar exporter exposes a `/metrics` endpoint. Prometheus scrapes it and ships to xScaler.

**Pattern B — OTel Collector receiver → OTLP export**
```
[Service] → [OTel Collector receiver] → [xScaler OTLP endpoint]
```
The OTel Collector uses a native receiver for the service and exports via OTLP/HTTP.

---

## Infrastructure

| Integration | Pattern | Key metrics |
|-------------|---------|-------------|
| [Linux / node_exporter](/integrations/linux) | Exporter | CPU, memory, disk, network |
| [Kubernetes](/integrations/kubernetes) | Exporter | Pod CPU/memory, node health, deployment status |
| [Docker](/integrations/docker) | OTel Collector | Container CPU, memory, network I/O |

## Cloud

| Integration | Pattern | Key metrics |
|-------------|---------|-------------|
| [AWS CloudWatch](/integrations/aws-cloudwatch) | OTel Collector | EC2, RDS, Lambda, ELB, S3 |
| [Google Cloud](/integrations/google-cloud) | OTel Collector | GCE, GKE, Cloud SQL, Pub/Sub |
| [Azure Monitor](/integrations/azure-monitor) | OTel Collector | VMs, AKS, Azure SQL, App Service |

## Databases

| Integration | Pattern | Key metrics |
|-------------|---------|-------------|
| [PostgreSQL](/integrations/postgresql) | Exporter | Connections, queries, replication lag |
| [MySQL](/integrations/mysql) | Exporter | Queries/sec, connections, InnoDB |
| [Redis](/integrations/redis) | Exporter | Commands/sec, memory, keyspace hits |
| [MongoDB](/integrations/mongodb) | Exporter | Operations, connections, replication |

## Web & App Servers

| Integration | Pattern | Key metrics |
|-------------|---------|-------------|
| [Nginx](/integrations/nginx) | Exporter | Requests/sec, active connections, errors |
| [Apache HTTP Server](/integrations/apache) | Exporter | Requests, workers, traffic |

## Message Queues

| Integration | Pattern | Key metrics |
|-------------|---------|-------------|
| [Apache Kafka](/integrations/kafka) | Exporter | Consumer lag, throughput, partition health |

---

## Don't see your integration?

Email [founders@xscalerlabs.com](mailto:founders@xscalerlabs.com) — if you can expose a Prometheus `/metrics` endpoint or send OTLP, xScaler will accept it. Most integrations not listed here work out of the box with the [OpenTelemetry Collector](../ingest/opentelemetry-collector) using an existing receiver.
