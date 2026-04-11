---
id: otel-sdk-go
title: OTel SDK — Go
sidebar_label: OTel SDK — Go
slug: /ingest/otel-sdk-go
---

# OTel SDK — Go

Instrument a Go application to push metrics directly to xScaler using the OpenTelemetry Go SDK over OTLP/HTTP.

:::warning Required headers
Both headers must be passed via `otlpmetrichttp.WithHeaders`:
- `"Authorization": "Bearer <token>"`
- `"X-Scope-OrgID": "<tenant-id>"`
:::

---

## Install dependencies

```bash
go get go.opentelemetry.io/otel \
       go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp \
       go.opentelemetry.io/otel/sdk/metric
```

---

## Setup and instrumentation

```go
package main

import (
    "context"
    "log"
    "time"

    "go.opentelemetry.io/otel"
    "go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp"
    "go.opentelemetry.io/otel/sdk/metric"
    "go.opentelemetry.io/otel/sdk/resource"
    semconv "go.opentelemetry.io/otel/semconv/v1.21.0"
)

func main() {
    ctx := context.Background()

    exp, err := otlpmetrichttp.New(ctx,
        otlpmetrichttp.WithEndpoint("euw1-01.m.xscalerlabs.com"),
        otlpmetrichttp.WithURLPath("/otlp/v1/metrics"),
        otlpmetrichttp.WithHeaders(map[string]string{
            "Authorization": "Bearer <token>",
            "X-Scope-OrgID": "<tenant-id>",
        }),
    )
    if err != nil {
        log.Fatalf("failed to create exporter: %v", err)
    }

    res := resource.NewWithAttributes(
        semconv.SchemaURL,
        semconv.ServiceName("my-service"),
        semconv.ServiceVersion("1.0.0"),
    )

    provider := metric.NewMeterProvider(
        metric.WithReader(metric.NewPeriodicReader(exp,
            metric.WithInterval(15*time.Second),
        )),
        metric.WithResource(res),
    )
    defer provider.Shutdown(ctx)
    otel.SetMeterProvider(provider)

    meter := otel.Meter("my-service")

    // Counter example
    counter, err := meter.Int64Counter("http_requests_total",
        metric.WithDescription("Total HTTP requests"),
    )
    if err != nil {
        log.Fatalf("failed to create counter: %v", err)
    }
    counter.Add(ctx, 1)

    // Keep the process alive long enough for one export cycle
    time.Sleep(20 * time.Second)
}
```

### Go SDK endpoint options

The `otlpmetrichttp` exporter splits the endpoint into two options:

| Option | Value | Notes |
|--------|-------|-------|
| `WithEndpoint` | `"euw1-01.m.xscalerlabs.com"` | Host only, no scheme prefix |
| `WithURLPath` | `"/otlp/v1/metrics"` | Path appended to the host |

The SDK uses HTTPS by default when port 443 is resolved. Do not include `https://` in `WithEndpoint`.

---

## Load credentials from environment variables

```go
import "os"

exp, err := otlpmetrichttp.New(ctx,
    otlpmetrichttp.WithEndpoint("euw1-01.m.xscalerlabs.com"),
    otlpmetrichttp.WithURLPath("/otlp/v1/metrics"),
    otlpmetrichttp.WithHeaders(map[string]string{
        "Authorization": "Bearer " + os.Getenv("XSCALER_TOKEN"),
        "X-Scope-OrgID": os.Getenv("XSCALER_TENANT_ID"),
    }),
)
```

---

## Graceful shutdown

The `defer provider.Shutdown(ctx)` call in the example above flushes and exports the final batch before the process exits. In a long-running service, hook this to your signal handler:

```go
sigCh := make(chan os.Signal, 1)
signal.Notify(sigCh, os.Interrupt, syscall.SIGTERM)
<-sigCh
if err := provider.Shutdown(ctx); err != nil {
    log.Printf("error shutting down meter provider: %v", err)
}
```

---

## Troubleshooting

**`failed to export` error at startup**
- Verify `WithEndpoint` is the bare host without scheme: `"euw1-01.m.xscalerlabs.com"` (not `"https://..."`)
- Verify `WithURLPath` is `"/otlp/v1/metrics"`

**`401 Unauthorized`**
- The `Authorization` header value must be `"Bearer <token>"` — the full string including the `Bearer ` prefix and a space.

**`400 Bad Request`**
- The `X-Scope-OrgID` key is missing from the headers map or misspelled.

**Metrics exported but not visible in Grafana**
- Allow up to one export interval (15 s) for metrics to appear.
- Verify the tenant ID in `X-Scope-OrgID` matches the one configured in your Grafana data source.
