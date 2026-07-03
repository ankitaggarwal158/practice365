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

# 040 - Dashboard

**Module ID:** 040

**Module Name:** Dashboard

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

The Dashboard provides every authenticated user with a consolidated overview of their work.

The Dashboard surfaces important information from across Practice365, enabling users to quickly identify priorities, deadlines, workload and business metrics.

The Dashboard is read-only and aggregates information from other modules.

---

# 2. Scope

This module includes:

- Dashboard Summary
- My Tasks
- Upcoming Calendar Events
- Upcoming Deadlines
- Recent Matters
- Recent Documents
- Billing Summary
- Time Tracking Summary
- Quick Actions
- Recent Activity

---

# 3. Out of Scope

This module does not include:

- Analytics
- Business Intelligence
- Custom Dashboard Builder
- Saved Dashboard Layouts

---

# 4. Dependencies

Business Module Dependencies

- 011 User Management
- 024 Matter Management
- 034 Calendar & Deadlines
- 035 Document Management
- 036 Time Tracking
- 037 Billing & Invoicing

Referenced By

- Home Page

---

# 5. Business Requirements

## DASHBOARD-001

Every user has a personalized dashboard.

---

## DASHBOARD-002

Dashboard widgets display only information accessible to the authenticated user.

---

## DASHBOARD-003

Dashboard data is read-only.

Changes must be made from the owning module.

---

## DASHBOARD-004

Dashboard displays upcoming deadlines.

---

## DASHBOARD-005

Dashboard displays upcoming calendar events.

---

## DASHBOARD-006

Dashboard displays recently accessed Matters.

---

## DASHBOARD-007

Dashboard displays billing summaries for authorized users.

---

## DASHBOARD-008

Dashboard displays time tracking summaries for authorized users.

---

# 6. User Stories

### View Dashboard

As a user,

I want to see my work summary,

so I know what requires attention.

---

### View Deadlines

As an attorney,

I want to quickly identify upcoming deadlines,

so nothing is missed.

---

### View Billing

As a billing administrator,

I want to view outstanding invoices,

so collections remain current.

---

### Quick Actions

As a staff member,

I want quick access to common actions,

so I can work efficiently.

---

# 7. User Workflows

Detailed workflows are documented in:

- `06-diagrams/dashboard.drawio`

Implementation must follow the approved workflow.

---

# PART B — Engineering Specification

---

# 8. Dashboard Data Sources

This module follows:

- 002 - Module Architecture

The Dashboard owns no business data.

It aggregates information from existing modules.

---

## Dashboard Widgets

| Widget | Source Module |
|---------|---------------|
| My Matters | Matter Management |
| Upcoming Events | Calendar |
| Upcoming Deadlines | Calendar |
| Recent Documents | Document Management |
| Time Summary | Time Tracking |
| Outstanding Invoices | Billing |
| Recent Activity | Audit Log |
| Quick Actions | System |

---

# 9. API Design

This module follows:

- 004 - API Conventions

## Endpoints

| Method | Endpoint | Description |
|---------|-------------------------|---------------------------|
| GET | /dashboard | Dashboard Summary |
| GET | /dashboard/widgets | Widget Data |
| GET | /dashboard/activity | Recent Activity |
| GET | /dashboard/quick-actions | Quick Actions |

---

## Response Models

### Dashboard

```json
{
    "success": true,
    "data": {
        "matters": {},
        "calendar": {},
        "billing": {},
        "documents": {},
        "timeTracking": {},
        "activity": {}
    }
}
```

---

# 10. Backend Requirements

This module follows:

- 002 - Module Architecture

Backend module location

```text
apps/api/src/modules/dashboard
```

The module must implement:

- Dashboard Aggregation
- Widget APIs
- Permission-based Visibility
- Recent Activity Feed
- Summary Calculations

Business logic belongs in the Service layer.

Repositories should not duplicate logic from source modules.

Dashboard services should consume existing services wherever possible.

---

## Aggregation Rules

Dashboard must aggregate data from:

- Matter Module
- Calendar Module
- Documents Module
- Time Tracking Module
- Billing Module
- Audit Log Module

Dashboard must never own duplicated business logic.

---

## Performance

Dashboard APIs should minimize database round trips.

Prefer aggregation pipelines or parallel service calls where appropriate.

Dashboard response should remain performant with large datasets.

