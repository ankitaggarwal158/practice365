> **Implementation Note**
>
> This document defines both the functional requirements and the implementation contract for this module.
>
> The AI implementation must strictly follow this specification along with the documents under:
>
> * `docs/00-foundation`
> * `docs/01-architecture`
>
> Where a conflict exists, the Foundation and Architecture documents take precedence over this module unless this module explicitly overrides a rule with justification.

# 022 - Conflict Check

**Module ID:** 022

**Module Name:** Conflict Check

**Status:** Draft

---

# References

This module follows the standards defined in:

* 001 Engineering Principles
* 002 Coding Standards
* 003 Database Conventions
* 004 API Conventions
* 005 Security Standards
* 001 System Architecture
* 002 Module Architecture

These documents define the global engineering standards for Practice365 and are not repeated in this specification.

---

# PART A — Product Specification

---

# 1. Purpose

The Conflict Check module determines whether the firm has an actual or potential conflict of interest before accepting representation.

Conflict checking is a mandatory step before a Lead can be converted into a Client.

The module searches existing firm data and presents potential conflicts for attorney review.

The system assists in identifying conflicts but never makes legal decisions.

The final decision always belongs to an authorized user.

---

# 2. Scope

This module includes:

* Conflict Search
* Conflict Review
* Conflict Results
* Conflict Resolution
* Conflict Decision
* Conflict History
* Conflict Audit

---

# 3. Out of Scope

This module does not include:

* Client Creation
* Matter Creation
* Lead Management
* Engagement Letters
* Billing

These capabilities are implemented by other modules.

---

# 4. Dependencies

Business Module Dependencies

* 010 Authentication
* 011 User Management
* 012 Roles & Permissions
* 013 Firm Management
* 021 Lead Management

Future Module Integrations

* 023 Client Management
* 024 Matter Management
* 090 Audit Log

---

# 5. Business Requirements

## CONFLICT-001

Every conflict check belongs to exactly one firm.

---

## CONFLICT-002

A conflict check may be initiated from:

* Lead Review
* Client Creation
* Matter Creation
* Manual Conflict Search

---

## CONFLICT-003

The conflict engine searches existing firm records including:

* Leads
* Clients
* Matters
* Opposing Parties

Additional searchable entities may be added in future modules.

---

## CONFLICT-004

The system must support searching by:

* Person Name
* Organization Name
* Email Address
* Phone Number

---

## CONFLICT-005

Search results are categorized as:

* No Conflict
* Possible Conflict
* Confirmed Conflict

The system suggests results but never makes the legal determination.

---

## CONFLICT-006

Every conflict check must produce a permanent result record.

Historical conflict searches are never deleted.

---

## CONFLICT-007

An authorized user may record the final conflict decision as:

* Cleared
* Waived
* Rejected

---

## CONFLICT-008

Only a Cleared conflict check permits Lead conversion to Client.

---

## CONFLICT-009

Every conflict review must record:

* Reviewing User
* Decision
* Decision Date
* Review Notes

---

## CONFLICT-010

Every conflict check and review decision must generate an Audit Log entry.

---

# 6. User Stories

### Run Conflict Check

As an intake coordinator,

I want to search existing firm records,

so I can identify potential conflicts.

---

### Review Results

As an attorney,

I want to review potential conflicts,

so I can determine whether representation is appropriate.

---

### Record Decision

As an attorney,

I want to record the final conflict decision,

so the system maintains a permanent history.

---

### Manual Search

As a staff member,

I want to perform an ad-hoc conflict search,

without creating a new client.

---

# 7. User Workflows

The detailed conflict workflow diagrams are documented in:

* `06-diagrams/conflict-check-flow.drawio`

This module defines business behaviour only.

Implementation must follow the approved workflow.

---

# PART B — Engineering Specification

---

# 8. Data Model

This module follows the standards defined in:

* 003 - Database Conventions

Unlike CRUD modules, the Conflict Check module is a domain service.

This module owns the following collection.

| Collection      | Purpose                                                  |
| --------------- | -------------------------------------------------------- |
| conflict_checks | Stores conflict search executions and attorney decisions |

The actual searchable data resides in:

* Leads
* Clients
* Matters
* Opposing Parties

---

## 8.1 conflict_checks

### Purpose

Stores every conflict check executed by the system.

The record represents a historical execution and attorney decision.

Conflict checks are immutable after completion.

---

