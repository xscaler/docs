---
id: security
title: Security
sidebar_label: Security
---

# Security

*Last updated: May 2, 2026*

## 1. Overview

Security is a core priority at xScaler Labs. This page outlines the measures we take to protect the platform and your data.

---

## 2. Data in Transit

All data transmitted to and from the platform is encrypted using TLS 1.2 or higher. This applies to metric ingestion, query endpoints, and the management portal.

---

## 3. Data at Rest

Stored metrics and account data are encrypted at rest using industry-standard encryption.

---

## 4. Authentication

- API access requires bearer token authentication.
- Tokens are scoped per tenant and can be revoked at any time via the portal.
- See the [Authentication](/authentication) page for setup details.

---

## 5. Tenant Isolation

All customer data is logically isolated by tenant. Multi-tenant access controls ensure that one tenant cannot access another tenant's data.

---

## 6. Infrastructure Security

- The platform runs on hardened cloud infrastructure with network-level access controls.
- We apply regular security patches and updates to all system components.

---

## 7. Vulnerability Disclosure

If you discover a security vulnerability, please report it responsibly by emailing:
**[info@xscalerlabs.com](mailto:info@xscalerlabs.com)**

Please do not publicly disclose the vulnerability until we have had an opportunity to address it.

---

## 8. Compliance

We are committed to aligning with industry security best practices. For compliance-related questions, contact us directly.

---

## 9. Contact

For security inquiries, contact:
**[info@xscalerlabs.com](mailto:info@xscalerlabs.com)**
