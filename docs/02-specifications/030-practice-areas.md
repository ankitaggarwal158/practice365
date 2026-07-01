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

# 030 - Practice Areas

**Module ID:** 030

**Module Name:** Practice Areas

**Module Category:** Master Data

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

The Practice Areas module manages the legal practice areas available within a firm.

Practice Areas provide standardized categorization for legal matters and enable consistent reporting, filtering, billing, dashboards and analytics across the platform.

Every Matter must reference exactly one Practice Area.

Practice Areas are master data owned by each firm.

---

# 2. Scope

This module includes:

* Practice Area Management
* Practice Area Activation
* Practice Area Deactivation
* Default Practice Areas
* Matter Association
* Practice Area Search
* Practice Area Ordering

---

# 3. Out of Scope

This module does not include:

* Matter Management
* Billing Rules
* Matter Templates
* Court Types
* Task Templates

These capabilities are implemented by other modules.

---

# 4. Dependencies

Business Module Dependencies

* 010 Authentication
* 011 User Management
* 012 Roles & Permissions
* 013 Firm Management

Referenced By

* 024 Matter Management
* Reporting
* Billing
* Dashboards
* Search
* Analytics

---

# 5. Business Requirements

## PRACTICEAREA-001

Every Practice Area belongs to exactly one firm.

---

## PRACTICEAREA-002

Each Practice Area has:

* Name
* Description
* Display Order
* Active Status

---

## PRACTICEAREA-003

Names must be unique within a firm.

Duplicate Practice Area names are prohibited.

---

## PRACTICEAREA-004

Practice Areas may be activated or deactivated.

Inactive Practice Areas:

* Cannot be selected for new Matters.
* Continue to appear on historical Matters.

---

## PRACTICEAREA-005

Practice Areas are never permanently deleted.

Soft deletion is mandatory.

---

## PRACTICEAREA-006

Practice Areas may be reordered.

The configured order is used throughout the application.

---

## PRACTICEAREA-007

New firms receive a default set of Practice Areas during onboarding.

Examples include:

* Family Law
* Civil Litigation
* Criminal Law
* Corporate Law
* Employment Law
* Estate Planning
* Immigration
* Intellectual Property
* Real Estate
* Tax Law

These defaults may be modified by the firm after creation.

---

## PRACTICEAREA-008

If a Practice Area is in use by one or more Matters, it cannot be deleted.

It may only be deactivated.

---

## PRACTICEAREA-009

Historical Matters must always retain their original Practice Area.

---

## PRACTICEAREA-010

Every significant Practice Area event must generate an Audit Log entry.

Examples include:

* Practice Area Created
* Practice Area Updated
* Practice Area Activated
* Practice Area Deactivated
* Display Order Changed

---

# 6. User Stories

### Create Practice Area

As a Firm Administrator,

I want to create a new Practice Area,

so my firm can categorize matters.

---

### Edit Practice Area

As a Firm Administrator,

I want to modify Practice Area details,

so classifications remain accurate.

---

### Reorder Practice Areas

As a Firm Administrator,

I want to reorder Practice Areas,

so commonly used areas appear first.

---

### Deactivate Practice Area

As a Firm Administrator,

I want to deactivate unused Practice Areas,

while preserving historical Matters.

---

### View Practice Areas

As a staff member,

I want to view available Practice Areas,

when creating a Matter.

---

# 7. User Workflows

The detailed Practice Area workflow diagrams are documented in:

* `06-diagrams/practice-areas-flow.drawio`

This module defines business behaviour only.

Implementation must follow the approved workflow.

---

# PART B — Engineering Specification

---

# 8. Data Model

This module follows the standards defined in:

* 003 - Database Conventions

This module owns the following collection.

| Collection     | Purpose                            |
| -------------- | ---------------------------------- |
| practice_areas | Firm-specific legal practice areas |

---

## 8.1 practice_areas

### Purpose

Stores the legal practice areas available to a firm.

Practice Areas are master reference data used by Matters and reporting modules.

---

### Fields

