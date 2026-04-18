---
id: change-plan
title: Change Your Plan
sidebar_label: Change Plan
slug: /portal/change-plan
---

# Change Your Plan

You can upgrade or downgrade your xScaler subscription from the Billing page. Plan changes take effect immediately for upgrades and at the end of the current billing period for downgrades.

---

## Available plans

| Plan | Active series | Retention | SLA | Price |
|------|--------------|-----------|-----|-------|
| **Free** | Up to 10K | Limited | — | $0/mo |
| **Scale** | Up to 20K | Up to 90 days | 99.9% | $19/mo + usage |
| **Enterprise** | Custom | Up to 1 year | 99.99% | Contact sales |

---

## Upgrade your plan

1. Go to **Billing** in the sidebar.
2. Find the plan card you want to upgrade to.
3. Click **Switch and upgrade**.
4. You are redirected to Stripe checkout to complete the payment.
5. After payment, the new plan is active immediately.

:::tip Trial users
If you are on a trial, you can end the trial early and start paying by clicking **End trial** on your current plan card, or by clicking **Switch and upgrade** on a higher plan.
:::

---

## Downgrade your plan

1. Go to **Billing** in the sidebar.
2. Find the lower plan card.
3. Click **Switch and downgrade** (shown in amber to indicate a reduction in limits).
4. You are redirected to Stripe to confirm the change.
5. The downgrade takes effect at the end of your current billing period.

:::warning Check your series count before downgrading
If your current active series count exceeds the limit on the new plan, ingestion will be throttled after the downgrade takes effect. Check your current usage on the [Overview](/portal/tenant-usage) page first.
:::

---

## Manage billing details

To update payment method, view invoices, or cancel your subscription:

1. Go to **Billing** in the sidebar.
2. Click **Manage billing** in the top-right corner.
3. You are redirected to the Stripe billing portal.

From the Stripe portal you can:
- Update credit card details
- Download past invoices
- Cancel your subscription

---

## Reactivate after cancellation

If you have scheduled a cancellation (`Cancel at period end`), you can reverse it before the effective date:

1. Go to **Billing** in the sidebar.
2. Your current plan card shows a **Reactivate in billing portal** button.
3. Click it and confirm reactivation in the Stripe portal.

---

## Enterprise plan

Enterprise plans are not available via self-serve checkout. To discuss a custom plan:

1. Go to **Billing** in the sidebar.
2. In the **Enterprise** plan card, fill in the contact form and click **Contact sales**.
3. The xScaler team will respond within one business day.

Alternatively, email [founders@xscalerlabs.com](mailto:founders@xscalerlabs.com).

---

## Soft-lock state

If your payment fails or the trial expires without a payment method on file, your organisation enters **soft-lock** state. In this state:

- All `remote_write` requests are rejected.
- Queries continue to work so you can still read existing data.
- A warning banner is shown across the portal.

To restore write access, go to **Billing** and update your payment method or upgrade to a paid plan.
