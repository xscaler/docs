---
id: ai-security
title: Security
sidebar_label: Security
slug: /ai/security
---

# Security

A connection acts as one person and is bounded by that person's live role. Capabilities subtract from the role and never add to it, and both checks run on every call, so a demotion or a removed membership ends the connection's reach on the next call.

It is pinned to one organization and cannot read another, even one the same person belongs to.

MCP credentials and portal sessions carry different signing keys. The portal API refuses an MCP access token, and the MCP endpoint refuses a portal session.

Access tokens live 15 minutes. Refresh tokens rotate on every use, and xScaler keeps only their hashes. Presenting an old refresh token revokes the whole connection, and so does presenting an authorization code twice, because either one means a credential leaked.

No secret leaves through MCP. `list_contact_points` reports which settings are filled in, never a value, encrypted or not. No tool can decrypt anything, and no tool accepts a secret as input.

The write tools only create. Nothing deletes dashboards, rules or telemetry.

## Before you approve

**Log lines reach the model.** `logs:read` lets a client read matching log lines, and a log line contains whatever your applications write to it: request bodies, identifiers, stack traces. Where an environment carries other people's data or platform internals, connect the client with metrics and traces and leave logs out.

**Check the client yourself.** The name and address on the consent screen were supplied by whoever registered the application, and xScaler has not checked either. Approve a connection you started, from a client you installed. Refuse a consent screen that appears when you did not ask for one.