| Field        | Type     | Description              |
| ------------ | -------- | ------------------------ |
| _id          | ObjectId | Primary Key              |
| firmId       | ObjectId | Firm Reference           |
| name         | String   | Practice Area Name       |
| code         | String   | Unique Internal Code     |
| description  | String   | Description              |
| displayOrder | Number   | UI Display Order         |
| color        | String   | Optional Display Color   |
| icon         | String   | Optional Icon Identifier |
| isSystem     | Boolean  | System Default Area      |
| isActive     | Boolean  | Active Status            |
| deleted      | Boolean  | Soft Delete Flag         |
| deletedAt    | Date     | Soft Delete Timestamp    |
| deletedBy    | ObjectId | Deleted By               |
| createdBy    | ObjectId | Creator                  |
| createdAt    | Date     | Created Timestamp        |
| updatedAt    | Date     | Updated Timestamp        |

---

### Relationships

One Firm

↓

Many Practice Areas

---

One Practice Area

↓

Many Matters

---

### Indexes

Create indexes on:

* firmId
* name
* code
* displayOrder
* isActive

Composite indexes:

* firmId + name (unique)
* firmId + code (unique)

---

# 9. API Design

This module follows:

* 004 - API Conventions

## Endpoints

| Method | Endpoint                   | Description               | Auth Required |
| ------ | -------------------------- | ------------------------- | ------------- |
| GET    | /practice-areas            | List Practice Areas       | Yes           |
| GET    | /practice-areas/:id        | Get Practice Area         | Yes           |
| POST   | /practice-areas            | Create Practice Area      | Yes           |
| PATCH  | /practice-areas/:id        | Update Practice Area      | Yes           |
| PATCH  | /practice-areas/:id/status | Activate / Deactivate     | Yes           |
| PATCH  | /practice-areas/reorder    | Reorder Practice Areas    | Yes           |
| DELETE | /practice-areas/:id        | Soft Delete Practice Area | Yes           |

---

## Request Models

### Create Practice Area

```json
{
    "name": "Family Law",
    "code": "FAMILY",
    "description": "Family law matters."
}
```

---

### Update Status

```json
{
    "isActive": false
}
```

---

### Reorder

```json
{
    "practiceAreas": [
        {
            "id": "...",
            "displayOrder": 1
        },
        {
            "id": "...",
            "displayOrder": 2
        }
    ]
}
```

---

## Response Models

### Practice Area Response

```json
{
    "success": true,
    "data": {}
}
```

---

### Practice Area List

```json
{
    "success": true,
    "data": []
}
```

---

# 10. Backend Requirements

This module follows:

* 002 - Module Architecture

Backend module location

```text
apps/api/src/modules/practice-areas
```

The Practice Areas module must implement:

* CRUD Operations
* Activation / Deactivation
* Soft Delete
* Display Ordering
* Duplicate Validation
* Default Practice Area Seeder

Business logic belongs inside the Service layer.

Repositories contain persistence logic only.

Controllers remain thin.

---

# 11. Frontend Requirements

This module follows:

* 002 - Module Architecture

Frontend module location

```text
apps/web/src/modules/practice-areas
```

Required pages

* Practice Area List
* Create Practice Area
* Edit Practice Area

Required components

* Practice Area Table
* Practice Area Form
* Status Toggle
* Reorder List
* Delete Confirmation Dialog

Required hooks

* usePracticeAreas
* usePracticeArea
* useCreatePracticeArea
* useUpdatePracticeArea
* useDeletePracticeArea
* useReorderPracticeAreas

Required API client

* listPracticeAreas()
* getPracticeArea()
* createPracticeArea()
* updatePracticeArea()
* deletePracticeArea()
* reorderPracticeAreas()
* updateStatus()

---

# 12. Security Considerations

This module follows:

* 005 - Security Standards

The following security requirements are specific to the Practice Areas module.

---

## Firm Isolation

Every Practice Area belongs to exactly one firm.

Users may only access Practice Areas belonging to their own firm.

Cross-firm access is prohibited.

---

## Authorization

Only authorized users may:

* Create Practice Areas
* Update Practice Areas
* Activate Practice Areas
* Deactivate Practice Areas
* Reorder Practice Areas
* Delete Practice Areas

Authorization is enforced by the Roles & Permissions module.

---

## Referential Integrity

A Practice Area referenced by one or more Matters cannot be permanently deleted.

