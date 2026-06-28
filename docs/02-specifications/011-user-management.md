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

# 011 - User Management

**Module ID:** 011

**Module Name:** User Management

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

The User Management module manages all internal users belonging to a law firm.

It is responsible for creating, maintaining and managing user accounts throughout their lifecycle.

This module owns:

* User accounts
* User profile information
* User lifecycle
* User invitations
* User preferences
* User status
* Firm membership

This module does **not** authenticate users.

Authentication is implemented by **010 - Authentication**.

This module does **not** determine user permissions.

Authorization is implemented by **013 - Roles & Permissions**.

---

# 2. Scope

This module includes:

* User invitations
* User account creation
* User profile management
* User activation
* User suspension
* User deactivation
* User search
* User listing
* User details
* User preferences
* User profile image
* User timezone
* User language
* User notification preferences

---

# 3. Out of Scope

This module does not include:

* Login
* Logout
* Password Reset
* Session Management
* Email Verification
* Roles
* Permissions
* Firm Management
* Client Portal Users
* External Contacts

These capabilities are implemented by other modules.

---

# 4. Dependencies

Business Module Dependencies

* 010 - Authentication

Future Module Integrations

* 012 - Firm Management
* 013 - Roles & Permissions
* 090 - Audit Log

---

# 5. Business Requirements

## USER-001

Every user account belongs to exactly one firm.

A user cannot exist independently of a firm.

---

## USER-002

Each user account is associated with exactly one unique email address.

Duplicate email addresses are not permitted.

---

## USER-003

User accounts are created only through the firm invitation process.

Public self-registration is not supported.

---

## USER-004

A newly invited user remains in **Pending Invitation** status until the invitation is accepted.

---

## USER-005

A user account becomes **Active** only after:

* Invitation accepted.
* Email verified.
* Initial password created.

---

## USER-006

Users may update their own profile information.

Users may not modify system-managed fields.

---

## USER-007

Firm administrators may:

* Invite users.
* Suspend users.
* Reactivate users.
* Deactivate users.

Permission to perform these actions is defined by the Roles & Permissions module.

---

## USER-008

Suspended users cannot authenticate.

Historical ownership of all records must remain unchanged.

---

## USER-009

Deactivated users cannot authenticate.

Deactivated users remain associated with:

* Matters
* Notes
* Documents
* Calendar Events
* Time Entries
* Audit Logs

No historical ownership may be reassigned automatically.

---

## USER-010

User accounts must never be permanently deleted.

Historical legal records require permanent attribution.

---

## USER-011

Each user may configure personal preferences including:

* Timezone
* Language
* Date Format
* Time Format
* Notification Preferences

---

## USER-012

Every significant user lifecycle event must be recorded by the Audit Log module.

Examples include:

* User Invited
* Invitation Accepted
* User Activated
* User Suspended
* User Reactivated
* User Deactivated
* Profile Updated

---

# 6. User Stories

### Invite User

As a Firm Administrator,

I want to invite a new team member,

so they can access the Practice365 platform.

---

### Accept Invitation

As an invited user,

I want to accept my invitation,

so my account becomes active.

---

### Update Profile

As a user,

I want to maintain my profile information,

so other members of the firm have accurate contact information.

---

### Update Preferences

As a user,

I want to configure my personal preferences,

so Practice365 behaves according to my preferred language, timezone and date formats.

---

### View Users

As a Firm Administrator,

I want to view every user belonging to my firm,

so I can manage staff members.

---

### Search Users

As a Firm Administrator,

I want to quickly search users,

so I can locate staff members efficiently.

---

### Suspend User

As a Firm Administrator,

I want to suspend a user,

without affecting historical ownership of work already completed.

---

### Deactivate User

As a Firm Administrator,

I want to deactivate a departing employee,

while preserving every historical record they created.

---

# 7. User Workflows

The detailed user management workflow diagrams are documented in:

* `06-diagrams/user-management-flow.drawio`

This module defines the business behaviour only.

Implementation must follow the approved workflow.

---

# PART B — Engineering Specification

---

# 8. Data Model

This module follows the standards defined in:

* 003 - Database Conventions

This module owns the following collection.

