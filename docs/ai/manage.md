---
id: ai-manage
title: Manage connections
sidebar_label: Manage connections
slug: /ai/manage
---

# Manage connections

Open **Administration → AI clients** in the portal. The page needs the same permission as API keys, so administrators and owners can see it.

The table lists every connection against the organization, who authorized it, what it can do, when it was connected and when it was last used. The address to hand out is at the top of the page.

| Action | What it does |
|---|---|
| **Rename** | Give the connection a name you recognise. The client's own name is self-asserted, so renaming is worth doing |
| **Take capability away** | Untick capabilities. You can only narrow, so adding one back means the client asks again through a fresh consent screen |
| **Disconnect** | Revokes the connection. The next call it makes fails, and the client has to run the browser flow again |

Revocation applies at once. Every call re-reads the connection from the database, so an access token already in the client's hands stops working the moment it is next used.

Removing the server from the client's own configuration stops the client using it. The authorization stays until you revoke it here, the client revokes it itself, or it reaches 180 days.

---

## Audit trail

The [Activity log](/portal/activity) carries every change an agent makes, filed under the `mcp` category alongside the consent and revocation events. In the portal it is **Administration → Audit**.| Event | Recorded when |
|---|---|
| `mcp.consent.granted` | Somebody approved a connection |
| `mcp.consent.denied` | Somebody refused one |
| `mcp.tool.invoked` | An agent made a change, naming the tool, the connection and the client |
| `mcp.grant.revoked` | A connection was disconnected, or the membership behind it went away |
| `mcp.authorization_code.replayed` | An authorization code was presented twice, which revokes the connection |
| `mcp.refresh_token.reused` | An old refresh token was presented, which revokes the connection |

The audit log records changes only. Ongoing use shows in the **Last used** column on the AI clients page.
