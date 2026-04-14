---
id: kubernetes
title: Kubernetes
sidebar_label: Kubernetes
slug: /integrations/kubernetes
---

# Kubernetes

Collect metrics from your Kubernetes cluster — node resource usage, pod CPU/memory, deployment health, persistent volume status, and more.

**Pattern:** kube-state-metrics + kubelet cAdvisor → Prometheus scrape → xScaler `remote_write`

---

## Prerequisites

- Kubernetes cluster (any version ≥ 1.21)
- `kubectl` access
- Prometheus or Grafana Alloy deployed in the cluster
- xScaler tenant credentials

---

## Step 1 — Deploy kube-state-metrics

kube-state-metrics exposes Kubernetes object state as Prometheus metrics.

```bash
kubectl apply -f https://github.com/kubernetes/kube-state-metrics/releases/latest/download/kube-state-metrics.yaml
```

Verify:

```bash
kubectl get pods -n kube-system -l app.kubernetes.io/name=kube-state-metrics
```

---

## Step 2 — Scrape and forward to xScaler

### Option A — Prometheus (in-cluster)

Add these scrape jobs to your Prometheus config or `prometheus-operator` `ServiceMonitor`:

```yaml
scrape_configs:
  # kube-state-metrics — Kubernetes object state
  - job_name: kube-state-metrics
    static_configs:
      - targets: ['kube-state-metrics.kube-system.svc.cluster.local:8080']

  # kubelet cAdvisor — container resource usage
  - job_name: kubelet
    scheme: https
    tls_config:
      insecure_skip_verify: true
    bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
    kubernetes_sd_configs:
      - role: node
    relabel_configs:
      - action: labelmap
        regex: __meta_kubernetes_node_label_(.+)
      - target_label: __address__
        replacement: kubernetes.default.svc:443
      - source_labels: [__meta_kubernetes_node_name]
        target_label: __metrics_path__
        replacement: /api/v1/nodes/${1}/proxy/metrics/cadvisor

remote_write:
  - url: https://euw1-01.m.xscalerlabs.com/api/v1/push
    authorization:
      credentials: <token>
    headers:
      X-Scope-OrgID: <tenant-id>
```

### Option B — Grafana Alloy (in-cluster)

```river
// Discover all Kubernetes pods with prometheus.io/scrape annotation
discovery.kubernetes "pods" {
  role = "pod"
}

discovery.relabel "annotated_pods" {
  targets = discovery.kubernetes.pods.targets
  rule {
    source_labels = ["__meta_kubernetes_pod_annotation_prometheus_io_scrape"]
    action        = "keep"
    regex         = "true"
  }
}

prometheus.scrape "kubernetes" {
  targets    = discovery.relabel.annotated_pods.output
  forward_to = [prometheus.remote_write.xscaler.receiver]
}

prometheus.remote_write "xscaler" {
  endpoint {
    url = "https://euw1-01.m.xscalerlabs.com/api/v1/push"
    authorization {
      type        = "Bearer"
      credentials = env("XSCALER_TOKEN")
    }
    headers = { "X-Scope-OrgID" = env("XSCALER_TENANT_ID") }
  }
}
```

---

## Key metrics

| Metric | Description |
|--------|-------------|
| `kube_pod_status_phase` | Pod phase (Running, Pending, Failed) |
| `kube_deployment_status_replicas_available` | Available replicas per deployment |
| `kube_deployment_status_replicas_unavailable` | Unavailable replicas |
| `kube_node_status_condition` | Node conditions (Ready, MemoryPressure) |
| `kube_pod_container_resource_requests` | Requested CPU/memory per container |
| `kube_pod_container_resource_limits` | CPU/memory limits per container |
| `container_cpu_usage_seconds_total` | Container CPU usage (cAdvisor) |
| `container_memory_working_set_bytes` | Container memory usage (cAdvisor) |
| `kube_persistentvolumeclaim_status_phase` | PVC status (Bound, Pending) |
| `kube_horizontalpodautoscaler_status_current_replicas` | HPA current replica count |

---

## Useful PromQL queries

```promql
# Pods not in Running state
count by (namespace, pod) (kube_pod_status_phase{phase!="Running"})

# Container CPU usage % of limit
sum(rate(container_cpu_usage_seconds_total[5m])) by (pod, namespace)
/ sum(kube_pod_container_resource_limits{resource="cpu"}) by (pod, namespace)
* 100

# Container memory usage % of limit
sum(container_memory_working_set_bytes) by (pod, namespace)
/ sum(kube_pod_container_resource_limits{resource="memory"}) by (pod, namespace)
* 100

# Deployments with unavailable replicas
kube_deployment_status_replicas_unavailable > 0

# Node not Ready
kube_node_status_condition{condition="Ready", status="true"} == 0
```
