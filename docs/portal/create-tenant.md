---
id: create-tenant
title: Create a Tenant
sidebar_label: Create a Tenant
slug: /portal/create-tenant
---

# Create a Tenant

A tenant is an isolated metrics namespace. Each tenant gets its own write endpoint, API token, and series quota. Create one tenant per environment (production, staging, dev) or per team.

---

## Steps

1. Go to **Tenants** in the sidebar.

2. Click **New tenant** in the top-right corner.

3. Fill in the optional fields:

   | Field | Description |
   |-------|-------------|
   | **Display name** | A human-readable label (e.g. `production`, `team-payments`). Shown in the portal but not used in API calls. |
   | **Environment** | Free-text tag to categorise the tenant (e.g. `prod`, `staging`). Optional. |

4. Click **Create tenant**.

5. The portal shows the tenant credentials — **copy them now**:

   | Credential | What it's used for |
   |------------|-------------------|
   | **Access key (API token)** | Value for the `Authorization: Bearer <token>` header |
   | **Write endpoint** | URL for `remote_write` or OTLP export |

   :::warning Token shown once
   The API token is only displayed at creation time. If you lose it, [rotate the key](/portal/api-tokens#rotate-an-api-token) to generate a new one.
   :::

6. Click **Done**. The new tenant appears in the tenants list with status **Active**.

---

## What to do next

Configure your metrics collector to send data to the new tenant. Both headers are required on every request:

```yaml
# Prometheus remote_write
remote_write:
  - url: <write endpoint>
    authorization:
      credentials: <api token>
    headers:
      X-Scope-OrgID: <tenant-id>
```

```river
# Grafana Alloy
prometheus.remote_write "xscaler" {
  endpoint {
    url = "<write endpoint>"
    authorization {
      type        = "Bearer"
      credentials = "<api token>"
    }
    headers = { "X-Scope-OrgID" = "<tenant-id>" }
  }
}
```

The tenant ID is shown in the tenants list and on the tenant detail page.
