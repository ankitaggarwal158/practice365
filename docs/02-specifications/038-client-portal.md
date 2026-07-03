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

# 038 - Client Portal

**Module ID:** 038

**Module Name:** Client Portal

**Module Category:** Core Module

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

The Client Portal provides a secure self-service portal allowing clients to interact with the law firm without direct staff intervention.

Clients can securely access their legal information while firm staff retain complete control over what is shared.

The portal is intentionally read-heavy with limited client actions.

---

# 2. Scope

This module includes:

- Client Authentication
- Secure Portal Access
- Matter Visibility
- Document Access
- Invoice Access
- Secure Messaging (Future Placeholder)
- Profile Management
- Password Reset
- Audit Trail

---

# 3. Out of Scope

This module does not include:

- Online Payments
- Internal Staff Portal
- Document Editing
- Matter Editing
- E-Signatures
- Video Meetings

These capabilities are implemented by separate modules.

---

# 4. Dependencies

Business Module Dependencies

- 010 Authentication
- 011 User Management
- 013 Firm Management
- 023 Client Management
- 024 Matter Management
- 035 Document Management
- 037 Billing & Invoicing

Referenced By

- Dashboard
- Audit Log
- Notifications

---

# 5. Business Requirements

## PORTAL-001

Every Client Portal User belongs to exactly one Client.

---

## PORTAL-002

Clients may only access information explicitly shared with them.

---

## PORTAL-003

Clients may view:

- Matters
- Documents
- Invoices
- Profile

Only if permission has been granted.

---

## PORTAL-004

Clients cannot modify:

- Matters
- Documents
- Billing Records

unless explicitly supported by future modules.

---

## PORTAL-005

All client logins must be authenticated.

---

## PORTAL-006

Every client action must generate an Audit Log entry.

Examples include:

- Login
- Logout
- Document Viewed
- Invoice Viewed
- Password Changed

---

## PORTAL-007

Portal access may be disabled without affecting Client records.

---

## PORTAL-008

Portal accounts are never permanently deleted.

Soft deletion is mandatory.

---

# 6. User Stories

### Login

As a client,

I want to securely log into the portal,

so I can view my legal information.

---

### View Documents

As a client,

I want to download shared documents,

so I can review them.

---

### View Invoices

As a client,

I want to view outstanding invoices,

so I know what payments are due.

---

### Update Profile

As a client,

I want to update my contact information,

without affecting legal records.

---

# 7. User Workflows

Detailed workflows are documented in:

- `06-diagrams/client-portal.drawio`

Implementation must follow the approved workflow.

---

# PART B — Engineering Specification

---

# 8. Data Model

This module follows:

- 003 - Database Conventions

This module owns the following collections.

| Collection | Purpose |
|------------|----------|
| client_portal_users | Portal login accounts |
| client_portal_sessions | Active client sessions |

---

## 8.1 client_portal_users

### Purpose

Stores authentication and portal configuration for client users.

This collection extends the Client module without modifying Client records.

---

### Fields

| Field | Type | Description |
|------|------|-------------|
| _id | ObjectId | Primary Key |
| firmId | ObjectId | Firm Reference |
| clientId | ObjectId | Client Reference |
| email | String | Login Email |
| passwordHash | String | Password Hash |
| portalStatus | Enum | Account Status |
| lastLoginAt | Date | Last Login |
| passwordChangedAt | Date | Password Updated |
| failedLoginAttempts | Number | Failed Attempts |
| lockedUntil | Date | Temporary Lock |
| deleted | Boolean | Soft Delete |
| deletedAt | Date | Deleted Timestamp |
| deletedBy | ObjectId | Deleted By |
| createdAt | Date | Created Timestamp |
| updatedAt | Date | Updated Timestamp |

---

### Portal Status Enum

```text
PENDING

ACTIVE

DISABLED

LOCKED
```

---

### Relationships

One Firm

↓

Many Portal Users

---

One Client

↓

One Portal User

---

### Indexes

Create indexes on:

- firmId
- clientId
- email
- portalStatus

Composite indexes:

- firmId + email
- firmId + clientId

---

