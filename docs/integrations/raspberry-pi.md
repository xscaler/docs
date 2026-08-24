---
id: raspberry-pi
title: Raspberry Pi
sidebar_label: Raspberry Pi
slug: /integrations/raspberry-pi
---

# Raspberry Pi

Monitor Raspberry Pi hardware metrics using node_exporter: CPU temperature, CPU usage, memory, and GPIO.

**Pattern:** node_exporter → Prometheus scrape → xScaler remote_write

---

## Prerequisites

- Raspberry Pi OS (Bullseye or later)
- Prometheus or Grafana Alloy installed on the Pi
- xScaler tenant credentials (token + tenant ID)

---

## Option A: Prometheus Exporter

Download the ARMv7 (32-bit) or ARM64 (64-bit) build of node_exporter from the [Prometheus releases page](https://github.com/prometheus/node_exporter/releases), then create a systemd service:

```bash
# Download (example for ARM64)
wget https://github.com/prometheus/node_exporter/releases/latest/download/node_exporter-linux-arm64.tar.gz
tar xvf node_exporter-linux-arm64.tar.gz
sudo mv node_exporter-linux-arm64/node_exporter /usr/local/bin/

# Create systemd service
sudo tee /etc/systemd/system/node_exporter.service > /dev/null <<EOF
[Unit]
Description=Prometheus node_exporter
After=network.target

[Service]
ExecStart=/usr/local/bin/node_exporter \
  --collector.cpu.info \
  --collector.thermal_zone
Restart=always

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now node_exporter
```

node_exporter listens on port `9100`. Configure Prometheus to scrape and remote_write:

```yaml
scrape_configs:
  - job_name: raspberry_pi
    static_configs:
      - targets: ["localhost:9100"]
        labels:
          instance: "pi-01"

remote_write:
  - url: https://euw1-01.m.xscalerlabs.com/api/v1/push
    authorization:
      type: Bearer
      credentials: <token>
    headers:
      X-Scope-OrgID: "<tenant-id>"
```

## Option B: Grafana Alloy

```river
prometheus.scrape "raspberry_pi" {
  targets = [{"__address__" = "localhost:9100", "instance" = "pi-01"}]
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

## Option C: OpenTelemetry Collector

```yaml
receivers:
  hostmetrics:
    collection_interval: 30s
    scrapers:
      cpu: {}
      disk: {}
      filesystem: {}
      load: {}
      memory: {}
      network: {}

processors:
  batch: {}
  resourcedetection:
    detectors: [system]

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
      receivers: [hostmetrics]
      processors: [resourcedetection, batch]
      exporters: [otlphttp/xscaler]
```

---

## Logs

Collect syslog and journal entries from the Raspberry Pi OS. Add the following to your Alloy config:

```river
loki.source.journal "raspberry_pi_journal" {
  forward_to    = [loki.write.xscaler.receiver]
  relabel_rules = loki.relabel.raspberry_pi_journal.rules
  labels = {
    job      = "integrations/raspberry_pi",
    instance = constants.hostname,
  }
}

loki.relabel "raspberry_pi_journal" {
  forward_to = []
  rule {
    source_labels = ["__journal__systemd_unit"]
    target_label  = "unit"
  }
}

local.file_match "raspberry_pi_files" {
  path_targets = [{
    __address__ = "localhost",
    __path__    = "/var/log/{syslog,messages,*.log}",
    instance    = constants.hostname,
    job         = "integrations/raspberry_pi",
  }]
}

loki.source.file "raspberry_pi_files" {
  targets    = local.file_match.raspberry_pi_files.targets
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
| `node_cpu_seconds_total` | Cumulative CPU time by mode (user, system, idle) |
| `node_thermal_zone_temp` | CPU die temperature reported by the thermal zone (Pi CPU temp) |
| `node_memory_MemAvailable_bytes` | Estimated available memory for new allocations |
| `node_filesystem_avail_bytes` | Available space on the SD card / mounted volumes |
| `node_network_receive_bytes_total` | Total bytes received on each network interface |
