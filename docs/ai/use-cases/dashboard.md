---
id: ai-uc-dashboard
title: "Build a dashboard by describing it"
sidebar_label: "Build a dashboard"
slug: /ai/use-cases/dashboard
---

# Build a dashboard by describing it

> A new service went live and it has no dashboard. Nobody wants to spend an afternoon wiring panels.

## Prerequisites

- A connected client with `dashboards:write`. That needs the editor role or above, because capabilities only subtract from your role. See [Capabilities](/ai/capabilities).

## Step 1: Describe the panels

Ask:

```text
Build a dashboard for the checkout service in production: request rate,
error rate, and p95 latency.
```

```text
Created "Checkout service" with 3 panels.
uid ae91f0c4d, reading production

Open in xscaler: https://portal.xscalerlabs.com/acme/insight/dashboarding/ae91f0c4d
```

Each panel is a title, a query and how to draw it. The layout, the schema version and which store each panel queries are worked out server-side, so a described panel arrives wired up rather than blank.

**It always creates.** No tool overwrites a dashboard, so calling this twice with the same title leaves two dashboards and never replaces one somebody else owns. Fixing a panel means editing the dashboard in the portal, or creating a new one and deleting the old one yourself.

## Step 2: File it somewhere

Ask:

```text
What dashboard folders exist? Put it in the one for platform services.
```

The agent calls `list_dashboard_folders` first, because a folder is named by uid rather than by label. Ask for the folder in the first prompt and it does both in one turn.

## Step 3: Import an export instead

For a dashboard that already exists, paste the JSON:

```text
Import this dashboard into production. [paste the grafana.com export]
```

```text
Imported "Kubernetes / Compute Resources / Namespace (Pods)" with 12 panels.
uid 7b31c9f2e, reading production
Datasource inputs were filled in from production: DS_PROMETHEUS.
The uid in the document was dropped, so this is a new dashboard.
```

Both schemas are accepted, the classic one with a top-level `panels` array and the resource one with a `kind` and a `spec`. An export that declares its datasources as inputs gets them filled in from the environment you name, so a downloaded dashboard draws something instead of arriving with every panel empty.

## Refine the result

- "Add a panel for the redis command duration."
- "What panels are on the dashboard called Checkout service?"
- "Make a copy that reads staging instead."

## Which tool did what

| Step | Tool | What it does |
|---|---|---|
| 2 | `list_dashboard_folders` | Returns the folders and their uids |
| 1 | `create_dashboard` | Builds the layout, the schema and the datasource wiring from described panels |
| 3 | `import_dashboard` | Accepts either schema, fills the declared datasource inputs, drops the document's uid |
| | `get_dashboard` | Summarises a dashboard's panels and their queries, rather than returning the stored document |

## Next steps

- [Create an alert rule and check it first](/ai/use-cases/alert-rule)
- [Check what changed after a deploy](/ai/use-cases/after-a-deploy)
