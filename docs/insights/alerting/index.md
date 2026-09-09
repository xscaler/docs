---
id: alerting
title: Alerting
sidebar_label: Overview
slug: /insights/alerting
---

# Alerting

Alerting runs rules against your metrics and logs and notifies people when a
condition holds. Rules, routing, contact points and silences all live in the
portal, so there is nothing to install and nothing to connect.

Open **Insights → Alerting**. Nine pages sit under it, each with its own link
you can bookmark or paste into a ticket.

## Start here

Three things have to be true before an alert reaches a person:

1. **A contact point exists.** Somewhere to send to: a Slack channel, a
   PagerDuty service, an inbox. See [Contact points](/insights/alerting/contact-points).
2. **The default notification policy points at it.** A fresh organization
   routes to a placeholder that delivers nowhere. See
   [Notification policies](/insights/alerting/notification-policies).
3. **A rule fires.** A query, a threshold, and how long the threshold has to
   hold. See [Alert rules](/insights/alerting/alert-rules).

Do them in that order and the first rule you write notifies somebody. Do them
in the other order and the rule fires into nothing.

## The pages

| Page | What you do there |
|------|-------------------|
| [Alert rules](/insights/alerting/alert-rules) | Write the conditions that generate alerts |
| [Active alerts](/insights/alerting/monitor) | See what is firing now and silence it |
| [Contact points](/insights/alerting/contact-points) | Slack, email, PagerDuty, webhooks |
| [Notification policies](/insights/alerting/notification-policies) | Decide which alert reaches which contact point |
| [Silences](/insights/alerting/suppress) | Stop notifications for a while |
| [Mute timings](/insights/alerting/suppress) | Recurring quiet windows |
| [Inhibition rules](/insights/alerting/suppress) | Hide the symptoms behind a cause |
| [Templates](/insights/alerting/templates) | Change the wording of notifications |
| [Settings](/insights/alerting/monitor) | Delivery history and configuration rollback |

## Reading the docs

**[How alerting works](/insights/alerting/how-it-works)** is worth ten minutes
before you write your first rule. It covers the path from a query to a
notification, and the states a rule moves through on the way.

**[Notifications are not arriving](/insights/alerting/troubleshooting)** is the
page to open when a rule says Firing and nobody was told.

**[Coming from Grafana Alerting](/insights/alerting/grafana)** maps what you
already know onto what is here.

## Who can change what

| Role | Alerting |
|------|----------|
| Member | Reads everything. Changes nothing |
| Editor | Writes rules, contact points, policies, silences, mute timings, inhibition rules and templates |
| Admin | Everything an editor can do, plus reading stored contact point secrets back |
| Owner | Everything |

Controls you cannot use are hidden rather than disabled, so a member sees the
alerting pages with the read-only view of each one.

## Alerting from an AI assistant

The xScaler MCP server can list rules, check a rule against current data before
it is saved, create a rule, and pause one. See
[Tool reference](/ai/tools) and
[Create an alert rule](/ai/use-cases/alert-rule).

## Your own Grafana

Grafana's alerting engine works against xScaler data sources, and existing rules
keep running. See [Alerts in your own Grafana](/rules-and-alerts).
