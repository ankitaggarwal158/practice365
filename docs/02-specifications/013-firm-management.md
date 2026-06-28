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

# 013 - Firm Management

**Module ID:** 013

**Module Name:** Firm Management

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

The Firm Management module manages the law firm as the primary business entity within Practice365.

Every business record in Practice365 ultimately belongs to a single firm.

This module is responsible for:

* Firm creation
* Firm profile
* Firm configuration
* Office information
* Branding
* Regional settings
* Default system settings

The Firm Management module serves as the ownership root for all business modules.

---

# 2. Scope

This module includes:

* Firm creation
* Firm profile management
* Firm information
* Office information
* Contact information
* Firm logo
* Firm branding
* Timezone
* Currency
* Locale
* Default billing settings
* Practice areas
* Business settings

---

# 3. Out of Scope

This module does not include:

* User Management
* Authentication
* Roles & Permissions
* Client Management
* Matter Management
* Billing
* Subscription Management
* Payment Processing

These capabilities belong to other modules.

---

# 4. Dependencies

Business Module Dependencies

* 010 Authentication
* 011 User Management
* 012 Roles & Permissions

Future Module Integrations

* All remaining business modules

---

# 5. Business Requirements

## FIRM-001

Every Practice365 account belongs to exactly one firm.

The firm is the root business entity.

---

## FIRM-002

Every user belongs to exactly one firm.

Users cannot be transferred between firms.

---

## FIRM-003

Every client, matter, invoice, document, calendar event and time entry belongs to exactly one firm.

---

## FIRM-004

Firm information may only be modified by authorized users.

Authorization is determined by the Roles & Permissions module.

---

## FIRM-005

Each firm has a unique display name.

---

## FIRM-006

Each firm may upload:

* Firm Logo
* Brand Image

Images are optional.

---

## FIRM-007

Each firm configures:

* Timezone
* Currency
* Date Format
* Time Format
* Locale

These values become defaults throughout the platform.

---

## FIRM-008

Each firm may configure default billing settings.

These settings are referenced by the Billing modules.

---

## FIRM-009

Firm deletion is prohibited.

Historical legal data must always remain associated with the originating firm.

---

## FIRM-010

Every significant firm configuration change must be recorded by the Audit Log module.

---

# 6. User Stories

### Create Firm

As a Firm Owner,

I want to create my law firm,

so I can begin using Practice365.

---

### Update Firm Profile

As a Firm Administrator,

I want to update firm information,

so it remains accurate.

---

### Upload Firm Logo

As a Firm Administrator,

I want to upload my firm's branding,

so it appears throughout the platform.

---

### Configure Regional Settings

As a Firm Administrator,

I want to configure timezone, currency and locale,

so the platform behaves correctly for my jurisdiction.

---

### Configure Billing Defaults

As a Firm Administrator,

I want to configure default billing settings,

so new matters inherit firm defaults.

---

# 7. User Workflows

The detailed firm management workflow diagrams are documented in:

* `06-diagrams/firm-management-flow.drawio`

This module defines business behaviour only.

Implementation must follow the approved workflow.

---

# PART B — Engineering Specification

---

# 8. Data Model

This module follows the standards defined in:

* 003 - Database Conventions

This module owns the following collection.

| Collection | Purpose                                          |
| ---------- | ------------------------------------------------ |
| firms      | Stores firm information and global configuration |

Every other business collection references the `firmId` from this module.

---

## 8.1 firms

### Purpose

Stores the root business entity for every Practice365 account.

All users, clients, matters, documents, invoices and business records ultimately belong to a single firm.

---

### Fields

| Field              | Type     | Description           |
| ------------------ | -------- | --------------------- |
| _id                | ObjectId | Primary Key           |
| name               | String   | Firm Name             |
| legalName          | String   | Registered Legal Name |
| displayName        | String   | Display Name          |
| logoUrl            | String   | Firm Logo             |
| website            | String   | Website               |
| email              | String   | Contact Email         |
| phone              | String   | Contact Number        |
| addressLine1       | String   | Address               |
| addressLine2       | String   | Address               |
| city               | String   | City                  |
| state              | String   | State                 |
| postalCode         | String   | Postal Code           |
| country            | String   | Country               |
| timezone           | String   | Default Timezone      |
| currency           | String   | Default Currency      |
| locale             | String   | Default Locale        |
| dateFormat         | String   | Default Date Format   |
| timeFormat         | Enum     | 12 / 24 Hour          |
| defaultBillingRate | Number   | Default Hourly Rate   |
| invoicePrefix      | String   | Invoice Prefix        |
| matterPrefix       | String   | Matter Number Prefix  |
| isActive           | Boolean  | Firm Status           |
| createdAt          | Date     | Created Timestamp     |
| updatedAt          | Date     | Updated Timestamp     |

---

### Relationships

One Firm

↓

Many Users

---

One Firm

↓

Many Leads

---

One Firm

↓

Many Clients

---

One Firm

↓

Many Matters

---

One Firm

↓

Many Documents

---

One Firm

↓

Many Calendar Events

---

One Firm

↓

Many Time Entries

---

### Indexes

Create indexes on:

* name
* legalName
* country
* isActive

---

# 9. API Design

This module follows:

* 004 - API Conventions

## Endpoints

