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

# 036 - Time Tracking

**Module ID:** 036

**Module Name:** Time Tracking

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

The Time Tracking module enables attorneys and staff to accurately record billable and non-billable work performed for clients and matters.

Time entries form the foundation for billing and invoicing while providing a complete audit trail of work performed.

---

# 2. Scope

This module includes:

- Manual Time Entry
- Timer-based Time Tracking
- Billable / Non-Billable Entries
- Matter Association
- User Association
- Time Entry Editing
- Time Entry Approval (Optional)
- Billing Integration
- Soft Delete
- Audit Trail

---

# 3. Out of Scope

This module does not include:

- Invoice Generation
- Trust Accounting
- Expense Tracking
- Payroll
- Accounting Integration

These capabilities are implemented by separate modules.

---

# 4. Dependencies

Business Module Dependencies

- 010 Authentication
- 011 User Management
- 012 Roles & Permissions
- 013 Firm Management
- 023 Client Management
- 024 Matter Management

Referenced By

- Billing
- Invoicing
- Reports
- Dashboard

---

# 5. Business Requirements

## TIME-001

Every Time Entry belongs to exactly one Firm.

---

## TIME-002

Every Time Entry belongs to exactly one Matter.

---

## TIME-003

Every Time Entry belongs to exactly one User.

---

## TIME-004

Time Entries may be:

- Billable
- Non-Billable

---

## TIME-005

Running timers may be started, paused, resumed and stopped.

Only one active timer per user is permitted.

---

## TIME-006

Completed Time Entries may be edited until invoiced.

Once invoiced, they become read-only.

---

## TIME-007

Time Entries are never permanently deleted.

Soft deletion is mandatory.

---

## TIME-008

Every significant Time Entry event must generate an Audit Log entry.

Examples include:

- Timer Started
- Timer Paused
- Timer Resumed
- Timer Stopped
- Time Entry Created
- Time Entry Updated
- Time Entry Deleted
- Time Entry Billed

---

# 6. User Stories

### Start Timer

As an attorney,

I want to start a timer while working,

so my time is recorded accurately.

---

### Manual Entry

As a legal assistant,

I want to manually enter time,

so previously completed work is captured.

---

### Edit Entry

As a user,

I want to correct a time entry before billing,

so invoices remain accurate.

---

### Review Time

As a firm administrator,

I want to review recorded time,

before invoices are generated.

---

# 7. User Workflows

Detailed workflows are documented in:

- `06-diagrams/time-tracking.drawio`

Implementation must follow the approved workflow.

---

# PART B — Engineering Specification

---

# 8. Data Model

This module follows the standards defined in:

- 003 - Database Conventions

This module owns the following collection.

| Collection | Purpose |
|------------|----------|
| time_entries | Records billable and non-billable work performed by firm users |

---

## 8.1 time_entries

### Purpose

Stores all billable and non-billable time recorded against Matters.

Time entries are later consumed by the Billing and Invoicing modules.

---

### Fields

| Field | Type | Description |
|---------|------|-------------|
| _id | ObjectId | Primary Key |
| firmId | ObjectId | Firm Reference |
| matterId | ObjectId | Matter Reference |
| clientId | ObjectId | Client Reference (Derived for reporting) |
| userId | ObjectId | Timekeeper |
| activityDescription | String | Work Description |
| startTime | Date | Timer Start |
| endTime | Date | Timer End |
| durationMinutes | Number | Total Minutes |
| billingType | Enum | BILLABLE / NON_BILLABLE |
| hourlyRate | Decimal | Snapshot Billing Rate |
| amount | Decimal | Calculated Amount |
| timerStatus | Enum | Current Timer Status |
| isInvoiced | Boolean | Billing Status |
| invoiceId | ObjectId | Invoice Reference |
| deleted | Boolean | Soft Delete |
| deletedAt | Date | Deleted Timestamp |
| deletedBy | ObjectId | Deleted By |
| createdBy | ObjectId | Creator |
| createdAt | Date | Created Timestamp |
| updatedAt | Date | Updated Timestamp |

---

### Billing Type Enum

```text
BILLABLE

NON_BILLABLE
```

---

### Timer Status Enum

```text
RUNNING

PAUSED

STOPPED

MANUAL
```

---

### Relationships

One Firm

↓

