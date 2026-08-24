---
id: otel-sdk-go
title: Go OTel SDK
sidebar_label: Go OTel SDK
slug: /logs/otel-sdk-go
---

# Go OTel SDK

Send logs directly from a Go application to xScaler using the OpenTelemetry Go SDK over OTLP/HTTP.

:::warning Required headers
Both headers must be passed via `otlploghttp.WithHeaders`:
- `"Authorization": "Bearer <token>"`
- `"X-Scope-OrgID": "<tenant-id>"`
:::

---

## Install dependencies

```bash
go get go.opentelemetry.io/otel \
       go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp \
       go.opentelemetry.io/otel/sdk/log \
       go.opentelemetry.io/contrib/bridges/otelslog
```

---

## Setup and instrumentation

```go
package main

import (
    "context"
    "log/slog"
    "os"
    "time"

    "go.opentelemetry.io/contrib/bridges/otelslog"
    "go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp"
    "go.opentelemetry.io/otel/sdk/log"
    "go.opentelemetry.io/otel/sdk/resource"
    semconv "go.opentelemetry.io/otel/semconv/v1.21.0"
)

func main() {
    ctx := context.Background()

    exp, err := otlploghttp.New(ctx,
        otlploghttp.WithEndpoint("euw1-01.l.xscalerlabs.com"),
        otlploghttp.WithURLPath("/otlp/v1/logs"),
        otlploghttp.WithHeaders(map[string]string{
            "Authorization": "Bearer <token>",
            "X-Scope-OrgID": "<tenant-id>",
        }),
    )
    if err != nil {
        slog.Error("failed to create log exporter", "error", err)
        os.Exit(1)
    }

    res := resource.NewWithAttributes(
        semconv.SchemaURL,
        semconv.ServiceName("my-service"),
        semconv.ServiceVersion("1.0.0"),
    )

    provider := log.NewLoggerProvider(
        log.WithProcessor(log.NewBatchProcessor(exp)),
        log.WithResource(res),
    )
    defer provider.Shutdown(ctx)

    // Bridge standard slog to OTel
    logger := slog.New(otelslog.NewHandler("my-service",
        otelslog.WithLoggerProvider(provider),
    ))
    slog.SetDefault(logger)

    // Log as normal. Records are exported to xScaler
    slog.Info("application started", "version", "1.0.0")
    slog.Warn("high memory usage", "used_mb", 480)
    slog.Error("database connection failed", "host", "db.internal")

    time.Sleep(5 * time.Second) // allow final batch to flush
}
```

### Go SDK endpoint options

| Option | Value | Notes |
|--------|-------|-------|
| `WithEndpoint` | `"euw1-01.l.xscalerlabs.com"` | Host only: no scheme prefix |
| `WithURLPath` | `"/otlp/v1/logs"` | Path appended to the host |

The SDK uses HTTPS by default when port 443 is resolved.

---

## Load credentials from environment variables

```go
exp, err := otlploghttp.New(ctx,
    otlploghttp.WithEndpoint("euw1-01.l.xscalerlabs.com"),
    otlploghttp.WithURLPath("/otlp/v1/logs"),
    otlploghttp.WithHeaders(map[string]string{
        "Authorization": "Bearer " + os.Getenv("XSCALER_TOKEN"),
        "X-Scope-OrgID": os.Getenv("XSCALER_TENANT_ID"),
    }),
)
```

---

## Graceful shutdown

```go
sigCh := make(chan os.Signal, 1)
signal.Notify(sigCh, os.Interrupt, syscall.SIGTERM)
<-sigCh
if err := provider.Shutdown(ctx); err != nil {
    slog.Error("error shutting down log provider", "error", err)
}
```

---

## Troubleshooting

**`failed to export` error at startup**
- Verify `WithEndpoint` is the bare host without scheme: `"euw1-01.l.xscalerlabs.com"`
- Verify `WithURLPath` is `"/otlp/v1/logs"`

**`401 Unauthorized`**
- The `Authorization` header must be `"Bearer <token>"`. Include the `Bearer ` prefix and space.

**`401 Unauthorized`: "x-scope-orgid mismatch"**
- The `X-Scope-OrgID` key is missing from the headers map, misspelled, or its value doesn't match your token's tenant.

**Logs exported but not visible**
- Allow up to one batch interval for records to appear.
- Verify the tenant ID in `X-Scope-OrgID` matches your Grafana data source.