If referenced:

* Deletion is rejected.
* Deactivation is permitted.
* Historical Matter references remain unchanged.

---

## Soft Delete

Practice Areas must never be physically removed from the database.

Deletion consists of:

* Setting `deleted = true`
* Recording `deletedAt`
* Recording `deletedBy`

Soft-deleted Practice Areas are hidden from normal application workflows.

---

## Immutable References

Changing a Matter's Practice Area must never modify historical reporting data.

Historical Matters always retain the Practice Area assigned at the time of work.

---

## Display Order

Reordering Practice Areas affects presentation only.

Changing display order must never affect:

* Existing Matters
* Reports
* Billing
* Historical Records

---

## Auditability

Every significant Practice Area action must generate an Audit Log entry.

Examples include:

* Practice Area Created
* Practice Area Updated
* Practice Area Activated
* Practice Area Deactivated
* Practice Area Deleted
* Practice Area Reordered

---

# 13. Acceptance Criteria

The module is complete only if all of the following are true.

---

## Creation

Firm administrators can create Practice Areas.

Duplicate names are prevented within the same firm.

---

## Editing

Users can update:

* Name
* Description
* Display Order
* Color
* Icon

System fields remain immutable.

---

## Activation

Practice Areas can be activated and deactivated.

Inactive Practice Areas cannot be selected when creating new Matters.

---

## Reordering

Users can reorder Practice Areas.

The configured order is reflected throughout the application.

---

## Deletion

Unused Practice Areas can be soft deleted.

Referenced Practice Areas cannot be deleted.

---

## Search

Users can:

* View Practice Areas.
* Search Practice Areas.
* Filter by Active Status.

---

## Testing

* Unit tests pass.
* Integration tests pass.
* Manual QA passes.

---

# 14. File Manifest

The implementation must create the following files.

---

## Backend

```text
apps/api/src/modules/practice-areas/

index.ts

practice-area.controller.ts

practice-area.service.ts

practice-area.repository.ts

practice-area.routes.ts

practice-area.validation.ts

practice-area.constants.ts

practice-area.types.ts

practice-area.seeder.ts

schemas/

tests/
```

---

## Frontend

```text
apps/web/src/modules/practice-areas/

pages/

PracticeAreaListPage.tsx

CreatePracticeAreaPage.tsx

EditPracticeAreaPage.tsx

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

Only create shared code if reused across multiple modules.

---

# 15. Implementation Deliverables

## Backend

Implement:

* Practice Area CRUD
* Activation / Deactivation
* Soft Delete
* Display Ordering
* Duplicate Detection
* Default Practice Area Seeder

---

## Frontend

Implement:

* Practice Area List
* Practice Area Form
* Status Toggle
* Reorder UI
* Delete Confirmation
* Practice Area API Client
* Practice Area Hooks

---

## Database

Create:

* practice_areas

Implement indexes defined in this specification.

Seed default Practice Areas for every newly created firm.

---

## Testing

Implement:

* Unit Tests
* Integration Tests
* Seeder Tests
* Reorder Tests

The Practice Areas module is considered incomplete if automated tests are absent.

---

## Documentation

Update:

* API Documentation
* Database Documentation
* Practice Area Workflow Diagram (if changed)

---

# 16. Future Enhancements

The following capabilities are intentionally excluded from this module and will be implemented in future specifications.

* Hierarchical Practice Areas
* Practice Area Templates
* Practice Area Billing Defaults
* Practice Area SLA Rules
* Practice Area-Specific Matter Templates
* Practice Area Permissions
* Practice Area Analytics
* AI Practice Area Classification
* Practice Area Icons Library
* Cross-Firm Practice Area Library

---

# 17. Definition of Done

This module is complete when:

* Product requirements are implemented.
* Business rules are implemented.
* Database collection is implemented.
* API endpoints are implemented.
* Backend implementation is complete.
* Frontend implementation is complete.
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
docs/07-implementation/030-practice-areas-progress.md
```

The progress document must be updated after each implementation phase and must include:

* Current Phase
* Overall Progress
* Completed Tasks
* Pending Tasks
* Known Issues
* Technical Decisions
* Deviations from this specification (if any)

