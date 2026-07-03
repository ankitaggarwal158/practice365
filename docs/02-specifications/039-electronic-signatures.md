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

# 039 - Electronic Signatures

**Module ID:** 039

**Module Name:** Electronic Signatures

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

The Electronic Signatures module enables law firms to request, track and manage legally binding electronic signatures for documents.

The module integrates with Document Management while maintaining a complete audit trail of every signing event.

The system supports signature requests sent to clients and external parties.

---

# 2. Scope

This module includes:

- Signature Requests
- Multiple Signers
- Signing Order
- Email Invitations
- Signature Status Tracking
- Signed Document Storage
- Audit Trail
- Expiration
- Reminder Emails

---

# 3. Out of Scope

This module does not include:

- Document Editing
- Template Creation
- Identity Verification Services
- Payment Collection
- Contract Negotiation

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

Referenced By

- Client Portal
- Dashboard
- Audit Log

---

# 5. Business Requirements

## ESIGN-001

Every Signature Request belongs to exactly one Firm.

---

## ESIGN-002

Every Signature Request references exactly one Document.

---

## ESIGN-003

A Signature Request may contain one or more Signers.

---

## ESIGN-004

Signing may occur:

- In Parallel
- Sequentially

depending on request configuration.

---

## ESIGN-005

Signature Requests support the following lifecycle:

- Draft
- Sent
- Viewed
- Partially Signed
- Completed
- Declined
- Expired
- Cancelled

---

## ESIGN-006

Completed signed documents are immutable.

---

## ESIGN-007

Every signature action generates an Audit Log entry.

Examples include:

- Request Created
- Request Sent
- Email Delivered
- Document Viewed
- Document Signed
- Request Completed
- Request Cancelled

---

## ESIGN-008

Signature Requests are never permanently deleted.

Soft deletion is mandatory.

---

# 6. User Stories

### Send for Signature

As an attorney,

I want to send a document for signature,

so my client can legally approve it.

---

### Track Progress

As a legal assistant,

I want to track signing progress,

so I know who has completed signing.

---

### Sign Document

As a client,

I want to sign a document electronically,

without visiting the office.

---

### Download Signed Document

As an attorney,

I want to retrieve the completed signed document,

for permanent legal records.

---

# 7. User Workflows

Detailed workflows are documented in:

- `06-diagrams/e-signatures.drawio`

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
| signature_requests | Signature request master records |
| signature_request_signers | Individual signer records |
| signature_events | Immutable audit trail of signing activity |

---

## 8.1 signature_requests

### Purpose

Stores the master record for every electronic signature request.

---

### Fields

| Field | Type | Description |
|------|------|-------------|
| _id | ObjectId | Primary Key |
| firmId | ObjectId | Firm Reference |
| matterId | ObjectId | Matter Reference |
| documentId | ObjectId | Source Document |
| signedDocumentId | ObjectId | Final Signed Document |
| requestTitle | String | Display Title |
| signingMode | Enum | PARALLEL / SEQUENTIAL |
| status | Enum | Request Status |
| expiresAt | Date | Expiration Date |
| completedAt | Date | Completion Date |
| cancelledAt | Date | Cancellation Date |
| cancelledBy | ObjectId | Cancelled By |
| deleted | Boolean | Soft Delete |
| deletedAt | Date | Deleted Timestamp |
| deletedBy | ObjectId | Deleted By |
| createdBy | ObjectId | Created By |
| createdAt | Date | Created Timestamp |
| updatedAt | Date | Updated Timestamp |

---

### Request Status Enum

```text
DRAFT

SENT

VIEWED

PARTIALLY_SIGNED

COMPLETED

DECLINED

EXPIRED

CANCELLED
```

---

### Signing Mode

```text
PARALLEL

SEQUENTIAL
```

---

### Relationships

One Firm

↓

Many Signature Requests

---

One Document

↓

Many Signature Requests

