# Privacy Policy

**Last updated:** 2026-02-28

> This document describes how CodeRail Flow handles personal data and operational data.
> It is a technical privacy policy baseline and may require legal review before production use.

---

## 1. Scope

This policy applies to CodeRail Flow services, including:

- Web application
- API services
- Workflow execution services
- Integrations (for example Slack, GitHub, GitLab, webhook)

---

## 2. Data We Process

### 2.1 Account and identity data

- User identifiers (for example Clerk subject IDs)
- Email addresses (when provided by identity provider)
- Team/organization identifiers

### 2.2 Workflow and execution data

- Flow definitions and versions
- Run metadata (status, timestamps, errors)
- Step execution details
- Generated artifacts (for example screenshots, logs)

### 2.3 Integration and configuration data

- Integration configuration payloads
- API key metadata (key prefix, scope, creation time)
- Delivery metadata for webhook/integration attempts

### 2.4 Security and audit data

- Mutation audit logs (who did what, when, and target resource)
- Security-relevant request metadata

---

## 3. Why We Process Data

We process data to:

- Authenticate users and authorize access
- Execute workflows requested by users
- Provide integration delivery and status reporting
- Operate and secure the platform (monitoring, audit logging, abuse prevention)
- Support incident response and compliance obligations

---

## 4. Security Controls

CodeRail Flow implements the following technical controls:

- Encryption at rest for sensitive integration configuration payloads
- Encryption support for auth profile payloads
- PII redaction utility for logs and exported payloads
- Mutation audit logging for API write operations
- API hardening headers and payload-size guardrails
- Access controls via authenticated API routes

---

## 5. Data Retention

Retention is configurable and can be enforced via compliance endpoints.

Current baseline behavior includes:

- Configurable default retention window via `DATA_RETENTION_DAYS`
- Retention cleanup endpoint for stale run/audit/delivery data
- Dry-run mode for retention policy simulation before deletion

---

## 6. GDPR-Oriented Data Subject Operations

CodeRail Flow supports operational flows for GDPR-style requests:

- **Data export** by organization
- **Data deletion** by organization
- **Retention policy enforcement**

These capabilities are exposed through authenticated compliance endpoints and should be executed by authorized administrators only.

---

## 7. Your Rights

Depending on jurisdiction, users may have rights to:

- Access their personal data
- Correct inaccurate data
- Request deletion
- Restrict or object to processing
- Data portability

To exercise rights, contact the service owner/administrator for your CodeRail Flow deployment.

---

## 8. Data Sharing

CodeRail Flow shares data only as required for configured integrations and service operation. Examples include webhook destinations and third-party APIs explicitly configured by the customer.

No additional sharing is performed outside configured execution and integration paths.

---

## 9. International Transfers

Where data is transferred across regions through configured infrastructure or integrations, operators should ensure appropriate legal safeguards are in place for their jurisdiction.

---

## 10. Incident and Breach Handling

Security incidents are handled according to the project security process. See:

- `SECURITY.md`
- `docs/SECURITY-HARDENING.md`

---

## 11. Contact

For privacy questions or requests, contact your CodeRail Flow service administrator.

For vulnerability disclosure, follow `SECURITY.md`.
