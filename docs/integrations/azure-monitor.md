---
id: azure-monitor
title: Azure Monitor
sidebar_label: Azure Monitor
slug: /integrations/azure-monitor
---

# Azure Monitor

Pull metrics from Azure Monitor into xScaler using the OpenTelemetry Collector's `azuremonitor` receiver. Covers Azure VMs, AKS, Azure SQL, App Service, Storage Accounts, and all other Azure Monitor metrics.

**Pattern:** OTel Collector `azuremonitor` receiver → xScaler OTLP endpoint

---

## Prerequisites

- Azure subscription with Azure Monitor enabled
- Service Principal with `Monitoring Reader` role on the subscription or resource group
- OTel Collector (contrib distribution)
- xScaler tenant credentials

---

## Create a service principal

```bash
# Create service principal and note the output (appId, password, tenant)
az ad sp create-for-rbac \
  --name otel-metrics-reader \
  --role "Monitoring Reader" \
  --scopes /subscriptions/YOUR_SUBSCRIPTION_ID
```

---

## Configuration

Save as `otel-collector-config.yaml`:

```yaml
receivers:
  azuremonitor:
    subscription_id: YOUR_SUBSCRIPTION_ID
    tenant_id: YOUR_TENANT_ID
    client_id: YOUR_CLIENT_ID
    client_secret: YOUR_CLIENT_SECRET
    resource_groups:
      - YOUR_RESOURCE_GROUP
    collection_interval: 1m
    services:
      # Virtual Machines
      - service: microsoft.compute/virtualmachines
        metrics:
          - Percentage CPU
          - Network In Total
          - Network Out Total
          - Disk Read Bytes
          - Disk Write Bytes

      # AKS
      - service: microsoft.containerservice/managedclusters
        metrics:
          - node_cpu_usage_percentage
          - node_memory_working_set_percentage
          - kube_pod_status_ready

      # Azure SQL
      - service: microsoft.sql/servers/databases
        metrics:
          - cpu_percent
          - connection_successful
          - storage_percent
          - dtu_consumption_percent

      # App Service
      - service: microsoft.web/sites
        metrics:
          - CpuTime
          - Requests
          - Http5xx
          - AverageResponseTime
          - MemoryWorkingSet

processors:
  memory_limiter:
    check_interval: 1s
    limit_mib: 512
  batch:
    timeout: 30s
    send_batch_size: 1000

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
      receivers:  [azuremonitor]
      processors: [memory_limiter, batch]
      exporters:  [otlphttp/xscaler]
```

---

## Key metrics

| Service | Metric | Description |
|---------|--------|-------------|
| VMs | `Percentage CPU` | CPU utilisation % |
| VMs | `Network In Total` | Bytes received |
| VMs | `Network Out Total` | Bytes sent |
| AKS | `node_cpu_usage_percentage` | Node CPU % |
| AKS | `node_memory_working_set_percentage` | Node memory % |
| Azure SQL | `cpu_percent` | Database CPU % |
| Azure SQL | `connection_successful` | Successful connections |
| Azure SQL | `dtu_consumption_percent` | DTU usage % |
| App Service | `Requests` | Total HTTP requests |
| App Service | `Http5xx` | Server errors |
| App Service | `AverageResponseTime` | Response time (s) |

---

## Useful PromQL queries

```promql
# VM CPU across all VMs
avg(azure_vm_percentage_cpu_average)

# App Service 5xx error rate
rate(azure_app_service_http5xx_total[5m])

# Azure SQL DTU usage
azure_sql_dtu_consumption_percent_average

# AKS node memory pressure
azure_aks_node_memory_working_set_percentage_average > 85
```
