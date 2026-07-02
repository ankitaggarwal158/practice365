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

# 033 - Notes

**Module ID:** 033

**Module Name:** Notes

**Module Category:** Supporting Module

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

The Notes module provides a centralized system for storing internal notes throughout Practice365.

Unlike module-specific notes (such as Intake Notes or Client Notes), this module provides a reusable note engine that supports multiple business entities.

Notes are internal to the firm and are never visible to clients.

Supported entities include:

* Matters
* Clients
* Leads
* Intakes
* Documents
* Tasks
* Calendar Events
* Time Entries
* Expenses
* Invoices

Additional entity types may be supported in future modules.

---

# 2. Scope

This module includes:

* Rich Text Notes
* Entity Association
* Note Timeline
* Author Tracking
* Note Editing
* Soft Delete
* Search
* Attachments (Reference Only)

---

# 3. Out of Scope

This module does not include:

* Document Storage
* Client Portal Comments
* Internal Chat
* Email Communication
* Versioned Documents

These capabilities are implemented by other modules.

---

# 4. Dependencies

Business Module Dependencies

* 010 Authentication
* 011 User Management
* 012 Roles & Permissions
* 013 Firm Management

Referenced By

* Matter Management
* Client Management
* Lead Management
* Intake
* Documents
* Tasks
* Calendar
* Billing
* Reporting

---

# 5. Business Requirements

## NOTE-001

Every Note belongs to exactly one firm.

---

## NOTE-002

Every Note is associated with exactly one business entity.

Supported entity types include:

* Matter
* Client
* Lead
* Intake
* Document
* Task
* Calendar Event
* Time Entry
* Expense
* Invoice

---

## NOTE-003

Every Note records:

* Author
* Creation Date
* Last Updated Date

---

## NOTE-004

Notes support rich text formatting.

---

## NOTE-005

Notes may be edited by authorized users.

Edit history is not maintained in this version.

---

## NOTE-006

Notes may be soft deleted.

Historical audit records remain available.

---

## NOTE-007

Notes participate in Global Search.

---

## NOTE-008

Every significant Note event must generate an Audit Log entry.

Examples include:

* Note Created
* Note Updated
* Note Deleted

---

# 6. User Stories

### Create Note

As a staff member,

I want to add notes to a Matter,

so important information is recorded.

---

### Edit Note

As the note author,

I want to update my note,

so information remains accurate.

---

### Search Notes

As a staff member,

I want to search notes,

so I can quickly find previous information.

---

### Delete Note

As an authorized user,

I want to remove obsolete notes,

while preserving audit history.

---

# 7. User Workflows

The detailed Notes workflow diagrams are documented in:

* `06-diagrams/notes-flow.drawio`

This module defines business behaviour only.

Implementation must follow the approved workflow.

---

# PART B — Engineering Specification

---

# 8. Data Model

This module follows the standards defined in:

* 003 - Database Conventions

This module owns the following collection.

| Collection | Purpose                                     |
| ---------- | ------------------------------------------- |
| notes      | Centralized notes for all business entities |

---

## 8.1 notes

### Purpose

Stores internal notes associated with business entities across Practice365.

Each note belongs to exactly one entity.

---

### Fields

| Field      | Type     | Description         |
| ---------- | -------- | ------------------- |
| _id        | ObjectId | Primary Key         |
| firmId     | ObjectId | Firm Reference      |
| entityType | Enum     | Parent Entity Type  |
| entityId   | ObjectId | Parent Entity ID    |
| title      | String   | Optional Note Title |
| content    | String   | Rich Text Content   |
| authorId   | ObjectId | Author              |
| isPinned   | Boolean  | Pin Status          |
| deleted    | Boolean  | Soft Delete Flag    |
| deletedAt  | Date     | Deleted Timestamp   |
| deletedBy  | ObjectId | Deleted By          |
| createdAt  | Date     | Created Timestamp   |
| updatedAt  | Date     | Updated Timestamp   |

---

### Entity Type Enum

```text
MATTER

CLIENT

LEAD

INTAKE

DOCUMENT

TASK

CALENDAR_EVENT

TIME_ENTRY

EXPENSE

INVOICE
```

---

### Relationships

One Firm

↓

Many Notes

---

One Business Entity

↓

Many Notes

---

One User

↓

Many Notes

---

### Indexes

Create indexes on:

* firmId
* entityType
* entityId
* authorId
* createdAt
* isPinned

Composite indexes:

* firmId + entityType + entityId

---

# 9. API Design

This module follows:

* 004 - API Conventions

## Endpoints

| Method | Endpoint       | Description      | Auth Required |
| ------ | -------------- | ---------------- | ------------- |
| GET    | /notes         | List Notes       | Yes           |
| GET    | /notes/:id     | Get Note         | Yes           |
| POST   | /notes         | Create Note      | Yes           |
| PATCH  | /notes/:id     | Update Note      | Yes           |
| DELETE | /notes/:id     | Soft Delete Note | Yes           |
| PATCH  | /notes/:id/pin | Pin / Unpin Note | Yes           |

---

## Request Models

### Create Note

```json
{
    "entityType": "MATTER",
    "entityId": "...",
    "title": "Phone Call",
    "content": "<p>Discussed settlement options.</p>"
}
```

---

### Update Note

```json
{
    "title": "Updated Title",
    "content": "<p>Updated content.</p>"
}
```