## 8.2 client_portal_sessions

### Purpose

Stores authenticated client sessions.

---

### Fields

| Field | Type |
|------|------|
| _id | ObjectId |
| portalUserId | ObjectId |
| refreshToken | String |
| ipAddress | String |
| userAgent | String |
| expiresAt | Date |
| createdAt | Date |

---

# 9. API Design

This module follows:

- 004 - API Conventions

## Authentication

| Method | Endpoint |
|---------|----------|
| POST | /portal/login |
| POST | /portal/logout |
| POST | /portal/forgot-password |
| POST | /portal/reset-password |

---

## Portal

| Method | Endpoint |
|---------|----------|
| GET | /portal/profile |
| PATCH | /portal/profile |
| GET | /portal/matters |
| GET | /portal/documents |
| GET | /portal/invoices |
| GET | /portal/documents/:id/download |

---

## Request Models

### Login

```json
{
    "email": "client@example.com",
    "password": "********"
}
```

---

### Update Profile

```json
{
    "phone": "...",
    "address": "..."
}
```

---

## Response Models

### Login

```json
{
    "success": true,
    "accessToken": "...",
    "refreshToken": "...",
    "user": {}
}
```

---

### Portal Data

```json
{
    "success": true,
    "data": {}
}
```

---

# 10. Backend Requirements

This module follows:

- 002 - Module Architecture

Backend module location

```text
apps/api/src/modules/client-portal
```

The module must implement:

- Portal Authentication
- Session Management
- Password Reset
- Profile Management
- Matter Access
- Document Access
- Invoice Access
- Audit Logging

Business logic belongs in the Service layer.

Repositories contain persistence logic only.

Controllers remain thin.

---

## Portal Authentication

Support:

- Login
- Logout
- Refresh Token
- Password Reset

Account lockout should occur after repeated failed login attempts.

---

## Document Access

Clients may only download documents explicitly shared with them.

Authorization must be validated on every request.

---

## Matter Access

Clients may only view Matters where they are the associated Client.

Hidden or archived Matters must not be exposed.

---

## Invoice Access

Clients may:

- View invoices.
- Download invoice PDFs.

Clients cannot modify invoices.

---

## Search

Portal users may search only within their own:

- Documents
- Matters
- Invoices

No global search across the firm's data is permitted.

---

# 11. Frontend Requirements

This module follows:

- 002 - Module Architecture

Frontend module location

```text
apps/web/src/modules/client-portal
```

Required pages

- Login
- Forgot Password
- Dashboard
- Profile
- Matter List
- Matter Details
- Documents
- Invoices

Required components

- Login Form
- Dashboard Cards
- Matter List
- Document List
- Invoice List
- Profile Form

Required hooks

- usePortalLogin
- usePortalProfile
- usePortalMatters
- usePortalDocuments
- usePortalInvoices

Required API client

- login()
- logout()
- getProfile()
- updateProfile()
- listMatters()
- listDocuments()
- listInvoices()
- downloadDocument()

---

# 12. Security Considerations

This module follows:

- 005 - Security Standards

The following security requirements are specific to the Client Portal module.

---

## Firm Isolation

Every Portal User belongs to exactly one Firm.

Clients may only access data belonging to their own Firm.

Cross-firm access is strictly prohibited.

---

## Client Isolation

Portal Users may access only information belonging to their own Client record.

Clients must never be able to access another client's:

- Matters
- Documents
- Invoices
- Notes
- Billing Information

---

## Authentication

Portal authentication follows the Authentication module.

Support:

- JWT Access Tokens
- Refresh Tokens
- Secure Password Hashing
- Account Lockout
- Password Reset

Passwords must never be stored in plain text.

---

## Authorization

Every request must validate:

- Portal User
- Client Ownership
- Firm Ownership
- Resource Visibility

Authorization must be enforced at the backend.

---

## Document Access

Document downloads require:

- Active Portal Account
- Valid Authentication
- Shared Document
- Same Client
- Same Firm

Signed URLs should be generated only after authorization succeeds.

---

## Invoice Access

Invoices are read-only.

Clients cannot:

- Edit
- Delete
- Mark Paid
- Cancel