---

# 11. Frontend Requirements

This module follows:

- 002 - Module Architecture

Frontend module location

```text
apps/web/src/modules/dashboard
```

Required pages

- Dashboard

Required components

- KPI Cards
- Upcoming Deadlines
- Upcoming Events
- My Matters
- Recent Documents
- Outstanding Invoices
- Time Summary
- Recent Activity
- Quick Actions

Required hooks

- useDashboard
- useDashboardWidgets
- useDashboardActivity

Required API client

- getDashboard()
- getDashboardWidgets()
- getDashboardActivity()

---

# 12. Security Considerations

This module follows:

- 005 - Security Standards

The following security requirements are specific to the Dashboard module.

---

## Firm Isolation

Dashboard data must be limited to the authenticated user's Firm.

Cross-firm aggregation is prohibited.

---

## Authorization

Each widget must enforce the permissions of its source module.

Examples:

- Billing widgets require Billing permissions.
- Matter widgets require Matter permissions.
- Documents require Document permissions.

Hidden modules must not expose summary information.

---

## Read Only

The Dashboard is read-only.

No business data may be modified through Dashboard APIs.

Actions initiated from Dashboard must redirect to the owning module.

---

## Data Integrity

Dashboard values are calculated in real time from source modules.

The Dashboard must never persist duplicated business data.

---

## Auditability

Dashboard access should be logged according to the Audit Log module.

---

# 13. Acceptance Criteria

The module is complete only if all of the following are true.

---

## Dashboard

Users can view:

- My Matters
- Upcoming Calendar Events
- Upcoming Deadlines
- Recent Documents
- Time Summary
- Recent Activity

---

## Billing Summary

Authorized users can view:

- Draft Invoices
- Outstanding Invoices
- Overdue Invoices

Unauthorized users cannot.

---

## Performance

Dashboard loads within acceptable response times.

Widgets load successfully even with large datasets.

---

## Authorization

Users never see information outside their permissions.

Cross-firm data is never exposed.

---

## Testing

- Unit tests pass.
- Integration tests pass.
- Permission tests pass.
- Manual QA passes.

---

# 14. File Manifest

The implementation must create the following files.

---

## Backend

```text
apps/api/src/modules/dashboard/

index.ts

dashboard.controller.ts

dashboard.service.ts

dashboard.repository.ts

dashboard.routes.ts

dashboard.validation.ts

dashboard.types.ts

dashboard-aggregation.service.ts

schemas/

tests/
```

---

## Frontend

```text
apps/web/src/modules/dashboard/

pages/

DashboardPage.tsx

components/

DashboardLayout.tsx

KpiCards.tsx

UpcomingEvents.tsx

UpcomingDeadlines.tsx

RecentDocuments.tsx

RecentActivity.tsx

TimeSummary.tsx

BillingSummary.tsx

QuickActions.tsx

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

- Dashboard Aggregation
- Widget APIs
- Permission Filtering
- KPI Calculations
- Recent Activity Feed

---

## Frontend

Implement:

- Dashboard
- KPI Cards
- Widget Components
- API Client
- React Query Hooks

---

## Testing

Implement:

- Unit Tests
- Integration Tests
- Permission Tests

The Dashboard module is considered incomplete if automated tests are absent.

---

## Documentation

Update:

- API Documentation
- Dashboard Widget Documentation

---

# 16. Future Enhancements

The following capabilities are intentionally excluded from this module and will be implemented in future specifications.

- Custom Dashboard Layouts
- Widget Configuration
- Drag-and-Drop Widgets
- Analytics Dashboards
- Business Intelligence
- Saved Views

---

# 17. Definition of Done

This module is complete when:

- Product requirements are implemented.
- Widget aggregation is complete.
- API endpoints are implemented.
- Backend implementation is complete.
- Frontend implementation is complete.
- Permission filtering is complete.
- Automated tests pass.
- Manual QA passes.
- Documentation is updated.
- Code review is complete.

---

# AI Implementation Strategy

Refer to the standard AI Implementation Strategy defined for all modules.

The AI agent must create and maintain:

```text
docs/07-implementation/040-dashboard-progress.md
```

The progress document must be updated after each implementation phase and must include:

- Current Phase
- Overall Progress
- Completed Tasks
- Pending Tasks
- Known Issues
- Technical Decisions
- Deviations from this specification (if any)