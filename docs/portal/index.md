---
id: portal
title: Portal
sidebar_label: Overview
slug: /portal
---

# xScaler Portal

The xScaler portal is the control plane for your organisation. From here you create and manage tenants, monitor usage, rotate credentials, configure alerts, and manage your subscription.

**URL:** [app.xscalerlabs.com](https://app.xscalerlabs.com)

---

## Navigation

The sidebar gives you access to every section of the portal:

| Section | What you do here |
|---------|-----------------|
| **Overview** | Live metrics across all tenants — series, ingestion rate, query health |
| **Tenants** | Create, view, suspend, and manage individual tenants |
| **Activity** | Audit log of every action taken in the portal |
| **Billing** | View your current plan, upgrade, downgrade, or manage payment |
| **Settings → General** | Organisation name and workspace details |
| **Settings → Notifications** | Email alert preferences |
| **Help & Support** | Raise and track support tickets |

---

## Key concepts

**Organisation** — your top-level account. One organisation maps to one workspace (region + cluster).

**Tenant** — an isolated metrics namespace within your organisation. Each tenant has its own series quota, API token, and write endpoint. Use tenants to separate environments (production, staging) or teams.

**API token** — a bearer token scoped to a single tenant. Used in the `Authorization` header of every `remote_write` and query request alongside `X-Scope-OrgID`.

**Plan** — your subscription tier (Pro / Scale / Enterprise). The plan sets the series limit, retention, and SLA for the entire organisation.