---

## Profile Updates

Clients may update only permitted profile fields.

They cannot modify:

- Matter Information
- Billing Settings
- Assigned Attorney
- Legal Records

---

## Session Security

Support:

- Session Expiration
- Refresh Token Rotation
- Forced Logout
- Multiple Device Sessions (optional)

Inactive sessions should expire automatically.

---

## Soft Delete

Portal accounts are never permanently deleted.

Deletion consists of:

- deleted = true
- deletedAt
- deletedBy

Historical login history remains available.

---

## Auditability

Every significant Portal action must generate an Audit Log entry.

Examples include:

- Login
- Logout
- Password Reset
- Profile Updated
- Document Viewed
- Document Downloaded
- Invoice Viewed

---

# 13. Acceptance Criteria

The module is complete only if all of the following are true.

---

## Authentication

Clients can:

- Login
- Logout
- Reset Password

Locked accounts cannot authenticate.

---

## Profile

Clients can:

- View Profile
- Update permitted profile fields

---

## Matters

Clients can:

- View their Matters
- View Matter Details

Clients cannot edit Matters.

---

## Documents

Clients can:

- View shared documents
- Download shared documents

Clients cannot upload, edit or delete documents.

---

## Invoices

Clients can:

- View invoices
- Download invoice PDFs

Invoices remain read-only.

---

## Security

Cross-client access is impossible.

Cross-firm access is impossible.

---

## Testing

- Unit tests pass.
- Integration tests pass.
- Authentication tests pass.
- Authorization tests pass.
- Manual QA passes.

---

# 14. File Manifest

The implementation must create the following files.

---

## Backend

```text
apps/api/src/modules/client-portal/

index.ts

portal-auth.controller.ts

portal-auth.service.ts

portal.repository.ts

portal.routes.ts

portal.validation.ts

portal.constants.ts

portal.types.ts

portal-session.service.ts

portal-password.service.ts

schemas/

tests/
```

---

## Frontend

```text
apps/web/src/modules/client-portal/

pages/

LoginPage.tsx

ForgotPasswordPage.tsx

DashboardPage.tsx

ProfilePage.tsx

MatterListPage.tsx

MatterDetailsPage.tsx

DocumentListPage.tsx

InvoiceListPage.tsx

components/

LoginForm.tsx

PortalLayout.tsx

DashboardCards.tsx

MatterCard.tsx

DocumentTable.tsx

InvoiceTable.tsx

ProfileForm.tsx

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

```text
packages/types

packages/validation
```

Only create shared code if reused across multiple modules.

---

# 15. Implementation Deliverables

## Backend

Implement:

- Portal Authentication
- Session Management
- Password Reset
- Profile Management
- Matter Access
- Document Access
- Invoice Access
- Audit Logging

---

## Frontend

Implement:

- Client Login
- Dashboard
- Profile
- Matter List
- Document List
- Invoice List
- API Client
- React Query Hooks

---

## Database

Create:

- client_portal_users
- client_portal_sessions

Implement all indexes defined in this specification.

---

## Testing

Implement:

- Unit Tests
- Integration Tests
- Authentication Tests
- Authorization Tests
- Session Management Tests

The Client Portal module is considered incomplete if automated tests are absent.

---

## Documentation

Update:

- API Documentation
- Database Documentation
- Client Portal Workflow Diagram (if changed)

---

# 16. Future Enhancements

The following capabilities are intentionally excluded from this module and will be implemented in future specifications.

- Secure Messaging
- Online Payments
- E-Signature
- Appointment Scheduling
- Document Upload by Clients
- Push Notifications
- Mobile Application
- Two-Factor Authentication
- Multi-Language Support
- Client Chat

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

---

# AI Implementation Strategy

Refer to the standard AI Implementation Strategy defined for all modules.

The AI agent must create and maintain:

```text
docs/07-implementation/038-client-portal-progress.md
```

The progress document must be updated after each implementation phase and must include:

- Current Phase
- Overall Progress
- Completed Tasks
- Pending Tasks
- Known Issues
- Technical Decisions
- Deviations from this specification (if any)