---

One Signature Request

↓

Many Signers

---

### Indexes

Create indexes on:

- firmId
- matterId
- documentId
- status
- expiresAt

Composite indexes:

- firmId + status
- firmId + matterId

---

## 8.2 signature_request_signers

### Purpose

Stores all signers for a signature request.

---

### Fields

| Field | Type |
|------|------|
| _id | ObjectId |
| requestId | ObjectId |
| fullName | String |
| email | String |
| signingOrder | Number |
| status | Enum |
| viewedAt | Date |
| signedAt | Date |
| declinedAt | Date |
| signatureIp | String |
| signatureUserAgent | String |

---

### Signer Status

```text
PENDING

VIEWED

SIGNED

DECLINED
```

---

## 8.3 signature_events

### Purpose

Immutable audit log for every signature-related action.

---

### Fields

| Field | Type |
|------|------|
| _id | ObjectId |
| requestId | ObjectId |
| signerId | ObjectId |
| eventType | Enum |
| metadata | Mixed |
| createdAt | Date |

---

# 9. API Design

This module follows:

- 004 - API Conventions

## Endpoints

| Method | Endpoint | Description |
|---------|-----------------------------------------------|------------------------|
| GET | /signature-requests | List Requests |
| GET | /signature-requests/:id | Request Details |
| POST | /signature-requests | Create Request |
| POST | /signature-requests/:id/send | Send Request |
| POST | /signature-requests/:id/cancel | Cancel Request |
| GET | /signature-requests/:id/status | Status |
| GET | /sign/:token | Load Signing Session |
| POST | /sign/:token | Submit Signature |
| GET | /signature-requests/:id/download | Download Signed PDF |

---

## Request Models

### Create Request

```json
{
    "documentId": "...",
    "signingMode": "SEQUENTIAL",
    "signers": [
        {
            "name": "John Doe",
            "email": "john@example.com"
        }
    ]
}
```

---

### Submit Signature

```json
{
    "signature": "...",
    "acceptedTerms": true
}
```

---

## Response Models

### Signature Request

```json
{
    "success": true,
    "data": {}
}
```

---

### Signing Status

```json
{
    "success": true,
    "data": {
        "status": "PARTIALLY_SIGNED"
    }
}
```

---

# 10. Backend Requirements

This module follows:

- 002 - Module Architecture

Backend module location

```text
apps/api/src/modules/e-signatures
```

The module must implement:

- Signature Request CRUD
- Email Invitations
- Sequential Signing
- Parallel Signing
- Status Tracking
- Reminder Emails
- Signed Document Generation
- Audit Logging

Business logic belongs in the Service layer.

Repositories contain persistence logic only.

Controllers remain thin.

---

# 11. Frontend Requirements

This module follows:

- 002 - Module Architecture

Frontend module location

```text
apps/web/src/modules/e-signatures
```

Required pages

- Signature Requests
- Request Details
- Create Request
- Signing Page
- Completion Page

Required components

- Request Form
- Signer List
- Status Timeline
- Signature Pad
- Completion Summary

Required hooks

- useSignatureRequests
- useSignatureRequest
- useCreateSignatureRequest
- useSendRequest
- useSigningSession

Required API client

- listRequests()
- getRequest()
- createRequest()
- sendRequest()
- submitSignature()
- downloadSignedDocument()

---

# 12. Security Considerations

This module follows:

- 005 - Security Standards

The following security requirements are specific to the Electronic Signatures module.

---

## Firm Isolation

Every Signature Request belongs to exactly one Firm.

Cross-firm access is prohibited.

---

## Document Validation

A Signature Request may only reference:

- Existing Documents
- Documents belonging to the same Firm
- Documents that are not deleted

---

## Signing Authorization

Only intended signers may sign a document.

Signing links must:

- Be unique
- Be cryptographically secure
- Expire after completion or expiration
- Become invalid after cancellation

