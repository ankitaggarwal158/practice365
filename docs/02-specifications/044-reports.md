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

# 044 - Reports

**Module ID:** 044

**Module Name:** Reports

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

---

# PART A — Product Specification

---

# 1. Purpose

The Reports module provides operational and management reports across Practice365.

Reports aggregate business data from existing modules to help firms monitor workload, productivity, billing and business performance.

The Reports module is read-only and never owns business data.

---

# 2. Scope

This module includes:

- Matter Reports
- Client Reports
- Time Tracking Reports
- Billing Reports
- Invoice Reports
- User Productivity Reports
- Export (CSV / PDF)

---

# 3. Out of Scope

This module does not include:

- Business Intelligence
- Predictive Analytics
- Custom Report Builder
- Scheduled Reports

---

# 4. Dependencies

Business Module Dependencies

- 023 Client Management
- 024 Matter Management
- 035 Document Management
- 036 Time Tracking
- 037 Billing & Invoicing
- 042 Activity Log & Audit Trail

Referenced By

- Dashboard
- Firm Administration

---

# 5. Business Requirements

## REPORT-001

Reports are generated on demand.

---

## REPORT-002

Reports are read-only.

---

## REPORT-003

Reports only include data accessible to the requesting user.

---

## REPORT-004

Reports support filtering.

Typical filters include:

- Date Range
- Matter
- Client
- User
- Status

---

## REPORT-005

Reports support sorting.

---

## REPORT-006

Reports support export.

Supported formats:

- CSV
- PDF

---

## REPORT-007

Generating reports must generate an Audit Log entry.

---

# 6. User Stories

### Matter Report

As a Firm Administrator,

I want to generate a Matter report,

so I can monitor firm workload.

---

### Billing Report

As a billing administrator,

I want to generate billing reports,

so I can monitor revenue and outstanding invoices.

---

### Time Report

As a partner,

I want to review recorded billable hours,

so I can evaluate productivity.

---

### Export Report

As an administrator,

I want to export reports,

for management and compliance purposes.

---

# 7. User Workflows

Detailed workflows are documented in:

- `06-diagrams/reports.drawio`

Implementation must follow the approved workflow.

---

# PART B — Engineering Specification

---

# 8. Report Data Sources

This module follows:

- 002 - Module Architecture

The Reports module owns no business data.

Reports aggregate information from existing modules.

---

## Available Reports

| Report | Source Module |
|---------|---------------|
| Matter Report | Matter Management |
| Client Report | Client Management |
| Time Report | Time Tracking |
| Invoice Report | Billing |
| Revenue Report | Billing |
| User Activity Report | Audit Log |

---

# 9. API Design

This module follows:

- 004 - API Conventions

## Endpoints

| Method | Endpoint | Description |
|---------|----------------------------|-------------------------|
| GET | /reports/matters | Matter Report |
| GET | /reports/clients | Client Report |
| GET | /reports/time | Time Report |
| GET | /reports/invoices | Invoice Report |
| GET | /reports/revenue | Revenue Report |
| GET | /reports/user-activity | User Activity Report |
| GET | /reports/export | Export Report |

---

## Query Parameters

Reports should support common filters.

Examples:

```text
fromDate

toDate

matterId

clientId

userId

status

page

limit

sort
```

---

## Response Models

```json
{
    "success": true,
    "data": [],
    "summary": {},
    "pagination": {}
}
```

---

# 10. Backend Requirements

Backend module location

```text
apps/api/src/modules/reports
```

Implement:

- Report Aggregation
- Filtering
- Sorting
- Pagination
- CSV Export
- PDF Export
- Summary Calculations

Business logic belongs in the Service layer.

Repositories should not duplicate business logic from source modules.

---

## Aggregation Rules

Reports aggregate data from:

- Clients
- Matters
- Time Entries
- Billing
- Audit Logs

The Reports module must never persist duplicated business data.

---

## Export Rules

Support:

- CSV
- PDF

Exports must respect all authorization rules.

Large exports should be streamed where practical.

---

## Performance

Reports should support pagination.

Aggregation queries should use indexes wherever possible.

Large reports must remain performant.

---

# 11. Frontend Requirements

Frontend module location

```text
apps/web/src/modules/reports
```

Required pages

- Matter Report
- Client Report
- Time Report
- Billing Report
- User Activity Report

Required components

