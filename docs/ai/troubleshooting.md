---
id: ai-troubleshooting
title: Troubleshooting
sidebar_label: Troubleshooting
slug: /ai/troubleshooting
---

# Troubleshooting

What each symptom means, and what to do about it.

## The client keeps asking you to authenticate

The access token expired and the refresh token was rejected, or somebody disconnected the connection in the portal. Re-authenticate in the client and it runs the browser flow again. A connection also expires on its own after 180 days.

## The client lists no tools, or the endpoint returns HTTP 503

MCP is switched off for the deployment. The portal's AI clients page reads `AI clients are not enabled on this deployment yet` in the same case. Contact support.

## A tool is refused for insufficient capability

Either the capability was never ticked on the consent screen, or your role does not carry the permission behind it. Reconnect and tick it, or ask an administrator to raise your role. [Capabilities](/ai/capabilities) lists the minimum role for each one.

## The agent cannot resolve the environment

`there is no environment called ...` means the name matches nothing in this organization. `name the environment` means several environments carry that signal, so there is nothing to infer. Both are fixed the same way: call `list_telemetry_sources` and pass a name from it.

## The answer holds less than you asked for

Fewer series than you expected means the series cap fired. Aggregate in the query, for example with `topk(5, ...)`. A window shorter than the one you asked for means the range cap fired, which is 31 days for metrics, 7 days for logs and 24 hours for traces. The answer names both cases under **What was left out**. See [Limits](/ai/limits).

## The oldest log line is not the oldest line there is

`query_logs` returns the newest lines first. Pass `order=oldest` to read from the other end of the window, which is the only way to find when something began.

## An empty answer reports `confidence: unverified`

The store answered successfully with nothing in it, and success there does not prove there was nothing to return. Read the notice on the answer. It names what else produces that result, such as a metrics generator that is down.

## Calls start being refused during a long investigation

The per-connection burst is spent. It refills at about one cheap call a second, so waiting is the fix. See [Limits](/ai/limits).

## The client cannot discover the server

xScaler serves both spellings of the protected-resource document, so a discovery failure is usually on the client side. Check that it supports OAuth dynamic client registration and PKCE. [Protocol reference](/ai/protocol) lists everything a client has to support.
