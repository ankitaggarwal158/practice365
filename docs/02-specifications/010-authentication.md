> **Implementation Note**
>
> This document defines both the functional requirements and the implementation contract for this module.
>
> The AI implementation must strictly follow this specification along with the documents under:
>
> - `docs/00-foundation`
> - `docs/01-architecture`
>
> Where a conflict exists, the Foundation and Architecture documents take precedence over this module unless this module explicitly overrides a rule with justification.

# 010 - Authentication

**Module ID:** 010

**Module Name:** Authentication

**Status:** Draft

---

# References

This module follows the standards defined in:

- 001 Engineering Principles
- 002 Coding Standards
- 003 Database Conventions
- 004 API Conventions
- 005 Security Standards
- 001 System Architecture
- 002 Module Architecture

These documents define the global engineering standards for Practice365 and are not repeated in this specification.

---

# PART A — Product Specification

---

# 1. Purpose

The Authentication module establishes and maintains authenticated user sessions within Practice365.

Its responsibility is limited to identifying users and maintaining authenticated sessions.

Authentication does not determine what a user is allowed to access. Authorization is handled separately by the Roles & Permissions module.

This module provides the security foundation for the entire platform.

---

# 2. Scope

This module includes:

- Login
- Logout
- Logout from all devices
- Email verification
- Password authentication
- Forgot password
- Password reset
- Session management
- Access token generation
- Refresh token generation
- Refresh token rotation
- Current authenticated user

---

# 3. Out of Scope

This module does not include:

- User registration
- User invitations
- User management
- Firm management
- Roles & Permissions
- Two-factor authentication (2FA)
- Single Sign-On (SSO)
- OAuth providers
- API keys
- Audit logging

These capabilities will be implemented in separate modules.

---

# 4. Dependencies

This module has no business module dependencies.

It depends only on the global foundation and architecture documents.

---

# 5. Business Requirements

## AUTH-001

Only authenticated users may access protected resources.

---

## AUTH-002

Every successful login creates a new authenticated session.

Users may maintain multiple simultaneous sessions across different devices.

Each session is managed independently.

---

## AUTH-003

Logging out from one session must not terminate other active sessions.

---

## AUTH-004

A password reset immediately invalidates every active session belonging to the user.

---

## AUTH-005

Email verification is mandatory before a user can successfully authenticate.

---

## AUTH-006

Authentication failures must never reveal whether:

- the email exists
- the password is incorrect

The response must always be generic.

---

## AUTH-007

Authentication is responsible only for identity verification.

Authorization decisions belong to the Roles & Permissions module.

---

# 6. User Stories

### Login

As a user,

I want to securely log into Practice365,

so I can access my firm's data.

---

### Logout

As a user,

I want to log out of my current device,

without affecting my other active sessions.

---

### Logout All

As a user,

I want to terminate all active sessions,

if I believe my account has been compromised.

---

### Forgot Password

As a user,

I want to request a password reset,

so I can regain access to my account.

---

### Reset Password

As a user,

I want to securely choose a new password,

using a temporary reset link.

---

### Verify Email

As a user,

I want to verify my email address,

before accessing Practice365.

---

# 7. User Workflows

The detailed authentication sequence diagrams are documented in:

- 06-diagrams/authentication-flow.drawio

This module defines the business behaviour only.

Implementation must follow the approved workflow.

---

# PART B — Engineering Specification

---

# 8. Data Model

This module follows the standards defined in:

- 003 - Database Conventions

This module owns the following collections.

| Collection | Purpose |
|------------|----------|
| auth_sessions | Active authenticated sessions |
| password_reset_tokens | Password reset requests |
| email_verification_tokens | Email verification requests |

The `users` collection is defined in **011 - User Management**.

Authentication references the User collection but does not own it.

---

## 8.1 auth_sessions

### Purpose

Represents one authenticated device session.

Every successful login creates one session.

A user may own multiple active sessions.

### Fields

| Field | Type | Description |
|---------|------|-------------|
| _id | ObjectId | Primary Key |
| userId | ObjectId | User Reference |
| refreshTokenHash | String | Hashed Refresh Token |
| deviceName | String | Device Name |
| browser | String | Browser Name |
| operatingSystem | String | Operating System |
| ipAddress | String | Client IP Address |
| userAgent | String | User Agent |
| lastActivityAt | Date | Last Activity |
| expiresAt | Date | Session Expiry |
| revokedAt | Date | Revoked Timestamp |
| createdAt | Date | Created Timestamp |
| updatedAt | Date | Updated Timestamp |

### Relationships

One User

↓

Many Authentication Sessions

---

## 8.2 password_reset_tokens

### Purpose

Stores temporary password reset requests.

### Fields

| Field | Type |
|---------|------|
| _id | ObjectId |
| userId | ObjectId |
| tokenHash | String |
| expiresAt | Date |
| consumedAt | Date |
| createdAt | Date |

### Business Rules

Only one active password reset request may exist for a user.