### Fields

| Field         | Type     | Description                |
| ------------- | -------- | -------------------------- |
| _id           | ObjectId | Primary Key                |
| firmId        | ObjectId | Firm Reference             |
| leadId        | ObjectId | Source Lead (Optional)     |
| clientId      | ObjectId | Source Client (Optional)   |
| matterId      | ObjectId | Source Matter (Optional)   |
| requestedBy   | ObjectId | User initiating the search |
| reviewedBy    | ObjectId | Reviewing Attorney         |
| overallResult | Enum     | Conflict Result            |
| finalDecision | Enum     | Attorney Decision          |
| reviewNotes   | String   | Attorney Notes             |
| completedAt   | Date     | Completion Timestamp       |
| createdAt     | Date     | Created Timestamp          |

---

### Result Enum

```text
NO_CONFLICT

POSSIBLE_CONFLICT

CONFIRMED_CONFLICT
```

---

### Decision Enum

```text
PENDING

CLEARED

WAIVED

REJECTED
```

---

### Relationships

One Firm

↓

Many Conflict Checks

---

One Lead

↓

Many Conflict Checks

---

One Client

↓

Many Conflict Checks

---

One Matter

↓

Many Conflict Checks

---

### Indexes

Create indexes on:

* firmId
* leadId
* clientId
* matterId
* overallResult
* finalDecision
* createdAt

---

# 9. API Design

This module follows:

* 004 - API Conventions

## Endpoints

| Method | Endpoint                       | Description            | Auth Required |
| ------ | ------------------------------ | ---------------------- | ------------- |
| POST   | /conflict-checks               | Execute Conflict Check | Yes           |
| GET    | /conflict-checks               | List Conflict Checks   | Yes           |
| GET    | /conflict-checks/:id           | Get Conflict Check     | Yes           |
| PATCH  | /conflict-checks/:id/review    | Record Decision        | Yes           |
| POST   | /conflict-checks/manual-search | Manual Conflict Search | Yes           |

---

## Request Models

### Execute Conflict Check

```json
{
    "leadId": "leadId"
}
```

---

### Manual Search

```json
{
    "personName": "John Smith",
    "organizationName": "ABC Holdings",
    "email": "john@example.com",
    "phone": "+15551234567"
}
```

---

### Review Decision

```json
{
    "decision": "CLEARED",
    "reviewNotes": "No material conflict identified."
}
```

---

## Response Models

### Conflict Check

```json
{
    "success": true,
    "data": {}
}
```

---

### Conflict Search Results

```json
{
    "success": true,
    "data": {
        "overallResult": "POSSIBLE_CONFLICT",
        "matches": []
    }
}
```

---

# 10. Backend Requirements

This module follows:

* 002 - Module Architecture

Backend module location

```text
apps/api/src/modules/conflict-check
```

The Conflict Check module must implement:

* Conflict Search Engine
* Name Matching
* Email Matching
* Phone Matching
* Organization Matching
* Conflict Result Generation
* Attorney Review
* Conflict Decision Recording
* Conflict History

Business logic belongs inside the Service layer.

Repositories must never contain business logic.

Controllers must remain thin.

---

# 11. Frontend Requirements

This module follows:

* 002 - Module Architecture

Frontend module location

```text
apps/web/src/modules/conflict-check
```

Required pages

* Conflict Check
* Conflict Details
* Manual Conflict Search

Required components

* Conflict Search Form
* Match Results Table
* Conflict Result Badge
* Attorney Decision Panel
* Review Notes
* Conflict Timeline

Required hooks

* useConflictChecks
* useConflictCheck
* useRunConflictCheck
* useManualConflictSearch
* useReviewConflict

Required API client

* runConflictCheck()
* manualSearch()
* listConflictChecks()
* getConflictCheck()
* reviewConflict()

---

# 12. Security Considerations

This module follows:

* 005 - Security Standards

The following security requirements are specific to the Conflict Check module.

---

## Firm Isolation

Conflict searches must only examine data belonging to the authenticated user's firm.

Cross-firm searches are strictly prohibited.

---

## Authorization

Only authorized users may:

* Execute conflict checks.
* Review conflict results.
* Record attorney decisions.
* Perform manual conflict searches.

Authorization is enforced by the Roles & Permissions module.

---

## Read-Only Search

Conflict Check is a read-only search process.

Executing a conflict search must never modify:

