---
id: suspend-tenant
title: Suspend and Resume a Tenant
sidebar_label: Suspend & Resume Tenant
slug: /portal/suspend-tenant
---

# Suspend and Resume a Tenant

Suspending a tenant blocks its writes and queries without deleting it. xScaler keeps the existing metric data. Resume the tenant whenever you want the access back.

Use suspension to:
- Temporarily cut off a decommissioned environment
- Block a tenant that is causing runaway series growth
- Pause ingestion during maintenance

---

## Suspend a tenant

**From the tenant list:**

1. Go to **Tenants** in the sidebar (under **Organization**).
2. Find the tenant you want to suspend.
3. Click the **···** (more) menu on the right side of the tenant row.
4. The action panel opens on the right. Click **Suspend tenant**.
5. Confirm the action when prompted.

The tenant status changes to **Suspended** (amber badge). xScaler rejects `remote_write` requests for this tenant until you resume it.

**From the tenant detail page:**

1. Go to **Organization** → **Tenants** → click the tenant name.
2. Click the **Suspend tenant** button in the top-right corner (amber).
3. Confirm the action.

---

## Resume a tenant

**From the tenant list:**

1. Go to **Tenants** in the sidebar (under **Organization**).
2. Find the suspended tenant (filter by **Suspended** status if needed).
3. Click the **···** (more) menu on the right side of the row.
4. In the action panel, click **Resume tenant** (green button).

**From the tenant detail page:**

1. Go to **Organization** → **Tenants** → click the tenant name.
2. Click **Resume tenant** in the top-right corner (green).

The tenant status returns to **Active** and ingestion resumes immediately.

---

## What happens to data during suspension

| | During suspension |
|--|--|
| Inbound `remote_write` | Rejected (HTTP 403) |
| Queries | Blocked |
| Stored metric data | Retained: no data is deleted |
| API tokens | Remain valid: they work again once resumed |
| Series count | Preserved |

---

## Audit trail

The [Activity log](/portal/activity) records every suspension and resumption. The events `tenant.suspended` and `tenant.activated` include the timestamp and the user who performed the action.