Generating a new password reset request invalidates all previous unused requests.

---

## 8.3 email_verification_tokens

### Purpose

Stores email verification requests.

### Fields

| Field | Type |
|---------|------|
| _id | ObjectId |
| userId | ObjectId |
| tokenHash | String |
| expiresAt | Date |
| verifiedAt | Date |
| createdAt | Date |

### Business Rules

Verification tokens are single use.

Verification tokens expire automatically.

---

# 9. API Design

This module follows:

- 004 - API Conventions

## Endpoints

| Method | Endpoint | Description | Auth Required |
|----------|-------------------------|---------------------------|---------------|
| POST | /auth/login | Authenticate User | No |
| POST | /auth/logout | Logout Current Session | Yes |
| POST | /auth/logout-all | Logout All Sessions | Yes |
| POST | /auth/refresh | Refresh Access Token | No |
| POST | /auth/forgot-password | Request Password Reset | No |
| POST | /auth/reset-password | Reset Password | No |
| POST | /auth/verify-email | Verify Email | No |
| GET | /auth/me | Current Authenticated User | Yes |

---

## Request Models

### Login

```json
{
  "email": "string",
  "password": "string"
}
```

---

### Refresh Token

```json
{
  "refreshToken": "string"
}
```

---

### Forgot Password

```json
{
  "email": "string"
}
```

---

### Reset Password

```json
{
  "token": "string",
  "password": "string"
}
```

---

### Verify Email

```json
{
  "token": "string"
}
```

---

## Response Models

### Login Success

```json
{
  "success": true,
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "expiresIn": 900,
    "user": {}
  }
}
```

---

### Logout Success

```json
{
  "success": true
}
```

---

### Current User

Returns the authenticated user profile.

The user object is defined in **011 - User Management**.

---

# 10. Backend Requirements

This module follows:

- 002 - Module Architecture

Backend module location

```
apps/api/src/modules/auth
```

The Authentication module must implement:

- Login
- Logout
- Logout All
- Refresh Token
- Forgot Password
- Reset Password
- Verify Email
- Current User
- Session Management
- Authentication Middleware

Authentication business logic belongs inside the Service layer.

Database access belongs inside the Repository layer.

Controllers must remain thin.

---

# 11. Frontend Requirements

This module follows:

- 002 - Module Architecture

Frontend module location

```
apps/web/src/modules/auth
```

Required pages

- Login
- Forgot Password
- Reset Password
- Verify Email

Required hooks

- useLogin
- useLogout
- useCurrentUser
- useRefreshToken

Required API client

- login()
- logout()
- logoutAll()
- refresh()
- forgotPassword()
- resetPassword()
- verifyEmail()
- getCurrentUser()

---

# 12. Security Considerations

This module follows:

- 005 - Security Standards

The following security requirements are specific to the Authentication module.

## Authentication

Authentication is responsible only for establishing identity.

It must never perform authorization.

Authorization is implemented by the Roles & Permissions module.

---

## Password Handling

Passwords must never be:

- Stored in plain text
- Logged
- Returned through APIs

Passwords must always be hashed before persistence.

---

## Session Security

Every successful login creates a new authenticated session.

Each session owns exactly one Refresh Token.

Sessions are independent.

Revoking one session must not affect any other active session.

---

## Refresh Token Rotation

Refresh Tokens must be rotated on every successful refresh.

A previously used Refresh Token becomes immediately invalid.

If reuse of a rotated Refresh Token is detected, the associated session must be revoked immediately.

---

## Password Reset

A successful password reset must:

- Invalidate every active session.
- Invalidate every Refresh Token.
- Require the user to authenticate again.

---

## Email Verification

Users whose email has not been verified must not be allowed to authenticate.

---

## Login Attempts

Repeated failed login attempts should temporarily lock the account.

The exact thresholds are configurable through application configuration.

---

# 13. Acceptance Criteria

The module is complete only if all of the following are true.

## Login

- User can authenticate with valid credentials.
- Invalid credentials are rejected.
- Unverified users cannot log in.
- Disabled users cannot log in.

---

## Logout

- Current session can be revoked.
- Other active sessions remain active.

---

## Logout All

- All active sessions belonging to the authenticated user are revoked.

---

## Refresh Tokens

- Refresh Tokens generate new Access Tokens.
- Refresh Token rotation functions correctly.
- Reusing an old Refresh Token is rejected.

---

## Password Reset

- Reset requests generate temporary reset tokens.
- Reset tokens expire.
- Reset tokens are single-use.
- Password reset invalidates every active session.

---

## Email Verification

- Verification tokens are generated.
- Verification tokens expire.
- Verification tokens are single-use.
- Verified users may authenticate.

---

## Middleware

Protected routes reject unauthenticated requests.

Authenticated requests expose the authenticated user.

---

## Testing

Unit tests pass.

Integration tests pass.

Manual testing passes.

---

# 14. File Manifest

The implementation must create the following files.

## Backend

