---
id: portal
title: Portal
sidebar_label: Overview
slug: /portal
---

# xScaler Portal

The xScaler portal is the control plane for your organisation. From here you create and manage tenants, monitor usage, rotate credentials, configure alerts, and manage your subscription.

**URL:** [portal.xscalerlabs.com](https://portal.xscalerlabs.com)

---

## Navigation

The sidebar is grouped into sections:

### Workspace

Each signal has its own page with two tabs — **Overview** (live dashboard) and **Tenants** (tenant list).

| Section | What you do here |
|---------|-----------------|
| **Metrics** | Metrics Overview + Tenants — series usage, DPM, query load, per-tenant capacity |
| **Logs** *(Beta)* | Logs Overview + Tenants — ingest rate, GB ingested, discards, per-tenant usage |
| **Traces** *(Beta)* | Traces Overview + Tenants — span ingest rate, GB ingested, discards, per-tenant usage |
| **Grafana** | Access your managed Grafana instance |

### Insights *(admins only)*

| Section | What you do here |
|---------|-----------------|
| **Activity** | Audit log of every action taken in the portal |

### Organization *(admins only)*

| Section | What you do here |
|---------|-----------------|
| **Tenants** | Create, view, suspend, and manage individual tenants |
| **Billing** | View your current plan, upgrade, downgrade, or manage payment |
| **Settings** | Organisation name and workspace details |
| **Notifications** | Email alert preferences |

### Account

| Section | What you do here |
|---------|-----------------|
| **Profile & privacy** | Manage your user profile and privacy settings |
| **Contact us** | Raise and track support tickets |

---

## Key concepts

**Organisation** — your top-level account. One organisation maps to one workspace (region + cluster).

**Tenant** — an isolated metrics namespace within your organisation. Each tenant has its own series quota, API token, and write endpoint. Use tenants to separate environments (production, staging) or teams.

**API token** — a bearer token scoped to a single tenant. Used in the `Authorization` header of every `remote_write` and query request alongside `X-Scope-OrgID`.

**Plan** — your subscription tier (Pro / Scale / Enterprise). The plan sets the series limit, retention, and SLA for the entire organisation.
