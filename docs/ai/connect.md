---
id: ai-connect
title: Connect a client
sidebar_label: Connect a client
slug: /ai/connect
---

# Connect a client

Add `https://mcp.xscalerlabs.com/mcp` as an MCP server in the client. Whoever adds it signs in through the browser and picks what it may do. There is no API key to create and nothing to paste into the client.

## Before you start

| | |
|---|---|
| **Client** | Any MCP client that supports a remote server over Streamable HTTP with OAuth |
| **Account** | Membership of an xScaler organization, able to sign in at [portal.xscalerlabs.com](https://portal.xscalerlabs.com) |
| **Data** | At least one environment receiving telemetry |

The client registers itself and obtains its own credentials during the browser flow, so there is nothing to create in the portal first.

## Claude Code

```bash
claude mcp add --transport http xscaler https://mcp.xscalerlabs.com/mcp
```

Run `/mcp` in Claude Code and choose **Authenticate**. Your browser opens the xScaler consent screen. Approve it and the tools appear.

## Claude Desktop and claude.ai

Go to **Settings → Connectors → Add custom connector**, paste the address, and click **Connect**. The consent screen opens in the same browser session.

## Cursor

Add the server to `~/.cursor/mcp.json` for every project, or `.cursor/mcp.json` for one:

```json
{
  "mcpServers": {
    "xscaler": {
      "url": "https://mcp.xscalerlabs.com/mcp"
    }
  }
}
```

## VS Code

Add the server to `.vscode/mcp.json`:

```json
{
  "servers": {
    "xscaler": {
      "type": "http",
      "url": "https://mcp.xscalerlabs.com/mcp"
    }
  }
}
```

## Any other client

The address is the only thing a client needs. It discovers everything else from there. The client fetches `https://mcp.xscalerlabs.com/.well-known/oauth-protected-resource`, learns that the authorization server is `https://api.xscalerlabs.com`, registers itself there, and runs the authorization code flow with PKCE. See [Protocol reference](/ai/protocol) for the endpoints and the rules a client has to satisfy.

---

## What you approve

The consent screen names the client, the organization, and each capability as a tick box.

**The client's name is self-asserted.** Whoever registered the application chose it, xScaler has not checked it, and the screen says so with an **Unverified** badge. The address the client supplied is shown as text and never as a link.

**The connection is pinned to one organization** and covers every environment in it. When you belong to more than one, pick one on the consent screen. To reach a second organization, connect the client again and pick that one; both connections then live side by side.

**Untick anything you do not want the client to do.** Capabilities that make changes sit in their own group under **Makes changes**. Capabilities your role cannot grant appear on the screen and cannot be ticked.

A connection lasts 180 days, after which the client asks again.

---

## Validate the connection

1. Ask the client to list its tools. A connected client shows the tools your capabilities allow, not all 25.
2. Ask "which environments does this organization have?" The agent calls `list_telemetry_sources` and comes back with environment names and the signals each one holds.
3. Ask for something real, such as "what is the request rate in production over the last hour?" The answer carries exact statistics and a link into the portal. Open the link and check the numbers match.

An answer that names no environment, or a client that lists no tools, is covered in [Troubleshooting](/ai/troubleshooting).

See [Capabilities](/ai/capabilities) for the role each one needs, and
[Manage connections](/ai/manage) for what the portal shows you.
