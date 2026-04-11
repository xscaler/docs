---
id: authentication
title: Authentication
sidebar_label: Authentication
slug: /authentication
---

# Authentication

Every request to xScaler — whether writing metrics or querying them — requires **two HTTP headers**.

## Required headers

```http
Authorization: Bearer <token>
X-Scope-OrgID: <tenant-id>
```

| Header | Purpose |
|--------|---------|
| `Authorization: Bearer <token>` | Authenticates the caller. The token must be a valid API token issued from the xScaler dashboard. |
| `X-Scope-OrgID: <tenant-id>` | Selects the tenant data namespace. This is the **tenant isolation header** — without it the backend cannot route the request to the correct data store. |

:::danger Both headers are mandatory
There are no exceptions. Every `remote_write`, every query, every rules API call must include both headers. A missing `X-Scope-OrgID` returns **400**. A missing or invalid `Authorization` returns **401**.
:::

### Example — curl

```bash
curl "https://euw1-01.m.xscalerlabs.com/prometheus/api/v1/query" \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "X-Scope-OrgID: my-org-123" \
  --data-urlencode 'query=up'
```

---

## Where to find your credentials

1. Log in to the **xScaler dashboard** at [xscalerlabs.com](https://xscalerlabs.com).
2. Navigate to **Settings → API Tokens**.
3. Note your **Tenant ID** (the value for `X-Scope-OrgID`).
4. Create or copy an existing **API token** (the value for the `Bearer` credential).

---

## Token scopes

| Scope | Allowed operations |
|-------|--------------------|
| `write` | Ingest metrics via `remote_write` or OTLP. Cannot query. |
| `read` | Query via the Prometheus HTTP API. Cannot write. |
| `read+write` | Both ingest and query. Suitable for integrated clients such as Grafana Agent or Alloy. |

Use the narrowest scope appropriate for each client. For example, a Prometheus instance that only ships metrics should use a `write`-scoped token.

---

## Zero-downtime token rotation

Rotating a token without dropping metrics or queries:

1. **Generate a new token** in the dashboard with the same scope as the existing token.
2. **Update all clients** (Prometheus configs, Alloy configs, collector configs, Grafana data sources) to use the new token.
3. **Verify traffic** — watch your ingest dashboards and confirm metrics continue to arrive.
4. **Delete the old token** once traffic from the old token has dropped to zero.

Do not delete the old token before step 3 — there may be in-flight `remote_write` batches that still carry it.

---

## Error reference

| HTTP Code | Meaning | Common cause |
|-----------|---------|--------------|
| `400` | Missing `X-Scope-OrgID` header | Header omitted from the request |
| `401` | Missing or invalid `Authorization` header | Token absent, expired, or malformed |
| `403` | Token has insufficient scope for the operation | Write-only token used for a query, or vice versa |
| `429` | Rate limit exceeded | Too many requests; reduce ingest rate or shard count |