---

### Pin Note

```json
{
    "isPinned": true
}
```

---

## Response Models

### Note Response

```json
{
    "success": true,
    "data": {}
}
```

---

### Notes List Response

```json
{
    "success": true,
    "data": [],
    "pagination": {}
}
```

---

# 10. Backend Requirements

This module follows:

* 002 - Module Architecture

Backend module location

```text
apps/api/src/modules/notes
```

The module must implement:

* Note CRUD
* Rich Text Support
* Entity Association
* Pin / Unpin
* Search
* Soft Delete

Business logic belongs in the Service layer.

Repositories contain persistence logic only.

Controllers remain thin.

---

# 11. Frontend Requirements

This module follows:

* 002 - Module Architecture

Frontend module location

```text
apps/web/src/modules/notes
```

Required pages

* Notes List
* Note Details
* Create Note
* Edit Note

Required components

* Rich Text Editor
* Note Card
* Note Timeline
* Pinned Notes Section
* Delete Confirmation Dialog

Required hooks

* useNotes
* useNote
* useCreateNote
* useUpdateNote
* useDeleteNote
* usePinnedNotes

Required API client

* listNotes()
* getNote()
* createNote()
* updateNote()
* deleteNote()
* pinNote()

---

# 12. Security Considerations

This module follows:

* 005 - Security Standards

The following security requirements are specific to the Notes module.

---

## Firm Isolation

Every Note belongs to exactly one firm.

Users may only access Notes belonging to their own firm.

Cross-firm access is strictly prohibited.

---

## Entity Validation

Every Note must reference:

* A valid entity type.
* A valid entity ID.
* An entity belonging to the same firm.

Creating Notes against invalid entities is prohibited.

---

## Authorization

Users may create Notes only on entities they have permission to access.

Authorization must be validated against the parent entity.

---

## Editing

Only authorized users may edit Notes.

The original author may edit their own Notes.

Firm Administrators may edit any Note.

---

## Soft Delete

Notes are never permanently deleted.

Deletion consists of:

* Setting `deleted = true`
* Recording `deletedAt`
* Recording `deletedBy`

Deleted Notes remain available for audit purposes.

---

## Rich Text

Rich text content must be sanitized before storage.

Potential XSS content must be removed.

Only approved HTML elements may be stored.

---

## Attachments

Notes do not own file storage.

Attachments are managed by the Document Management module.

Notes may reference Document IDs only.

---

## Auditability

Every significant Note action must generate an Audit Log entry.

Examples include:

* Note Created
* Note Updated
* Note Deleted
* Note Pinned
* Note Unpinned

---

# 13. Acceptance Criteria

The module is complete only if all of the following are true.

---

## Creation

Users can create Notes against supported entities.

---

## Editing

Users can:

* Edit Notes.
* Pin Notes.
* Unpin Notes.

Authorization rules are enforced.

---

## Search

Users can:

* Search Notes.
* Filter by entity.
* Filter by author.
* Filter by pinned status.

---

## Soft Delete

Users can soft delete Notes.

Deleted Notes no longer appear in normal searches.

---

## Rich Text

Rich text formatting is preserved.

Unsafe HTML is removed.

---

## Testing

* Unit tests pass.
* Integration tests pass.
* Rich text sanitization tests pass.
* Manual QA passes.

---

# 14. File Manifest

The implementation must create the following files.

---

## Backend

```text id="uvs3ub"
apps/api/src/modules/notes/

index.ts

note.controller.ts

note.service.ts

note.repository.ts

note.routes.ts

note.validation.ts

note.constants.ts

note.types.ts

note-search.service.ts

schemas/

tests/
```

---

## Frontend

```text id="jlwmh8"
apps/web/src/modules/notes/

pages/

NotesListPage.tsx

NoteDetailsPage.tsx

CreateNotePage.tsx

EditNotePage.tsx

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

```text id="k0hqu4"
packages/types

packages/validation
```

Only create shared code if reused across multiple modules.

---

# 15. Implementation Deliverables

## Backend

Implement:

* Note CRUD
* Rich Text Support
* Entity Association
* Pin / Unpin
* Search
* Soft Delete

---

## Frontend

Implement:

* Rich Text Editor
* Notes Timeline
* Note List
* Note Form
* Pin / Unpin UI
* Notes API Client
* Notes Hooks

---

## Database

Create:

* notes

Implement indexes defined in this specification.

---

## Testing

Implement:

* Unit Tests
* Integration Tests
* Rich Text Sanitization Tests
* Authorization Tests

The Notes module is considered incomplete if automated tests are absent.

---

## Documentation

Update:

* API Documentation
* Database Documentation
* Notes Workflow Diagram (if changed)

---

# 16. Future Enhancements

The following capabilities are intentionally excluded from this module and will be implemented in future specifications.

* Note Mentions
* Note Reactions
* Note Version History
* Note Templates
* AI Note Summaries
* Voice Notes
* Handwritten Notes
* Note Categories
* Internal Comments
* Collaborative Editing

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

```text id="6i5hmc"
docs/07-implementation/033-notes-progress.md
```

The progress document must be updated after each implementation phase and must include:

* Current Phase
* Overall Progress
* Completed Tasks
* Pending Tasks
* Known Issues
* Technical Decisions
* Deviations from this specification (if any)