| Method | Endpoint       | Description          | Auth Required |
| ------ | -------------- | -------------------- | ------------- |
| GET    | /firm          | Get Firm Profile     | Yes           |
| PATCH  | /firm          | Update Firm Profile  | Yes           |
| PATCH  | /firm/branding | Update Branding      | Yes           |
| PATCH  | /firm/settings | Update Firm Settings | Yes           |
| GET    | /firm/settings | Get Firm Settings    | Yes           |

---

## Request Models

### Update Firm

```json
{
    "name": "Smith & Associates",
    "website": "https://smithlaw.com",
    "phone": "+1 555 123456"
}
```

---

### Update Settings

```json
{
    "timezone": "America/New_York",
    "currency": "USD",
    "locale": "en-US",
    "dateFormat": "MM/DD/YYYY",
    "timeFormat": "12"
}
```

---

### Update Branding

```json
{
    "logoUrl": "...",
    "primaryColor": "#1F3A5F"
}
```

---

## Response Models

### Firm

```json
{
    "success": true,
    "data": {}
}
```

---

# 10. Backend Requirements

This module follows:

* 002 - Module Architecture

Backend module location

```text
apps/api/src/modules/firm
```

The Firm Management module must implement:

* Firm Profile
* Firm Settings
* Branding
* Regional Settings
* Billing Defaults
* Firm Configuration

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
apps/web/src/modules/firm
```

Required pages

* Firm Profile
* Firm Settings
* Branding
* Regional Settings

Required components

* Firm Profile Form
* Address Form
* Branding Form
* Regional Settings Form
* Billing Defaults Form

Required hooks

* useFirm
* useUpdateFirm
* useFirmSettings
* useUpdateFirmSettings

Required API client

* getFirm()
* updateFirm()
* getFirmSettings()
* updateFirmSettings()
* updateBranding()

---

# 12. Security Considerations

This module follows:

* 005 - Security Standards

The following security requirements are specific to the Firm Management module.

---

## Firm Isolation

Every authenticated request must operate only within the authenticated user's firm.

Cross-firm access is strictly prohibited.

No API may expose another firm's information.

---

## Administrative Access

Only users with the appropriate permissions may:

* Update Firm Profile
* Modify Firm Settings
* Change Branding
* Configure Billing Defaults

Authorization is enforced by Module **012 - Roles & Permissions**.

---

## Ownership

The `firmId` associated with a business record must never be modified after creation.

Changing ownership between firms is prohibited.

---

## Regional Settings

Changes to:

* Timezone
* Currency
* Locale
* Date Format
* Time Format

must affect only future application behaviour.

Historical business records must remain unchanged.

---

## Branding

Uploaded branding assets must:

* Validate file type
* Validate file size
* Be stored in object storage

Only metadata is stored in MongoDB.

---

## Auditability

Every modification to firm configuration must generate an Audit Log entry.

Examples include:

* Firm Profile Updated
* Firm Branding Updated
* Regional Settings Updated
* Billing Defaults Updated

---

# 13. Acceptance Criteria

The module is complete only if all of the following are true.

---

## Firm Profile

* Firm information can be viewed.
* Firm information can be updated.
* Validation prevents invalid data.

---

## Branding

* Firm logo can be uploaded.
* Branding can be updated.
* Existing branding can be replaced.

---

## Regional Settings

Firm administrators can configure:

* Timezone
* Currency
* Locale
* Date Format
* Time Format

These settings become platform defaults.

---

## Billing Defaults

Firm administrators can configure default billing settings.

Future billing modules consume these defaults.

---

## Authorization

Unauthorized users cannot modify firm information.

Cross-firm access is prohibited.

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
apps/api/src/modules/firm/

index.ts

firm.controller.ts

firm.service.ts

firm.repository.ts

firm.routes.ts

firm.validation.ts

firm.constants.ts

firm.types.ts

firm.settings.service.ts

schemas/

tests/
```

---

## Frontend

```text
apps/web/src/modules/firm/

pages/

FirmProfilePage.tsx

FirmSettingsPage.tsx

FirmBrandingPage.tsx

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

* Firm Profile
* Firm Settings
* Branding Management
* Regional Settings
* Billing Defaults
* Firm Configuration

---

## Frontend

Implement:

* Firm Profile UI
* Firm Settings UI
* Branding UI
* Regional Settings UI
* Firm API Client
* Firm Hooks

---

## Database

Create:

* firms

Implement indexes defined in this specification.

---

## Testing

Implement:

* Unit Tests
* Integration Tests

Firm Management is considered incomplete if automated tests are absent.

---

## Documentation

Update:

* API Documentation
* Database Documentation
* Firm Management Workflow Diagram (if changed)

---

# 16. Future Enhancements

The following capabilities are intentionally excluded from this module and will be implemented in future specifications.

* Multiple Office Locations
* Branch Offices
* Multi-Tenant Administration
* Organization Hierarchy
* Firm Subscription Management
* Firm Branding Themes
* Custom Domains
* Firm-Level Feature Flags
* Department Management
* Practice Group Management

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
docs/07-implementation/013-firm-management-progress.md
```

The progress document must be updated after each implementation phase and must include:

* Current Phase
* Overall Progress
* Completed Tasks
* Pending Tasks
* Known Issues
* Technical Decisions
* Deviations from this specification (if any)