| Collection | Purpose                        |
| ---------- | ------------------------------ |
| users      | Stores all internal firm users |

The Authentication module references this collection but does not own it.

---

## 8.1 users

### Purpose

Stores every internal user account belonging to a law firm.

Authentication credentials are managed by **010 - Authentication**.

Authorization is managed by **013 - Roles & Permissions**.

---

### Fields

| Field                   | Type     | Description              |
| ----------------------- | -------- | ------------------------ |
| _id                     | ObjectId | Primary Key              |
| firmId                  | ObjectId | Reference to Firm        |
| email                   | String   | Unique Email Address     |
| firstName               | String   | User First Name          |
| lastName                | String   | User Last Name           |
| displayName             | String   | Preferred Display Name   |
| phone                   | String   | Phone Number             |
| avatarUrl               | String   | Profile Image            |
| jobTitle                | String   | Job Title                |
| status                  | Enum     | User Lifecycle Status    |
| timezone                | String   | Preferred Timezone       |
| language                | String   | Preferred Language       |
| dateFormat              | String   | Preferred Date Format    |
| timeFormat              | Enum     | 12 Hour / 24 Hour        |
| notificationPreferences | Object   | Notification Settings    |
| invitedBy               | ObjectId | User who sent invitation |
| invitationSentAt        | Date     | Invitation Timestamp     |
| invitationAcceptedAt    | Date     | Acceptance Timestamp     |
| lastLoginAt             | Date     | Last Successful Login    |
| createdAt               | Date     | Created Timestamp        |
| updatedAt               | Date     | Updated Timestamp        |

---

### Status Enum

```text
PENDING_INVITATION

ACTIVE

SUSPENDED

DEACTIVATED
```

---

### Relationships

One Firm

↓

Many Users

---

One User

↓

Many Matters

---

One User

↓

Many Notes

---

One User

↓

Many Calendar Events

---

One User

↓

Many Time Entries

---

One User

↓

Many Audit Log Entries

---

### Indexes

Create indexes on:

* email (unique)
* firmId
* status
* lastName
* invitedBy

---

# 9. API Design

This module follows:

* 004 - API Conventions

## Endpoints

| Method | Endpoint              | Description          | Auth Required |
| ------ | --------------------- | -------------------- | ------------- |
| GET    | /users                | List Users           | Yes           |
| GET    | /users/:id            | Get User Details     | Yes           |
| POST   | /users                | Invite User          | Yes           |
| PATCH  | /users/:id            | Update User          | Yes           |
| PATCH  | /users/:id/status     | Change User Status   | Yes           |
| GET    | /users/me             | Current User Profile | Yes           |
| PATCH  | /users/me             | Update Own Profile   | Yes           |
| PATCH  | /users/me/preferences | Update Preferences   | Yes           |

---

## Request Models

### Invite User

```json
{
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe"
}
```

---

### Update User

```json
{
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+15551234567",
    "jobTitle": "Senior Attorney"
}
```

---

### Change Status

```json
{
    "status": "SUSPENDED"
}
```

---

### Update Preferences

```json
{
    "timezone": "America/New_York",
    "language": "en",
    "dateFormat": "MM/DD/YYYY",
    "timeFormat": "12"
}
```

---

## Response Models

### User Response

```json
{
    "success": true,
    "data": {}
}
```

---

