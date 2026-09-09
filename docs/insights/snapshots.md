---
id: snapshots
title: Snapshots
sidebar_label: Snapshots
slug: /insights/snapshots
---

# Snapshots

A snapshot freezes the data a dashboard is showing right now and gives it its
own link. Whoever opens it sees exactly what you saw, without needing to know
the time range you had set.

Open **Insights → Snapshots**.

## Take one

From a dashboard, open the actions menu and choose **Snapshot**. Give it a name
you will recognise in a list six months from now. "Checkout latency, 14:20
incident" beats "Snapshot 3".

Set an expiry, or leave it off. With no expiry the snapshot stays until someone
deletes it, which is what you want for anything a postmortem will link to.

## What is in it

The stored data, not a live query. A snapshot does not re-run anything, so it
keeps working after the dashboard changes, after the retention window passes,
and after the dashboard is deleted.

## Find one again

The snapshots list is organisation-wide and lives on its own route rather than
inside one dashboard. A snapshot outlives the dashboard it came from, so a list
scoped per dashboard would hide exactly the orphans people come here looking
for.

Each row shows the name, who took it, when, and its expiry. Newest first.

## Delete one

Delete from the row. Snapshot data is stored, so delete the ones you no longer
need rather than letting them accumulate.

:::warning[A snapshot is a copy]
The link opens for anyone signed in to your organisation, and it shows the data
as captured. Take that into account before snapshotting a dashboard that
displays customer identifiers.
:::
