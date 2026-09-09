---
id: alerting
title: Alerting
sidebar_label: Alerting
slug: /insights/alerting
---

# Alerting

Alert rules, routing and silences live in the portal; there is nothing to
install.

Open **Insights → Alerting**. Nine tabs, each deep-linkable.

## Alert rules

A rule is a query, a condition, and how long the condition has to hold.

The quickest way to create one is from a result you are already looking at.
**Create alert** on a metric or log query opens the editor with the expression
and data source filled in. The action appears on metric and log queries. The
alert model covers Prometheus and Loki, so trace queries do not offer it.

Use these before you save:

**Preview** runs the rule against current data and shows which series would
fire. It catches the condition that is inverted and the label that does not
exist.

**Backtest** runs the rule over a past window. Point it at the incident you are
writing the rule for and check the rule would have caught it. Point it at a
quiet week and check it would have stayed quiet.

Rules live in folders. Each rule shows its current state, its instances (one per
label set) and its state history.

## Active alerts

What is firing now, grouped the way your notification policy groups it. From
here you can silence a group without leaving the page.

## Contact points

Where notifications go. Each integration type has its own fields, and the form
is built from the schema the platform reports, so it stays in step with what is
actually supported.

**Test** sends a notification through the contact point before you depend on it.
Do this when you create one. A misconfigured webhook is silent otherwise.

## Notification policies

The routing tree. A policy matches alert labels and hands the alert to a contact
point, with grouping, timing and nested policies for the exceptions.

Route by label rather than by rule, so a new rule with `team=payments` is routed
correctly the day it is written.

## Silences

Stop notifications for alerts matching a set of label matchers, for a fixed
window. Use silences for the outage you already know about.

## Mute timings

Recurring windows during which a policy does not notify. Use these for known
maintenance schedules and out-of-hours routing.

## Inhibition rules

Suppress one alert while another is firing. This is how you stop a hundred
"service unreachable" alerts arriving behind the one "cluster down" alert that
explains them.

## Templates

Named notification templates for the text that reaches people. **Test** renders
a template against sample alert data, so you can see the output before an
incident does.

## Settings

Choose which Alertmanager handles routing:

| Option | What it means |
|--------|---------------|
| Built-in | The Alertmanager bundled with the platform. Two replicas, lease-based HA, managed for you |
| External | Forward alerts to your own Alertmanager instances. You manage routing and HA |

The settings tab also carries two things worth checking after any change:

**Delivery attempts** shows recent notification deliveries and their status, so
"did that page actually go out" has an answer.

**Config history** lists previous Alertmanager configurations and restores any
one of them. If a routing edit broke notifications, roll back here.

## Alerting from your own Grafana

Grafana's own alerting still works against xScaler data sources. See
[Alerts in your own Grafana](/rules-and-alerts).
