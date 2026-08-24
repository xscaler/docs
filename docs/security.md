---
id: security
title: Security
sidebar_label: Security
---

# Security

*Last updated: May 2, 2026*

## 1. Overview

This page lists the controls that protect the platform and your data.

---

## 2. Data in transit

The platform encrypts all traffic with TLS 1.2 or higher: metric ingestion, query endpoints, and the management portal.

---

## 3. Data at rest

We encrypt stored metrics and account data at rest.

---

## 4. Authentication

- API access requires bearer token authentication.
- Tokens are scoped per tenant and can be revoked at any time via the portal.
- See the [Authentication](/authentication) page for setup details.

---

## 5. Tenant isolation

We isolate customer data by tenant. Access controls stop one tenant from reading another tenant's data.

---

## 6. Infrastructure security

- The platform runs on hardened cloud infrastructure with network-level access controls.
- We apply regular security patches and updates to all system components.

---

## 7. Vulnerability disclosure

If you discover a security vulnerability, please report it responsibly by emailing:
**[info@xscalerlabs.com](mailto:info@xscalerlabs.com)**

Please do not publicly disclose the vulnerability until we have had an opportunity to address it.

---

## 8. Compliance

We follow industry security best practices. For compliance questions, contact us directly.

---

## 9. Contact

For security inquiries, contact:
**[info@xscalerlabs.com](mailto:info@xscalerlabs.com)**
