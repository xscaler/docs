---
id: otel-sdk-go
title: OTel SDK — Go
sidebar_label: OTel SDK — Go
slug: /traces/otel-sdk-go
---

# OTel SDK — Go

Instrument a Go application to send traces directly to xScaler using the OpenTelemetry Go SDK over OTLP/HTTP.

:::warning Required headers
Both headers must be passed via `otlptracehttp.WithHeaders`:
- `"Authorization": "Bearer <token>"`
- `"X-Scope-OrgID": "<tenant-id>"`
:::

---

## Install dependencies

```bash
go get go.opentelemetry.io/otel \
       go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp \
       go.opentelemetry.io/otel/sdk/trace \
       go.opentelemetry.io/otel/sdk/resource
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
    "go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"
    "go.opentelemetry.io/otel/sdk/resource"
    sdktrace "go.opentelemetry.io/otel/sdk/trace"
    semconv "go.opentelemetry.io/otel/semconv/v1.21.0"
)

func main() {
    ctx := context.Background()

    exp, err := otlptracehttp.New(ctx,
        otlptracehttp.WithEndpoint("euw1-01.t.xscalerlabs.com"),
        otlptracehttp.WithURLPath("/otlp/v1/traces"),
        otlptracehttp.WithHeaders(map[string]string{
            "Authorization": "Bearer <token>",
            "X-Scope-OrgID": "<tenant-id>",
        }),
    )
    if err != nil {
        log.Fatalf("failed to create trace exporter: %v", err)
    }

    res := resource.NewWithAttributes(
        semconv.SchemaURL,
        semconv.ServiceName("my-service"),
        semconv.ServiceVersion("1.0.0"),
    )

    tp := sdktrace.NewTracerProvider(
        sdktrace.WithBatcher(exp),
        sdktrace.WithResource(res),
    )
    defer tp.Shutdown(ctx)
    otel.SetTracerProvider(tp)

    tracer := otel.Tracer("my-service")

    // Create a root span
    ctx, span := tracer.Start(ctx, "handle-request")
    defer span.End()

    // Create a child span
    _, child := tracer.Start(ctx, "query-database")
    time.Sleep(10 * time.Millisecond)
    child.End()
}
```

### Go SDK endpoint options

| Option | Value | Notes |
|--------|-------|-------|
| `WithEndpoint` | `"euw1-01.t.xscalerlabs.com"` | Host only — no scheme prefix |
| `WithURLPath` | `"/otlp/v1/traces"` | Path appended to the host |

The SDK uses HTTPS by default when port 443 is resolved.

---

## Load credentials from environment variables

```go
exp, err := otlptracehttp.New(ctx,
    otlptracehttp.WithEndpoint("euw1-01.t.xscalerlabs.com"),
    otlptracehttp.WithURLPath("/otlp/v1/traces"),
    otlptracehttp.WithHeaders(map[string]string{
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
if err := tp.Shutdown(ctx); err != nil {
    log.Printf("error shutting down tracer provider: %v", err)
}
```

---

## Troubleshooting

**`failed to export` error**
- Verify `WithEndpoint` is the bare host: `"euw1-01.t.xscalerlabs.com"` (no `https://`).
- Verify `WithURLPath` is `"/otlp/v1/traces"`.

**`401 Unauthorized`**
- The `Authorization` header must be `"Bearer <token>"` — include the `Bearer ` prefix and space.

**`400 Bad Request`**
- The `X-Scope-OrgID` key is missing from the headers map or misspelled.
