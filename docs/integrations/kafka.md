---
id: kafka
title: Apache Kafka
sidebar_label: Apache Kafka
slug: /integrations/kafka
---

# Apache Kafka

Collect broker throughput, consumer group lag, partition leadership, and JVM metrics from Apache Kafka using `kafka_exporter` and the JMX exporter.

**Pattern:** kafka_exporter → Prometheus scrape → xScaler `remote_write`

---

## Prerequisites

- Apache Kafka 2.0 or later
- Prometheus or Grafana Alloy
- xScaler tenant credentials

---

## Step 1 — Run kafka_exporter

`kafka_exporter` connects to Kafka brokers over the standard Kafka protocol — no JMX required.

```bash
docker run --rm -d \
  --name kafka-exporter \
  -p 9308:9308 \
  danielqsj/kafka-exporter \
  --kafka.server=localhost:9092
```

For multiple brokers:

```bash
docker run --rm -d \
  --name kafka-exporter \
  -p 9308:9308 \
  danielqsj/kafka-exporter \
  --kafka.server=broker1:9092 \
  --kafka.server=broker2:9092 \
  --kafka.server=broker3:9092
```

Verify:

```bash
curl -s http://localhost:9308/metrics | grep kafka_brokers
# kafka_brokers 3
```

---

## Step 2 — Scrape and forward to xScaler

### Prometheus

```yaml
scrape_configs:
  - job_name: kafka
    static_configs:
      - targets: ['localhost:9308']
        labels:
          cluster: prod

remote_write:
  - url: https://euw1-01.m.xscalerlabs.com/api/v1/push
    authorization:
      credentials: <token>
    headers:
      X-Scope-OrgID: <tenant-id>
```

### Grafana Alloy

```river
prometheus.scrape "kafka" {
  targets    = [{"__address__" = "localhost:9308"}]
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

## Key metrics

| Metric | Description |
|--------|-------------|
| `kafka_brokers` | Number of brokers in the cluster |
| `kafka_topic_partitions` | Number of partitions per topic |
| `kafka_topic_partition_current_offset` | Latest offset per partition |
| `kafka_topic_partition_oldest_offset` | Oldest offset per partition |
| `kafka_topic_partition_in_sync_replica` | In-sync replica count |
| `kafka_topic_partition_leader` | Partition leader broker ID |
| `kafka_topic_partition_leader_is_preferred` | 1 if leader is preferred replica |
| `kafka_topic_partition_under_replicated_partition` | 1 if partition is under-replicated |
| `kafka_consumergroup_current_offset` | Consumer group current offset |
| `kafka_consumergroup_lag` | Consumer group lag (messages behind) |

---

## Useful PromQL queries

```promql
# Consumer group lag per topic-partition
kafka_consumergroup_lag

# Total lag per consumer group
sum by (consumergroup) (kafka_consumergroup_lag)

# Under-replicated partitions (should be 0)
sum(kafka_topic_partition_under_replicated_partition)

# Message production rate (offset growth rate)
rate(kafka_topic_partition_current_offset[5m])

# Consumer groups with lag > 10000
sum by (consumergroup, topic) (kafka_consumergroup_lag) > 10000

# Partition leadership imbalance (non-preferred leaders)
sum(kafka_topic_partition_leader_is_preferred == 0)
```

---

## Troubleshooting

**No consumer group metrics**
- Consumer group metrics require active consumers. Groups that have no active members may not appear.
- If using Kafka with ACLs, the exporter's principal needs `Describe` permission on consumer groups.

**`kafka_brokers 0`**
- Verify `--kafka.server` points to an accessible broker address
- Check network connectivity: `nc -zv broker1 9092`

**Lag metrics missing for a group**
- Kafka exporter only tracks groups using the `__consumer_offsets` topic (high-level consumers). Old ZooKeeper-based consumers are not supported.
