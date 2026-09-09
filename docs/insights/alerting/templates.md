---
id: templates
title: Notification templates
sidebar_label: Templates
slug: /insights/alerting/templates
---

# Notification templates

Templates control the wording of notifications. Open
**Insights → Alerting → Templates**.

Two different things are templated in alerting, and they use different data:

| Where | Data | Covered in |
|-------|------|-----------|
| A rule's labels and annotations | The one series that fired | [Alert rules](/insights/alerting/alert-rules) |
| A contact point's title and message | The whole group of alerts being sent | This page |

Start with rule annotations. A good summary and a runbook URL fix most
notifications without a template anywhere.

## When you need one

Reach for a template when the default message is wrong for the destination
rather than wrong in general:

- A Slack title that leads with the environment.
- A PagerDuty summary that has to fit a paging screen.
- A webhook body a downstream system parses.
- The same wording reused across six contact points.

## Create one

**New template** takes a name and a definition. The name cannot be changed
after it is saved, so pick something you can live with: `slack.title`,
`pagerduty.summary`.

A definition is one or more named blocks:

```
{{ define "slack.title" }}
[{{ .Status }}] {{ .CommonLabels.alertname }} in {{ .CommonLabels.cluster }}
{{ end }}

{{ define "slack.body" }}
{{ len .Alerts.Firing }} firing, {{ len .Alerts.Resolved }} resolved

{{ range .Alerts.Firing }}
- {{ .Labels.instance }}: {{ .Annotations.summary }}
{{ end }}
{{ end }}
```

## Use one

In a contact point, put the template call in the field you want it to fill:

```
{{ template "slack.title" . }}
```

The fields that accept a template are marked in the contact point editor.
Title, subject and message fields all take one. See
[Contact points](/insights/alerting/contact-points).

## The data available

| Field | What it holds |
|-------|--------------|
| `.Status` | `firing` or `resolved` for the group |
| `.Receiver` | The contact point being delivered to |
| `.Alerts.Firing` | The firing alerts in this group |
| `.Alerts.Resolved` | The resolved alerts in this group |
| `.GroupLabels` | The labels this group was grouped by |
| `.CommonLabels` | Labels every alert in the group shares |
| `.CommonAnnotations` | Annotations every alert in the group shares |
| `.GroupKey` | The group's identity |

Each alert in `.Alerts.Firing` and `.Alerts.Resolved` carries:

| Field | What it holds |
|-------|--------------|
| `.Labels` | Every label on the alert, including `alertname` |
| `.Annotations` | Summary, description, runbook URL |
| `.StartsAt` | When it started firing |
| `.EndsAt` | When it resolved |

### Functions

Templates use Go template syntax: `range`, `if`, `with`, `len`, `index` and
`printf` all work. A label that does not exist renders as empty rather than as
an error, so a title referencing an absent label comes out short rather than
broken.

Use **Render preview** to confirm anything beyond those. It renders with the
same engine that delivers.

`.CommonLabels` is the field to understand. Anything in it is true of every
alert in the message, so it is safe to put in a title. A label that varies
across the group is missing from `.CommonLabels`, which is why a title built
from `.CommonLabels.instance` sometimes comes out blank.

## Test it

The right-hand panel renders the template against sample alerts. Pick a preset
and use **Render preview**.

| Preset | Sample |
|--------|--------|
| Firing alert | One critical alert |
| Resolved alert | One resolved alert |
| Multiple alerts | Two firing and one resolved, mixed severities |

Test all three. A template that reads `{{ (index .Alerts.Firing 0).Labels.instance }}`
renders on the firing preset and breaks on the resolved one, where there are no
firing alerts.

## When a template is broken

A template that fails to parse or render is delivered as its own source text,
so the notification arrives with `{{ template "slack.title" . }}` in it. That
is the signal to open the template and use **Render preview**.

## Provisioned templates

A template marked **Provisioned** is managed outside the portal and reads as
read-only.

## Delete one

Contact points referencing a deleted template fall back to the default
notification text. Nothing breaks, and the wording changes without warning, so
check which contact points use it first.

## Permissions

| Action | Role |
|--------|------|
| View and read templates | Member |
| Create, edit, render and delete them | Editor |