Many Time Entries

---

One Matter

↓

Many Time Entries

---

One User

↓

Many Time Entries

---

One Invoice

↓

Many Time Entries

---

### Indexes

Create indexes on:

- firmId
- matterId
- clientId
- userId
- startTime
- isInvoiced

Composite indexes:

- firmId + matterId
- firmId + userId
- firmId + startTime
- firmId + isInvoiced

---

# 9. API Design

This module follows:

- 004 - API Conventions

## Endpoints

| Method | Endpoint | Description | Auth Required |
|----------|---------------------------------------|----------------------|---------------|
| GET | /time-entries | List Time Entries | Yes |
| GET | /time-entries/:id | Get Time Entry | Yes |
| POST | /time-entries | Create Manual Entry | Yes |
| POST | /time-entries/start | Start Timer | Yes |
| PATCH | /time-entries/pause | Pause Timer | Yes |
| PATCH | /time-entries/resume | Resume Timer | Yes |
| PATCH | /time-entries/stop | Stop Timer | Yes |
| PATCH | /time-entries/:id | Update Time Entry | Yes |
| DELETE | /time-entries/:id | Soft Delete | Yes |

---

## Request Models

### Manual Time Entry

```json
{
    "matterId": "...",
    "billingType": "BILLABLE",
    "activityDescription": "Reviewed client documents",
    "durationMinutes": 90
}
```

---

### Start Timer

```json
{
    "matterId": "...",
    "billingType": "BILLABLE",
    "activityDescription": "Court preparation"
}
```

---

### Stop Timer

```json
{
    "notes": "Completed preparation."
}
```

---

## Response Models

### Time Entry

```json
{
    "success": true,
    "data": {}
}
```

---

### Time Entry List

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

- 002 - Module Architecture

Backend module location

```text
apps/api/src/modules/time-tracking
```

The module must implement:

- Manual Time Entries
- Running Timer
- Pause / Resume
- Stop Timer
- Edit Entries
- Billing Integration
- Search
- Soft Delete

Business logic belongs in the Service layer.

Repositories contain persistence logic only.

Controllers remain thin.

---

## Timer Rules

Only one running timer per user is permitted.

Starting another timer while one is running must return a validation error.

Paused timers may be resumed.

Stopped timers become immutable except for metadata edits prior to invoicing.

---

## Billing Rules

Hourly rate must be copied from the Matter/User billing configuration at the time the entry is created.

Subsequent billing rate changes must not affect historical entries.

Amount is calculated as:

```
Duration × Hourly Rate
```

The calculated amount is stored with the time entry.

---

## Edit Rules

Time entries may be edited only while:

- Not invoiced
- Not deleted

Once linked to an invoice:

- Duration cannot change.
- Billing type cannot change.
- Hourly rate cannot change.

Only administrative notes may be updated.

---

## Search Requirements

Support searching by:

- Matter
- Client
- User
- Billing Type
- Date Range
- Invoice Status
- Description

Search excludes deleted entries.

---

# 11. Frontend Requirements

This module follows:

- 002 - Module Architecture

Frontend module location

```text
apps/web/src/modules/time-tracking
```

Required pages

- Time Entry List
- Time Entry Details
- Create Manual Entry
- Edit Time Entry
- Timer Dashboard

Required components

- Running Timer Widget
- Manual Entry Form
- Time Entry Table
- Filters
- Delete Confirmation Dialog

Required hooks

- useTimeEntries
- useTimeEntry
- useStartTimer
- usePauseTimer
- useResumeTimer
- useStopTimer
- useUpdateTimeEntry

Required API client

- listTimeEntries()
- getTimeEntry()
- createTimeEntry()
- startTimer()
- pauseTimer()
- resumeTimer()
- stopTimer()
- updateTimeEntry()
- deleteTimeEntry()

---

# 12. Security Considerations

This module follows:

- 005 - Security Standards

The following security requirements are specific to the Time Tracking module.

---

## Firm Isolation

Every Time Entry belongs to exactly one Firm.

Users may only access Time Entries belonging to their Firm.

Cross-firm access is prohibited.

---

## Matter Validation

Every Time Entry must reference a valid Matter belonging to the same Firm.

Time cannot be recorded against:

- Deleted Matters
- Archived Matters
- Matters belonging to another Firm

---

