---
id: overview
title: Trace Querying Overview
sidebar_label: Overview
slug: /trace-query/overview
---

# Trace Querying Overview

xScaler exposes the **full TraceQL HTTP API**, so any tool that supports TraceQL works without modification: Grafana, `tempo-cli`, `curl`, and more.

## Base URL

```
https://euw1-01.t.xscalerlabs.com
```

All trace query endpoints are relative to this base. Replace `euw1-01` with your [region](/regions).

## Required headers

Every query request must include both headers:

```http
Authorization: Bearer <token>
X-Scope-OrgID: <tenant-id>
```

---

## API endpoints

| Operation | Method | Path |
|-----------|--------|------|
| [Search traces](/trace-query/search) | `GET` | `/api/search` |
| Fetch trace by ID | `GET` | `/api/traces/<traceID>` |
| [Tag names](/trace-query/search) | `GET` | `/api/search/tags` |
| [Tag values](/trace-query/search) | `GET` | `/api/search/tag/<tag>/values` |

---

## TraceQL quick reference

TraceQL queries select spans from traces based on their attributes.

### Basic span selection

```traceql
# All spans from a service
{ resource.service.name = "my-service" }

# Spans with a specific status
{ status = error }

# Spans slower than 500ms
{ duration > 500ms }

# Combine conditions
{ resource.service.name = "api" && duration > 200ms }
```

### Attribute filtering

```traceql
# HTTP spans with 5xx responses
{ span.http.status_code >= 500 }

# Specific route
{ span.http.route = "/api/users" }

# Database calls
{ span.db.system = "postgresql" }

# Spans with a custom attribute
{ span.order.id = "abc-123" }
```

### Structural queries: trace pipelines

```traceql
# A → B: A followed by B in the same trace
{ span.http.route = "/checkout" } >> { span.db.system = "postgresql" }

# Traces where any span errored
{ status = error }

# Traces containing both a root HTTP span and a slow DB call
{ span.http.method = "POST" } && { span.db.system = "redis" && duration > 100ms }
```

### Aggregation functions

```traceql
# p99 duration by service
{ } | rate()
{ } | count_over_time()

# Top services by error rate
{ status = error } | rate() by(resource.service.name)
```

---

## Response envelope

```json
{
  "traces": [
    {
      "traceID": "abc123def456",
      "rootServiceName": "api",
      "rootTraceName": "POST /checkout",
      "startTimeUnixNano": "1716300000000000000",
      "durationMs": 142,
      "spanSets": [...]
    }
  ],
  "metrics": {}
}
```

---

## Query timeout

Queries time out after **2 minutes**. Narrow the time range or add more specific span selectors to reduce query cost.
