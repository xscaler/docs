---
id: ai-protocol
title: Protocol reference
sidebar_label: Protocol reference
slug: /ai/protocol
---

# Protocol reference

What a client has to speak to reach xScaler, for anyone writing one or debugging one that will not connect. A client that already supports remote MCP servers needs none of this.

## Endpoints

| Purpose | URL |
|---|---|
| MCP endpoint | `https://mcp.xscalerlabs.com/mcp` |
| Protected-resource metadata | `https://mcp.xscalerlabs.com/.well-known/oauth-protected-resource` |
| Authorization server metadata | `https://api.xscalerlabs.com/.well-known/oauth-authorization-server` |
| Dynamic client registration | `https://api.xscalerlabs.com/oauth/register` |
| Authorization | `https://api.xscalerlabs.com/oauth/authorize` |
| Token | `https://api.xscalerlabs.com/oauth/token` |
| Revocation | `https://api.xscalerlabs.com/oauth/revoke` |

The authorization server and the protected resource sit on different hosts, which is what the protected-resource document exists to tell a client. Every token names `https://mcp.xscalerlabs.com/mcp` as its audience, and the audience check is character for character.

## What a client has to support

| | |
|---|---|
| Transport | Streamable HTTP. Sessions are stateless, so there is no session header to carry |
| Authorization | OAuth 2.1, authorization code grant with PKCE. `S256` only |
| Registration | RFC 7591 dynamic client registration. Client secrets are optional, and both `none` and `client_secret_basic` work |
| Discovery | RFC 8414 and RFC 9728. xScaler serves both `/.well-known/oauth-protected-resource` and `/.well-known/oauth-protected-resource/mcp`, since clients disagree about which to fetch |
| Redirect URIs | `https`, or `http` on the literal loopback address `127.0.0.1` or `[::1]`. `localhost` is refused, because it resolves through DNS and can be rebound. Matching is exact, except that a loopback port may vary. At most 5 per client |
| Other | xScaler honours the `resource` parameter and returns `iss` on the authorization redirect |

Insufficient capability comes back as an error inside a successful JSON-RPC response rather than as HTTP 403, so the model can read what it was refused and say so. An invalid token still gets HTTP 401 with a `WWW-Authenticate` header, which is how a client knows to run the flow again.
## Lifetimes

| | |
|---|---|
| Consent screen | 10 minutes to finish |
| Authorization code | 2 minutes, single use |
| Access token | 15 minutes |
| Refresh token | 30 days idle, rotated on every use |
| Connection | 180 days, then the client asks again |
