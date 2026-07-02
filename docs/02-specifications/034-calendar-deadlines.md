# 034 - Calendar & Deadlines

> **Implementation Note**
>
> This document defines both the functional requirements and implementation contract for the Calendar & Deadlines module.
>
> AI implementation must follow the foundation and architecture documents.

## Module Information

- **Module ID:** 034
- **Module Name:** Calendar & Deadlines
- **Category:** Core Module
- **Status:** Draft

---

# 1. Purpose

The Calendar & Deadlines module provides a centralized scheduling system for legal work.

It supports:

- Matter events
- Standalone events
- Court dates
- Hearings
- Meetings
- Internal reminders
- Deadlines
- Task due dates (reference)
- Firm and user calendars

This module implements the calendar requirements defined in the original SOW.

---

# 2. Scope

Included:

- Calendar CRUD
- Matter-linked events
- Standalone events
- Deadlines
- Reminder scheduling
- Calendar views
- Event completion
- Overdue tracking
- Search & filtering

Out of Scope:

- Google Calendar sync
- Outlook sync
- Video meetings
- Recurring events
- Resource booking

---

# 3. Dependencies

Depends on:

- Authentication
- User Management
- Firm Management
- Matter Management

Referenced by:

- Dashboard
- Notifications
- Tasks

---

# 4. Business Rules

- Every event belongs to exactly one firm.
- Every event is either:
  - Matter Event
  - Standalone Event
- Matter events reference one Matter.
- Standalone events do not reference a Matter.
- Events may be assigned to one or more users.
- Deadlines may have multiple reminders.
- Completed events remain in history.
- Events are soft deleted only.
- Every change generates an audit log.

---

# 5. Data Model

## Collection

`calendar_events`

### Fields

| Field | Type |
|------|------|
| _id | ObjectId |
| firmId | ObjectId |
| matterId | ObjectId? |
| title | String |
| description | String |
| eventType | Enum |
| startDateTime | Date |
| endDateTime | Date |
| allDay | Boolean |
| location | String |
| assignedUsers | ObjectId[] |
| reminderOffsets | Number[] |
| status | Enum |
| completedAt | Date |
| completedBy | ObjectId |
| deleted | Boolean |
| deletedAt | Date |
| deletedBy | ObjectId |
| createdBy | ObjectId |
| createdAt | Date |
| updatedAt | Date |

### Event Types

- COURT_DATE
- HEARING
- MEETING
- DEADLINE
- APPOINTMENT
- REMINDER
- INTERNAL_EVENT
- OTHER

### Status

- UPCOMING
- COMPLETED
- MISSED
- CANCELLED

Indexes:

- firmId
- matterId
- startDateTime
- assignedUsers
- status

Composite:

- firmId + startDateTime
- firmId + assignedUsers

---

# 6. API

| Method | Endpoint |
|---------|----------|
| GET | /calendar/events |
| GET | /calendar/events/:id |
| POST | /calendar/events |
| PATCH | /calendar/events/:id |
| DELETE | /calendar/events/:id |
| PATCH | /calendar/events/:id/complete |

---

# 7. Backend

Location:

`apps/api/src/modules/calendar`

Implement:

- CRUD
- Validation
- Reminder scheduling
- Completion
- Overdue detection
- Matter association
- Search
- Soft delete

---

# 8. Frontend

Location:

`apps/web/src/modules/calendar`

Pages:

- Calendar
- Day View
- Week View
- Month View
- Event Details
- Create Event
- Edit Event

Components:

- Calendar Grid
- Agenda List
- Event Form
- Reminder Editor
- Filters

Hooks:

- useCalendarEvents
- useCalendarEvent
- useCreateEvent
- useUpdateEvent
- useDeleteEvent
- useCompleteEvent

---

# 9. Security

- Firm isolation mandatory.
- Users access only their firm's events.
- Matter must belong to same firm.
- Soft delete only.
- Authorization enforced on CRUD.

---

# 10. Acceptance Criteria

- Create/edit/delete events.
- Matter-linked events.
- Standalone events.
- Multiple reminders.
- Day/week/month views.
- Complete events.
- Overdue events.
- Search and filtering.
- Unit and integration tests pass.

---

# 11. File Manifest

Backend:

```
apps/api/src/modules/calendar/

index.ts
calendar.controller.ts
calendar.service.ts
calendar.repository.ts
calendar.routes.ts
calendar.validation.ts
calendar.types.ts
schemas/
tests/
```

Frontend:

```
apps/web/src/modules/calendar/

pages/
components/
hooks/
api/
types/
tests/
index.ts
```

---

# 12. AI Implementation Strategy

Create and maintain:

`docs/07-implementation/034-calendar-deadlines-progress.md`

Track:

- Current Phase
- Overall Progress
- Completed Tasks
- Pending Tasks
- Known Issues
- Technical Decisions
- Deviations