- Report Filters
- Summary Cards
- Report Table
- Export Dialog

Required hooks

- useMatterReport
- useClientReport
- useTimeReport
- useBillingReport
- useUserActivityReport

Required API client

- getMatterReport()
- getClientReport()
- getTimeReport()
- getBillingReport()
- getUserActivityReport()
- exportReport()

---

# 12. Security Considerations

This module follows:

- 005 - Security Standards

The following security requirements are specific to the Reports module.

---

## Firm Isolation

Every report must only contain data belonging to the authenticated user's Firm.

Cross-firm reporting is prohibited.

---

## Authorization

Users may only generate reports for modules they are authorized to access.

Examples:

- Billing reports require Billing permissions.
- Matter reports require Matter permissions.
- User Activity reports require Audit permissions.

---

## Read Only

Reports are read-only.

No report endpoint may modify business data.

---

## Export Security

Exports must respect:

- Firm isolation
- User permissions
- Applied filters

Generated exports must contain exactly the same data visible in the application.

---

## Sensitive Data

Reports must not expose:

- Password hashes
- Authentication tokens
- Internal secrets
- Hidden administrative fields

Personally identifiable information should only be included where authorized.

---

## Auditability

Generating or exporting reports must generate an Audit Log entry.

---

# 13. Acceptance Criteria

The module is complete only if all of the following are true.

---

## Matter Reports

Users can:

- Generate Matter reports.
- Filter by status.
- Filter by date.
- Export results.

---

## Client Reports

Users can:

- Generate Client reports.
- Filter by Client.
- Export results.

---

## Billing Reports

Authorized users can:

- View invoice summaries.
- View revenue summaries.
- View outstanding balances.
- Export reports.

---

## Time Reports

Users can:

- View billable hours.
- View non-billable hours.
- Filter by Matter.
- Filter by User.
- Export reports.

---

## User Activity Reports

Authorized users can:

- View user activity.
- Filter by user.
- Filter by date.
- Export reports.

---

## Testing

- Unit tests pass.
- Integration tests pass.
- Export tests pass.
- Authorization tests pass.
- Manual QA passes.

---

# 14. File Manifest

The implementation must create the following files.

---

## Backend

```text
apps/api/src/modules/reports/

index.ts

reports.controller.ts

reports.service.ts

reports.repository.ts

reports.routes.ts

reports.validation.ts

reports.types.ts

csv-export.service.ts

pdf-export.service.ts

report-aggregation.service.ts

schemas/

tests/
```

---

## Frontend

```text
apps/web/src/modules/reports/

pages/

MatterReportPage.tsx

ClientReportPage.tsx

TimeReportPage.tsx

BillingReportPage.tsx

UserActivityReportPage.tsx

components/

ReportFilters.tsx

ReportTable.tsx

SummaryCards.tsx

ExportDialog.tsx

hooks/

api/

types/

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

- Report Aggregation
- Filtering
- Sorting
- Pagination
- CSV Export
- PDF Export

---

## Frontend

Implement:

- Report Pages
- Filter Components
- Export Dialog
- API Client
- React Query Hooks

---

## Testing

Implement:

- Unit Tests
- Integration Tests
- Export Tests
- Authorization Tests

The Reports module is considered incomplete if automated tests are absent.

---

## Documentation

Update:

- API Documentation
- Reporting Documentation

---

# 16. Future Enhancements

The following capabilities are intentionally excluded from this module and will be implemented in future specifications.

- Custom Report Builder
- Saved Reports
- Scheduled Reports
- Email Report Delivery
- Dashboard Analytics
- Interactive Charts
- Drill-down Reports
- Data Warehouse Integration

---

# 17. Definition of Done

This module is complete when:

- Product requirements are implemented.
- Report aggregation is implemented.
- API endpoints are implemented.
- Backend implementation is complete.
- Frontend implementation is complete.
- Export functionality works.
- Automated tests pass.
- Manual QA passes.
- Documentation is updated.
- Code review is complete.

---

# AI Implementation Strategy

Refer to the standard AI Implementation Strategy defined for all modules.

The AI agent must create and maintain:

```text
docs/07-implementation/044-reports-progress.md
```

The progress document must be updated after each implementation phase and must include:

- Current Phase
- Overall Progress
- Completed Tasks
- Pending Tasks
- Known Issues
- Technical Decisions
- Deviations from this specification (if any)