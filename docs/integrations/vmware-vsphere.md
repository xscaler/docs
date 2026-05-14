---
id: vmware-vsphere
title: VMware vSphere
sidebar_label: VMware vSphere
slug: /integrations/vmware-vsphere
---

# VMware vSphere

Collect metrics from VMware vCenter and ESXi hosts — VM CPU/memory, datastore I/O, and cluster health — using vmware_exporter. Centralise your virtualisation telemetry in xScaler alongside your other infrastructure.

**Pattern:** vmware_exporter → Prometheus scrape → xScaler remote_write

---

## Prerequisites

- VMware vCenter 6.5 or later
- Read-only service account created in vCenter (`monitor@vsphere.local`)
- xScaler tenant credentials (token + tenant ID)

---

## Option A — Prometheus Exporter

Run vmware_exporter as a Docker container, pointed at your vCenter:

```bash
docker run -d \
  -p 9272:9272 \
  -e VSPHERE_HOST=vcenter.local \
  -e VSPHERE_USER=monitor@vsphere.local \
  -e VSPHERE_PASSWORD=secret \
  pryorda/vmware_exporter
```

The exporter listens on port `9272`. Configure Prometheus to scrape and remote_write:

```yaml
scrape_configs:
  - job_name: vmware_vsphere
    static_configs:
      - targets: ["localhost:9272"]
    scrape_interval: 60s

remote_write:
  - url: https://euw1-01.m.xscalerlabs.com/api/v1/push
    authorization:
      type: Bearer
      credentials: <token>
    headers:
      X-Scope-OrgID: "<tenant-id>"
```

## Option B — Grafana Alloy

```river
prometheus.scrape "vmware_vsphere" {
  targets          = [{"__address__" = "localhost:9272"}]
  scrape_interval  = "60s"
  forward_to       = [prometheus.remote_write.xscaler.receiver]
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

## Option C — OpenTelemetry Collector

```yaml
receivers:
  vcenter:
    endpoint: https://vcenter.local
    username: monitor@vsphere.local
    password: secret
    collection_interval: 60s
    tls:
      insecure_skip_verify: false

processors:
  batch: {}

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
      receivers: [vcenter]
      processors: [batch]
      exporters: [otlphttp/xscaler]
```

---

## Key metrics

| Metric | Description |
|--------|-------------|
| `vmware_vm_power_state` | Current power state of each virtual machine (1 = on) |
| `vmware_vm_cpu_usage_average` | Average CPU usage for each VM in MHz |
| `vmware_vm_mem_usage_average` | Average memory usage for each VM in MB |
| `vmware_datastore_capacity_size` | Total capacity of each datastore in bytes |
| `vmware_host_cpu_usage_average` | Average CPU usage across ESXi host in MHz |
| `vmware_host_mem_usage_average` | Average memory usage across ESXi host in MB |