### User List Response

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
apps/api/src/modules/users
```

The User Management module must implement:

* User Invitation
* User Creation
* User Listing
* User Details
* User Search
* User Profile Management
* User Preference Management
* User Status Management

Business logic belongs inside the Service layer.

Database access belongs inside the Repository layer.

Controllers must remain thin.

Repositories must not contain business logic.

---

# 11. Frontend Requirements

This module follows:

* 002 - Module Architecture

Frontend module location

```text
apps/web/src/modules/users
```

Required pages

* User List
* User Details
* Invite User
* Edit User
* My Profile
* User Preferences

Required components

* User Table
* User Card
* User Avatar
* User Status Badge
* Invite User Modal
* User Profile Form
* User Preferences Form

Required hooks

* useUsers
* useUser
* useCurrentUser
* useCreateUser
* useUpdateUser
* useUpdatePreferences
* useChangeUserStatus

Required API client

* listUsers()
* getUser()
* inviteUser()
* updateUser()
* updateCurrentUser()
* updatePreferences()
* changeUserStatus()

---

# 12. Security Considerations

This module follows:

* 005 - Security Standards

The following security requirements are specific to the User Management module.

---

## User Visibility

Users may only view user accounts belonging to their own firm.

Cross-firm access is strictly prohibited.

---

## Profile Updates

Users may update only their own profile.

System-managed fields may not be modified.

Examples include:

* Firm
* Status
* Invitation Details
* Created Date
* Last Login
* Audit Information

---

## Administrative Actions

Inviting users, suspending users and deactivating users require the appropriate permissions.

Permission evaluation is handled by the Roles & Permissions module.

---

## Account Status

Only users with **ACTIVE** status may authenticate.

Users with the following statuses cannot authenticate:

* PENDING_INVITATION
* SUSPENDED
* DEACTIVATED

Authentication enforcement is handled by Module 010.

---

## Historical Ownership

Changing a user's status must never modify historical ownership of:

* Matters
* Notes
* Documents
* Calendar Events
* Time Entries
* Audit Logs

---

## User Invitations

Invitation links must:

* Be unique.
* Be single-use.
* Expire automatically.
* Become invalid once accepted.

Invitation authentication is handled by Module 010.

---

# 13. Acceptance Criteria

The module is complete only if all of the following are true.

---

## User Invitation

* Firm administrators can invite users.
* Invitation emails are generated.
* Duplicate invitations are prevented.
* Invitations expire automatically.

---

## User Creation

* Accepting an invitation creates a user account.
* User account is linked to the correct firm.
* Initial status is correctly assigned.

---

## User Profile

* Users can view their own profile.
* Users can update permitted profile fields.
* System-managed fields cannot be modified.

---

## User Preferences

Users can update:

* Timezone
* Language
* Date Format
* Time Format
* Notification Preferences

---

## User Search

Firm users can:

* List users.
* Search users.
* Filter users by status.

Search results are limited to the current firm.

---

## User Status

Firm administrators can:

* Suspend users.
* Reactivate users.
* Deactivate users.

Authentication reflects the updated status immediately.

---

## Historical Integrity

Historical ownership remains unchanged after:

* Suspension
* Reactivation
* Deactivation

---

## Testing

Unit tests pass.

Integration tests pass.

Manual QA passes.

---

# 14. File Manifest

The implementation must create the following files.

---

## Backend

```text
apps/api/src/modules/users/

index.ts

user.controller.ts

user.service.ts

user.repository.ts

user.routes.ts

user.validation.ts

user.constants.ts

user.types.ts

user.invitation.service.ts

schemas/

tests/
```

---

## Frontend

```text
apps/web/src/modules/users/

pages/

UserListPage.tsx

UserDetailsPage.tsx

UserProfilePage.tsx

InviteUserPage.tsx

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

* User Management Module
* User Invitation
* User Creation
* User Search
* User Listing
* User Details
* User Profile Management
* User Preference Management
* User Status Management

---

## Frontend

Implement:

* User List
* User Details
* User Profile
* Invite User
* User Preferences
* User API Client
* User Hooks

---

## Database

Create:

* users

Implement indexes defined in this specification.

---

## Testing

Implement:

* Unit Tests
* Integration Tests

User Management is considered incomplete if automated tests are absent.

---

## Documentation

Update:

* API Documentation
* Database Documentation
* User Management Workflow Diagram (if changed)

---

# 16. Future Enhancements

The following capabilities are intentionally excluded from this module and will be implemented in future specifications.

* User Groups
* User Teams
* Multiple Firm Membership
* User Delegation
* Out of Office Settings
* User Availability
* Presence Indicators
* User Activity Dashboard
* User Import / Export
* Bulk User Management

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
docs/07-implementation/011-user-management-progress.md
```

The progress document must be updated after each implementation phase and must include:

* Current Phase
* Overall Progress
* Completed Tasks
* Pending Tasks
* Known Issues
* Technical Decisions
* Deviations from this specification (if any)