* Leads
* Clients
* Matters
* Opposing Parties

Only the conflict check execution record may be created or updated.

---

## Attorney Decision

Only authorized attorneys may record the final conflict decision.

Once a decision has been recorded, it becomes immutable.

Corrections require creating a new conflict check.

---

## Lead Conversion Protection

A Lead may not be converted into a Client until:

* A conflict check has been completed.
* The final decision is **CLEARED**.

The Client Management module must enforce this rule.

---

## Auditability

Every significant action must generate an Audit Log entry.

Examples include:

* Conflict Check Executed
* Manual Conflict Search
* Conflict Review Completed
* Conflict Cleared
* Conflict Waived
* Conflict Rejected

---

# 13. Acceptance Criteria

The module is complete only if all of the following are true.

---

## Conflict Search

Users can execute a conflict search.

Searches include:

* Leads
* Clients
* Matters
* Opposing Parties

---

## Search Criteria

The search engine supports:

* Person Name
* Organization Name
* Email
* Phone Number

Multiple search criteria may be combined.

---

## Search Results

The system classifies results as:

* No Conflict
* Possible Conflict
* Confirmed Conflict

Supporting matches are displayed for attorney review.

---

## Attorney Review

Authorized users can:

* Review results.
* Record review notes.
* Record the final decision.

---

## Lead Protection

A Lead cannot be converted unless the conflict decision is **CLEARED**.

---

## History

Completed conflict checks remain permanently available.

Historical conflict checks are never modified or deleted.

---

## Testing

* Unit tests pass.
* Integration tests pass.
* Conflict engine tests pass.
* Manual QA passes.

---

# 14. File Manifest

The implementation must create the following files.

---

## Backend

```text
apps/api/src/modules/conflict-check/

index.ts

conflict-check.controller.ts

conflict-check.service.ts

conflict-check.repository.ts

conflict-check.routes.ts

conflict-check.validation.ts

conflict-check.constants.ts

conflict-check.types.ts

conflict-engine.service.ts

name-matching.service.ts

schemas/

tests/
```

---

## Frontend

```text
apps/web/src/modules/conflict-check/

pages/

ConflictCheckPage.tsx

ConflictDetailsPage.tsx

ManualConflictSearchPage.tsx

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

```text
packages/types

packages/validation
```

Only create shared code if it is reused across multiple modules.

---

# 15. Implementation Deliverables

## Backend

Implement:

* Conflict Search Engine
* Name Matching
* Organization Matching
* Email Matching
* Phone Matching
* Conflict Result Generation
* Attorney Review
* Conflict Decision Recording
* Conflict History

---

## Frontend

Implement:

* Conflict Search UI
* Conflict Results UI
* Manual Search UI
* Attorney Review UI
* Conflict API Client
* Conflict Hooks

---

## Database

Create:

* conflict_checks

Implement indexes defined in this specification.

---

## Testing

Implement:

* Unit Tests
* Integration Tests
* Conflict Engine Tests
* Authorization Tests

The Conflict Check module is considered incomplete if automated tests are absent.

---

## Documentation

Update:

* API Documentation
* Database Documentation
* Conflict Check Workflow Diagram (if changed)

---

# 16. Future Enhancements

The following capabilities are intentionally excluded from this module and will be implemented in future specifications.

* Fuzzy Name Matching
* Phonetic Matching
* Alias Detection
* Relationship-Based Conflict Detection
* AI-Assisted Conflict Analysis
* Conflict Risk Scoring
* External Conflict Database Integration
* Bulk Conflict Checking
* Conflict Review Dashboard
* Automated Conflict Alerts

---

# 17. Definition of Done

This module is complete when:

* Product requirements are implemented.
* Business rules are implemented.
* Database collection is implemented.
* API endpoints are implemented.
* Backend implementation is complete.
* Frontend implementation is complete.
* Conflict search engine is implemented.
* Validation is complete.
* Automated tests pass.
* Manual QA passes.
* Documentation is updated.
* Code review is complete.

---

# AI Implementation Strategy

Refer to the standard AI Implementation Strategy defined for all modules.

The AI agent must create and maintain:

```text
docs/07-implementation/022-conflict-check-progress.md
```

The progress document must be updated after each implementation phase and must include:

* Current Phase
* Overall Progress
* Completed Tasks
* Pending Tasks
* Known Issues
* Technical Decisions
* Deviations from this specification (if any)

