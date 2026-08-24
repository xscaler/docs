---
id: notifications
title: Notification Preferences
sidebar_label: Notification Preferences
slug: /portal/notifications
---

# Notification Preferences

xScaler emails you when usage crosses a threshold or ingestion gets throttled. Choose which notifications go out, and to whom, on the Settings page.

---

## Configure notification preferences

1. Go to **Settings** → **Notifications** in the sidebar.
2. Adjust the toggles and fields as needed.
3. Click **Save preferences**.

---

## Available settings

| Setting | Description |
|---------|-------------|
| **Email notifications** | Master switch. Turn off to stop all notification emails. |
| **Active series warning** | Email when your active series count approaches the plan limit. |
| **Active series throttled** | Email when new series are being rejected because the limit has been reached. |
| **Scrape interval throttled** | Email when xScaler detects an unsupported scrape interval and throttles it. |
| **Alternate email recipient** | Send notification emails to a different address (e.g. a team alias) instead of the account owner. |

---

## Notification types explained

### Active series warning

Fires when your organisation's total active series crosses a warning threshold, typically 80% of your plan limit. Check series growth before you reach the cap.

Resolved automatically when series count drops back below the threshold.

### Active series throttled

Triggered when your active series count reaches the plan limit and xScaler begins rejecting new series. Existing series continue to ingest normally; only new unique series are blocked.

**Action required:** Reduce series cardinality or [upgrade your plan](/portal/change-plan).

### Scrape interval throttled

Triggered when a tenant sends data at a scrape interval shorter than the minimum supported by your plan. xScaler throttles the ingestion rate to the supported minimum.

**Action required:** Increase the `scrape_interval` in your Prometheus or Alloy config to match your plan's minimum.

---

## In-portal notifications

Active notifications also show as a banner in the portal sidebar. The bell icon carries the active alert count; click it for the full list.

To see the full list of events that triggered or resolved a notification, check the [Activity log](/portal/activity) and filter by event type `notification.*`.
