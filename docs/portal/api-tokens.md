---
id: api-tokens
title: Manage API Tokens
sidebar_label: Manage API Tokens
slug: /portal/api-tokens
---

# Manage API Tokens

API tokens (access keys) authenticate `remote_write` and query requests for a specific tenant. Each token is scoped to one tenant and must be sent as a Bearer token in the `Authorization` header alongside `X-Scope-OrgID`.

---

## View API tokens for a tenant

1. Go to **Tenants** in the sidebar.
2. Click the tenant name.
3. Scroll to the **API keys** section at the bottom of the detail page.

The table shows each key's name, status, last used time, and creation date.

---

## Create a new API token

1. Open the tenant detail page (Tenants → click tenant name).
2. In the **API keys** section, click **New key**.
3. Enter a **name** for the key (e.g. `prometheus-prod`, `alloy-staging`).
4. Click **Create**.
5. Copy the token immediately — it is only shown once.

:::warning Token shown once
The full token value is displayed only at creation time. Store it securely (e.g. in a secrets manager or Kubernetes secret). If you lose it, rotate the key.
:::

---

## Rotate an API token

Rotating a key generates a new token and invalidates the old one. Do this if a token may have been exposed, or as part of a regular credential rotation policy.

1. Open the tenant detail page (Tenants → click tenant name).
2. In the **API keys** table, find the key to rotate.
3. Click the **rotate** icon (circular arrow) on that row.
4. Copy the new token — it is only shown once.
5. Update your `remote_write` config with the new token before the old one is invalidated.

:::tip Zero-downtime rotation
Update your metrics collector config with the new token **before** closing the rotation dialog. The old token is invalidated as soon as you confirm.
:::

---

## Revoke an API token

Revoking permanently deletes a token. Requests using that token will receive HTTP 401 immediately.

1. Open the tenant detail page (Tenants → click tenant name).
2. In the **API keys** table, find the key to revoke.
3. Click the **revoke** icon (trash / X) on that row.
4. Confirm the action.

The key is removed from the list and is no longer usable.

---

## Using a token in your collector

Every request to xScaler requires both headers:

```yaml
# Prometheus
remote_write:
  - url: https://euw1-01.m.xscalerlabs.com/api/v1/push
    authorization:
      credentials: <token>
    headers:
      X-Scope-OrgID: <tenant-id>
```

```river
# Grafana Alloy
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

---

## Audit trail

All token operations are logged in the [Activity log](/portal/activity):

| Event | Triggered by |
|-------|-------------|
| `api_key.created` | New key created |
| `api_key.rotated` | Key rotated |
| `api_key.revoked` | Key revoked |