---

## Sequential Signing

For sequential requests:

The next signer cannot access the document until the previous signer has completed signing.

The backend must enforce this rule.

---

## Completed Documents

Completed signed documents are immutable.

After completion:

- No additional signatures may be added.
- The original document cannot be replaced.
- The signed PDF cannot be modified.

---

## Expired Requests

Expired requests:

- Cannot be signed.
- Cannot be resumed.
- May be duplicated into a new request.

---

## Soft Delete

Signature Requests are never permanently deleted.

Deletion consists of:

- deleted = true
- deletedAt
- deletedBy

Historical audit events remain preserved.

---

## Auditability

Every signature event must generate an immutable audit record.

Examples include:

- Request Created
- Request Sent
- Email Delivered
- Document Viewed
- Signature Applied
- Signature Declined
- Request Completed
- Request Cancelled
- Request Expired

---

# 13. Acceptance Criteria

The module is complete only if all of the following are true.

---

## Request Management

Users can:

- Create requests.
- Add multiple signers.
- Configure signing order.
- Cancel requests.

---

## Signing

Recipients can:

- Open secure signing links.
- Review documents.
- Apply signatures.
- Complete signing.

---

## Status Tracking

Users can:

- Track signer progress.
- View request status.
- View completed requests.

---

## Signed Documents

Users can:

- Download completed signed documents.
- View signing history.

Completed documents remain immutable.

---

## Security

Signing links expire appropriately.

Unauthorized users cannot access signing pages.

---

## Testing

- Unit tests pass.
- Integration tests pass.
- Signing workflow tests pass.
- Authorization tests pass.
- Manual QA passes.

---

# 14. File Manifest

The implementation must create the following files.

---

## Backend

```text
apps/api/src/modules/e-signatures/

index.ts

signature-request.controller.ts

signature-request.service.ts

signature-request.repository.ts

signature-request.routes.ts

signature-request.validation.ts

signature-request.constants.ts

signature-request.types.ts

signing.service.ts

signature-email.service.ts

signature-document.service.ts

schemas/

tests/
```

---

## Frontend

```text
apps/web/src/modules/e-signatures/

pages/

SignatureRequestListPage.tsx

SignatureRequestDetailsPage.tsx

CreateSignatureRequestPage.tsx

SigningPage.tsx

CompletionPage.tsx

components/

SignatureRequestForm.tsx

SignerList.tsx

SignaturePad.tsx

SigningTimeline.tsx

CompletionSummary.tsx

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

- Signature Request Management
- Sequential & Parallel Signing
- Email Invitations
- Reminder Emails
- Signed Document Generation
- Audit Logging

---

## Frontend

Implement:

- Signature Request Management UI
- Signing Experience
- Signature Pad
- Status Tracking
- Signed Document Download
- API Client
- React Query Hooks

---

## Database

Create:

- signature_requests
- signature_request_signers
- signature_events

Implement all indexes defined in this specification.

---

## Testing

Implement:

- Unit Tests
- Integration Tests
- Signing Workflow Tests
- Authorization Tests

The Electronic Signatures module is considered incomplete if automated tests are absent.

---

## Documentation

Update:

- API Documentation
- Database Documentation
- E-Signature Workflow Diagram (if changed)

---

# 16. Future Enhancements

The following capabilities are intentionally excluded from this module and will be implemented in future specifications.

- Identity Verification
- Digital Certificate Support
- Biometric Signatures
- Signature Templates
- Bulk Signature Requests
- SMS Verification
- Government e-Sign Integration
- Witness Signatures
- Notary Support
- Third-party E-Sign Providers

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
docs/07-implementation/039-electronic-signatures-progress.md
```

The progress document must be updated after each implementation phase and must include:

- Current Phase
- Overall Progress
- Completed Tasks
- Pending Tasks
- Known Issues
- Technical Decisions
- Deviations from this specification (if any)