# 005 - Security Standards

**Document ID:** 005

**Document Name:** Security Standards

**Status:** Draft

---

# 1. Purpose

This document defines the minimum security standards that every module within Practice365 must follow.

Security is not the responsibility of a single module.

Every module must comply with these standards.

---

# 2. Security Principles

## SEC-001

Never trust client input.

Every request must be validated on the backend.

---

## SEC-002

Authentication always occurs before authorization.

---

## SEC-003

Authorization is enforced on every protected resource.

Never rely on the frontend to hide functionality.

---

## SEC-004

Security takes precedence over convenience.

---

# 3. Authentication

Authentication standards are implemented by the Authentication module.

Authentication must provide

- Identity verification
- Session management
- Token management

Authentication never grants permissions.

---

# 4. Authorization

Authorization determines what an authenticated user can access.

Authorization must always execute after authentication.

Permission checks belong inside backend business logic.

---

# 5. Passwords

Passwords must

- Never be stored in plain text
- Never be logged
- Never be returned through APIs

Passwords must always be hashed using an approved password hashing algorithm.

Password verification must always compare hashes.

---

# 6. Tokens

Access Tokens

- Short lived
- Signed
- Verifiable

Refresh Tokens

- Long lived
- Rotated
- Stored securely

Refresh Tokens must never be stored in plain text.

---

# 7. Secrets

Secrets must never exist inside source code.

Secrets include

- JWT secrets
- API keys
- SMTP credentials
- Database credentials
- Third-party service credentials

Secrets are loaded from environment configuration.

---

# 8. Transport Security

Production environments must use HTTPS.

Sensitive data must never travel over insecure connections.

---

# 9. Input Validation

Every request must validate

- Path parameters
- Query parameters
- Request body

Validation failures must terminate request processing.

---

# 10. Output Validation

Sensitive information must never be exposed.

Examples

- Passwords
- Password hashes
- Refresh Tokens
- Internal identifiers
- Internal error messages

---

# 11. Logging

Logs must never contain

- Passwords
- JWTs
- Refresh Tokens
- Secrets
- Credit card information

Security-related events should be logged.

Examples

- Login
- Logout
- Failed Login
- Password Reset
- Permission Changes

---

# 12. Rate Limiting

Authentication endpoints should be rate limited.

Sensitive endpoints may define stricter limits.

Rate limiting strategy should be configurable.

---

# 13. File Upload Security

Uploaded files must

- Validate file type
- Validate file size
- Reject executable files
- Scan for malware when applicable

Never trust client-provided file names.

---

# 14. Database Security

Applications access MongoDB through the backend only.

The frontend never communicates directly with MongoDB.

Queries should use parameterized filters.

Avoid dynamic query construction where possible.

---

# 15. Error Handling

Security-related errors should never expose implementation details.

Example

Good

```
Authentication failed.
```

Bad

```
Password incorrect.
```

---

# 16. Third-Party Services

Every third-party integration must

- Store credentials securely
- Handle failures gracefully
- Log integration failures
- Validate responses

---

# 17. Principle of Least Privilege

Every user, module and service should receive only the permissions required to perform its responsibilities.

Avoid excessive permissions.

---

# 18. Security Review Checklist

Before approving implementation verify

- Authentication enforced
- Authorization enforced
- Validation implemented
- Secrets externalized
- Passwords protected
- Tokens protected
- Logging safe
- HTTPS required
- Sensitive information never exposed