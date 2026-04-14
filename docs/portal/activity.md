---
id: activity
title: Activity Log
sidebar_label: Activity Log
slug: /portal/activity
---

# Activity Log

The Activity log is an audit trail of every action taken in your organisation — tenant changes, API key operations, billing events, and system notifications. Use it to track who did what and when.

---

## View the activity log

1. Go to **Activity** in the sidebar.
2. All recent events are listed in reverse chronological order.
3. Click any row to open a detail panel with the full event record.

---

## Filter events

Use the filter bar at the top to narrow results:

| Filter | Options |
|--------|---------|
| **Search** | Free-text search on event summary or target |
| **Event type** | Select a specific event type from the dropdown |
| **Tenant** | Filter to events affecting a specific tenant |

Click **Clear filters** to reset.

Use **Load more** at the bottom of the list to page through older events.

---

## Event detail panel

Click any row to see the full event record:

| Field | Description |
|-------|-------------|
| **Timestamp** | When the event occurred |
| **Result** | Success or Failed |
| **Target** | The resource affected (tenant ID, API key ID, etc.) |
| **Metadata** | Additional context (e.g. display name, IP address) |
| **Before state** | Resource state before the action (where available) |
| **After state** | Resource state after the action (where available) |

---

## Event reference

| Event | Triggered when |
|-------|---------------|
| `tenant.created` | A new tenant is created |
| `tenant.metadata_updated` | Tenant display name or environment is edited |
| `tenant.suspended` | A tenant is suspended |
| `tenant.activated` | A suspended tenant is resumed |
| `api_key.created` | A new API key is created for a tenant |
| `api_key.rotated` | An API key is rotated |
| `api_key.revoked` | An API key is revoked |
| `notification.active_series_warning.triggered` | Active series count crossed the warning threshold |
| `notification.active_series_warning.resolved` | Series count dropped back below the warning threshold |
| `notification.active_series_throttled.triggered` | Series limit reached — new series are being rejected |
| `notification.active_series_throttled.resolved` | Series count is back within limit |
| `notification.scrape_interval_throttled.triggered` | Scrape interval is below plan minimum and is being throttled |
| `notification.scrape_interval_throttled.resolved` | Scrape interval throttling has lifted |
| `auth.workos_exchange.failed` | A login attempt failed at the authentication provider |