## Single Active Timer

A user may have only one active timer.

The backend must enforce this constraint.

Concurrent timer creation must be rejected.

---

## Invoice Protection

Once a Time Entry has been included in an Invoice:

- Duration cannot change.
- Start time cannot change.
- End time cannot change.
- Hourly rate cannot change.
- Billing type cannot change.

Only administrative metadata may be updated if permitted.

---

## Soft Delete

Time Entries are never permanently deleted.

Deletion consists of:

- deleted = true
- deletedAt
- deletedBy

Deleted entries remain available for audit purposes.

---

## Auditability

Every significant Time Entry event must generate an Audit Log entry.

Examples include:

- Timer Started
- Timer Paused
- Timer Resumed
- Timer Stopped
- Entry Created
- Entry Updated
- Entry Deleted
- Entry Invoiced

---

# 13. Acceptance Criteria

The module is complete only if all of the following are true.

---

## Manual Entry

Users can:

- Create manual entries.
- Edit entries before invoicing.
- Delete unused entries.

---

## Running Timer

Users can:

- Start a timer.
- Pause a timer.
- Resume a timer.
- Stop a timer.

Only one active timer exists per user.

---

## Billing Integration

Every billable entry stores:

- Duration
- Hourly Rate
- Calculated Amount

Historical entries remain unchanged even if billing rates change later.

---

## Search

Users can:

- Search by Matter.
- Search by Client.
- Search by User.
- Search by Billing Type.
- Search by Date Range.
- Search by Invoice Status.

---

## Soft Delete

Deleted entries:

- Do not appear in normal searches.
- Remain available for audit.
- Cannot be invoiced.

---

## Testing

- Unit tests pass.
- Integration tests pass.
- Timer lifecycle tests pass.
- Billing calculation tests pass.
- Authorization tests pass.
- Manual QA passes.

---

# 14. File Manifest

The implementation must create the following files.

---

## Backend

```text
apps/api/src/modules/time-tracking/

index.ts

time-entry.controller.ts

time-entry.service.ts

time-entry.repository.ts

time-entry.routes.ts

time-entry.validation.ts

time-entry.constants.ts

time-entry.types.ts

timer.service.ts

billing-calculation.service.ts

schemas/

tests/
```

---

## Frontend

```text
apps/web/src/modules/time-tracking/

pages/

TimeEntryListPage.tsx

TimeEntryDetailsPage.tsx

CreateTimeEntryPage.tsx

EditTimeEntryPage.tsx

TimerDashboardPage.tsx

components/

RunningTimer.tsx

ManualEntryForm.tsx

TimeEntryTable.tsx

TimeFilters.tsx

DeleteConfirmationDialog.tsx

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

- Manual Time Entry
- Running Timer
- Pause / Resume
- Stop Timer
- Billing Calculation
- Matter Association
- Search
- Soft Delete
- Billing Integration

---

## Frontend

Implement:

- Running Timer Widget
- Manual Entry Form
- Time Entry List
- Time Entry Details
- Search & Filters
- API Client
- React Query Hooks

---

## Database

Create:

- time_entries

Implement all indexes defined in this specification.

---

## Testing

Implement:

- Unit Tests
- Integration Tests
- Timer Lifecycle Tests
- Billing Calculation Tests
- Authorization Tests

The Time Tracking module is considered incomplete if automated tests are absent.

---

## Documentation

Update:

- API Documentation
- Database Documentation
- Time Tracking Workflow Diagram (if changed)

---

# 16. Future Enhancements

The following capabilities are intentionally excluded from this module and will be implemented in future specifications.

- Multiple Simultaneous Timers
- Offline Time Tracking
- Automatic Idle Detection
- Calendar-Based Time Capture
- Mobile Background Timer
- AI Time Suggestions
- Bulk Time Entry Import
- Bulk Time Entry Editing
- Timer Templates
- Voice Time Entry

---

# 17. Definition of Done

This module is complete when:

- Product requirements are implemented.
- Business rules are implemented.
- Database collection is implemented.
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
docs/07-implementation/036-time-tracking-progress.md
```

The progress document must be updated after each implementation phase and must include:

- Current Phase
- Overall Progress
- Completed Tasks
- Pending Tasks
- Known Issues
- Technical Decisions
- Deviations from this specification (if any)