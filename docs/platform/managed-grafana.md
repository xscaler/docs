---
id: managed-grafana
title: Managed Grafana
sidebar_label: Managed Grafana
slug: /platform/managed-grafana
---

# Managed Grafana

xScaler can run a Grafana instance for your organisation, in a region you pick,
with your xScaler datasources already wired up.

Reach for this when you want Grafana itself, with its plugin ecosystem and its
own permission model, and you do not want to operate it. For reading your own
telemetry, [Insights](/insights) is already there and needs no setup.

Open **Grafana → Managed Grafana** in the [portal](https://portal.xscalerlabs.com).

:::info[Paid plans]
Managed Grafana needs a Scale or Enterprise plan. On the Free plan the API
answers `402` and the portal shows an upgrade prompt. See
[Change plan](/portal/change-plan).
:::

## Enable an instance

1. Choose a **region**. It fixes where the instance runs.
2. Add **SSO providers**, optional at this point and editable later.
3. Pick **plugins** from the catalogue.
4. Submit.

Provisioning moves through `pending`, `provisioning`, then `ready`, and the
status panel shows which. A failure reports a status message rather than
stalling silently.

Once ready, the panel shows the instance URL.

## Sign-in

### Admin account

The instance has an admin account. Its password is stored encrypted and can be
revealed in the portal when you need it, or rotated. Rotate it after anyone with
access leaves.

### SSO

Five provider types:

| Provider | Notes |
|----------|-------|
| Generic OIDC | Any compliant identity provider. Set the issuer yourself |
| Google | |
| GitHub | Restrict by organisation with allowed orgs |
| Azure AD | Set the directory tenant ID |
| Okta | |

Per provider you configure the client ID and secret, scopes, allowed email
domains, and a role attribute path that maps a claim to a Grafana role. The
client secret is write-only: once saved, the portal reports only that a secret
is stored.

## Settings

The defaults are closed. Self-signup, anonymous access, public dashboards,
external snapshots and embedding are all off until you turn them on.

| Group | What you control |
|-------|------------------|
| Branding | Theme, language, default home dashboard |
| Org policy | Allow sign-up, the role new users get, whether viewers can edit and editors can administer |
| Anonymous access | Off by default. When on, the role anonymous visitors get |
| Sessions | Maximum inactive time and maximum lifetime |
| Dashboards | Minimum refresh interval, how many versions to keep |
| Sharing | External snapshots, public dashboards, embedding in other pages |
| SMTP | Host, user, password, from address and name, StartTLS, certificate verification |

Configure SMTP if you want Grafana to send email, for alert notifications or
invitations. Leave `skip_verify` off unless you are pointing at an internal
relay with a private certificate authority.

## Plugins

Pick plugins from the catalogue when you enable the instance, and change the
selection later. Only catalogue plugins can be installed, which is what keeps
the instance supportable.

## Scaling

`replicas` sets how many Grafana replicas run. Raise it for a large read
audience.

## Disable

Disabling deletes the instance. Dashboards, users and settings inside it go with
it. Your telemetry is untouched, since it never lived in Grafana.

Export anything you want to keep first. A dashboard JSON model can be imported
into [Insights](/insights/dashboards) afterwards.

## Connecting a Grafana you run yourself

If you already operate Grafana, add xScaler as datasources instead. See
[Connect Grafana datasources](/grafana-datasources).