```
apps/api/src/modules/auth/

index.ts

auth.controller.ts

auth.service.ts

auth.repository.ts

auth.routes.ts

auth.middleware.ts

auth.validation.ts

auth.constants.ts

auth.types.ts

auth.tokens.ts

auth.session.service.ts

auth.password.service.ts

auth.email.service.ts

schemas/

tests/
```

---

## Frontend

```
apps/web/src/modules/auth/

pages/

LoginPage.tsx

ForgotPasswordPage.tsx

ResetPasswordPage.tsx

VerifyEmailPage.tsx

components/

hooks/

api/

schemas/

types/

utils/

tests/

index.ts
```

---

## Shared Packages

Update where required:

```
packages/types

packages/validation
```

Only create shared code if it is reused across multiple modules.

---

# 15. Implementation Deliverables

## Backend

Implement:

- Authentication module
- Session management
- Access Token generation
- Refresh Token generation
- Refresh Token rotation
- Authentication middleware
- Email verification
- Password reset
- Current authenticated user endpoint

---

## Frontend

Implement:

- Login page
- Forgot Password page
- Reset Password page
- Verify Email page
- Authentication API client
- Authentication hooks
- Protected route support

---

## Database

Create:

- auth_sessions
- password_reset_tokens
- email_verification_tokens

Implement indexes as defined in this specification.

---

## Testing

Implement:

- Unit tests
- Integration tests

Authentication is considered incomplete if automated tests are absent.

---

## Documentation

Update:

- API documentation
- Database documentation
- Authentication sequence diagram (if changed)

---

# 16. Future Enhancements

The following capabilities are intentionally excluded from this module and will be implemented in future specifications.

- Multi-Factor Authentication (MFA)
- Single Sign-On (SSO)
- OAuth Providers
- Passwordless Authentication
- Magic Links
- Passkeys (WebAuthn)
- Device Trust
- Session Management Dashboard
- Security Notifications
- API Access Tokens
- Personal Access Tokens

---

# 17. Definition of Done

This module is complete when:

- Product requirements are implemented.
- Business rules are implemented.
- Database collections are implemented.
- API endpoints are implemented.
- Backend implementation is complete.
- Frontend implementation is complete.
- Validation is complete.
- Automated tests pass.
- Manual QA passes.
- Documentation is updated.
- Code review is complete.

# AI Implementation Strategy

This module must be implemented incrementally. Do not attempt to implement the entire module in a single iteration.

Follow the phases below in order.

---

## Phase 1 — Backend Foundation

### Objective

Establish the backend structure for the module.

### Deliverables

* Create the backend module structure.
* Create database schemas.
* Create repositories.
* Create services.
* Create controllers.
* Create routes.
* Create validation.
* Create middleware (if applicable).
* Configure dependency injection/module exports.
* Ensure the project compiles successfully.

### Exit Criteria

* No TypeScript errors.
* No linting errors.
* Application starts successfully.

---

## Phase 2 — Backend Business Logic

### Objective

Implement all business rules defined in this specification.

### Deliverables

Implement every backend feature described in this Module PRD.

Do not implement the frontend.

### Exit Criteria

* All backend APIs function correctly.
* Business rules are enforced.
* Database persistence is complete.

---

## Phase 3 — Frontend

### Objective

Implement the frontend for this module.

### Deliverables

* Pages
* Components
* Hooks
* API integration
* Forms
* Validation
* State management

### Exit Criteria

* Frontend communicates successfully with the backend.
* User flows defined in this specification are fully functional.

---

## Phase 4 — Testing

### Objective

Validate the implementation.

### Deliverables

* Unit Tests
* Integration Tests
* Manual QA

### Exit Criteria

* All automated tests pass.
* Manual testing completed successfully.

---

## Phase 5 — Documentation

### Objective

Finalize implementation.

### Deliverables

Update:

* Module Progress document
* API documentation
* Database documentation
* Diagrams (if required)

---

# AI Agent Rules

The implementation **must** follow:

* `docs/00-foundation/*`
* `docs/01-architecture/*`
* This Module PRD

The AI agent must **not** invent business rules.

If any requirement is ambiguous, implementation must stop and request clarification rather than making assumptions.

The AI agent **must create and maintain** a living implementation progress document under:

```
docs/07-implementation/
```

If the progress document for this module does not exist, it must be created automatically using the naming convention:

```
<module-id>-<module-name>-progress.md
```

Example:

```
010-authentication-progress.md
```

The progress document must be updated after the completion of every implementation phase and should include:

* Current Phase
* Overall Progress (%)
* Completed Tasks
* Pending Tasks
* Known Issues
* Technical Decisions Made
* Deviations from the Module PRD (if any)

The Module PRD is considered **immutable** after approval.

Implementation progress must never be recorded inside the Module PRD.

---

# Completion Requirements

Before considering this module complete, verify:

* All acceptance criteria are satisfied.
* All implementation deliverables are complete.
* The module compiles successfully.
* Tests pass.
* Documentation is updated.
* The implementation progress document reflects the latest implementation status.
