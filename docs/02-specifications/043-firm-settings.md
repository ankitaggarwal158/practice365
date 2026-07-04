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

# 043 - Firm Settings

**Module ID:** 043

**Module Name:** Firm Settings

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

The Firm Settings module manages firm-wide configuration used throughout Practice365.

It acts as the central configuration repository for operational settings, branding, numbering schemes and regional preferences.

Changes made in this module immediately affect all applicable modules.

---

# 2. Scope

This module includes:

- Firm Profile
- Office Information
- Branding
- Time Zone
- Date & Time Format
- Currency
- Numbering Sequences
- Default Preferences
- System Preferences

---

# 3. Out of Scope

This module does not include:

- User Preferences
- Billing Configuration
- Role Management
- Subscription Management

---

# 4. Dependencies

Business Module Dependencies

- 011 User Management
- 012 Roles & Permissions
- 013 Firm Management

Referenced By

All business modules.

---

# 5. Business Requirements

## SETTINGS-001

Every Firm has exactly one Settings record.

---

## SETTINGS-002

Only Firm Owners and Firm Administrators may modify Firm Settings.

---

## SETTINGS-003

Branding changes apply throughout the application.

---

## SETTINGS-004

Numbering sequences are configurable.

Examples:

- Matter Numbers
- Invoice Numbers
- Client Numbers

---

## SETTINGS-005

Regional preferences support:

- Time Zone
- Currency
- Date Format
- Time Format

---

## SETTINGS-006

Settings changes generate Audit Log entries.

---

## SETTINGS-007

Firm Settings are never deleted.

---

# 6. User Stories

### Update Branding

As a Firm Administrator,

I want to upload my firm's branding,

so generated documents reflect my organization.

---

### Configure Numbering

As a Firm Owner,

I want to define numbering formats,

so firm records follow internal standards.

---

### Regional Settings

As an administrator,

I want to configure time zone and currency,

so the application behaves correctly for my jurisdiction.

---

# 7. User Workflows

Detailed workflows are documented in:

- `06-diagrams/firm-settings.drawio`

Implementation must follow the approved workflow.

---

# PART B — Engineering Specification

---

# 8. Data Model

This module follows:

- 003 - Database Conventions

This module owns the following collection.

| Collection | Purpose |
|------------|----------|
| firm_settings | Firm-wide configuration |

---

## 8.1 firm_settings

### Purpose

Stores configuration applicable to an entire Firm.

Exactly one settings record exists per Firm.

---

### Fields

| Field | Type | Description |
|------|------|-------------|
| _id | ObjectId | Primary Key |
| firmId | ObjectId | Firm Reference |
| firmLogo | String | Logo URL |
| primaryColor | String | Branding |
| secondaryColor | String | Branding |
| timezone | String | IANA Timezone |
| currency | String | ISO Currency Code |
| dateFormat | String | Display Format |
| timeFormat | Enum | 12/24 Hour |
| matterNumberPrefix | String | Prefix |
| matterNextNumber | Number | Next Sequence |
| clientNumberPrefix | String | Prefix |
| clientNextNumber | Number | Next Sequence |
| invoiceNumberPrefix | String | Prefix |
| invoiceNextNumber | Number | Next Sequence |
| createdAt | Date | Created Timestamp |
| updatedAt | Date | Updated Timestamp |

---

### Time Format Enum

```text
12_HOUR

24_HOUR
```

---

### Relationships

One Firm

↓

One Firm Settings

---

### Indexes

Create indexes on:

- firmId

Composite:

- firmId (Unique)

---

# 9. API Design

This module follows:

- 004 - API Conventions

## Endpoints

| Method | Endpoint | Description |
|---------|------------------|-----------------------|
| GET | /firm-settings | Get Settings |
| PATCH | /firm-settings | Update Settings |
| POST | /firm-settings/logo | Upload Logo |

---

## Request Models

### Update Settings

```json
{
    "timezone": "Asia/Kolkata",
    "currency": "INR",
    "dateFormat": "DD/MM/YYYY",
    "timeFormat": "12_HOUR"
}
```

---

### Upload Logo

Multipart Form Data

```text
logo
```

---

## Response Models

### Firm Settings

```json
{
    "success": true,
    "data": {}
}
```

---

# 10. Backend Requirements

Backend module location

```text
apps/api/src/modules/firm-settings
```

Implement:

- Settings CRUD
- Logo Upload
- Number Sequence Management
- Branding
- Validation
- Audit Integration

Business logic belongs in the Service layer.

Repositories contain persistence logic only.

Controllers remain thin.

---

## Numbering Rules

Matter Numbers

Client Numbers

Invoice Numbers

must each maintain independent sequences.

Sequence values must increase atomically.

Duplicate numbers are not permitted.

---

## Branding Rules

Logo upload must validate:

- File Type
- Maximum Size
- Image Dimensions (optional)

Old logos may be safely replaced.

---

## Regional Settings

Support:

- Time Zone
- Currency
- Date Format
- Time Format

Changes affect new UI rendering immediately.

---

# 11. Frontend Requirements

Frontend module location

```text
apps/web/src/modules/firm-settings
```

Required pages

- Firm Settings

Required sections

- Firm Profile
- Branding
- Regional Settings
- Numbering Settings

Required hooks

- useFirmSettings
- useUpdateFirmSettings
- useUploadLogo

Required API client

- getSettings()
- updateSettings()
- uploadLogo()

---

# 12. Security Considerations

This module follows:

- 005 - Security Standards

The following security requirements are specific to the Firm Settings module.

---

## Authorization

Only users with appropriate administrative permissions may modify Firm Settings.

Recommended permissions:

- FIRM_SETTINGS_VIEW
- FIRM_SETTINGS_MANAGE

---

## Firm Isolation

Every Firm maintains exactly one Settings record.

Users may only access settings belonging to their own Firm.

Cross-firm configuration access is prohibited.

---

## Number Sequence Integrity

Matter, Client and Invoice numbering sequences must be incremented atomically.

Concurrent requests must never generate duplicate numbers.

Sequence values may only increase.

---

## Branding Security

Uploaded branding assets must be validated.

Allowed validations include:

- File Type
- Maximum File Size
- Malware Scanning (future)
- Image Validation

Executable files must never be accepted.

---

## Configuration Integrity

Configuration changes immediately affect dependent modules.

Changes should be validated before persistence.

Invalid configuration values must be rejected.

---

## Auditability

Every settings change must generate an Audit Log entry.

Examples include:

- Logo Updated
- Time Zone Changed
- Currency Changed
- Numbering Prefix Updated
- Sequence Reset (if permitted)

---

# 13. Acceptance Criteria

The module is complete only if all of the following are true.

---

## Firm Profile

Administrators can:

- View Firm Settings.
- Update Firm Profile.
- Upload Firm Logo.

---

## Regional Settings

Administrators can configure:

- Time Zone
- Currency
- Date Format
- Time Format

Changes apply throughout the application.

---

## Numbering

Administrators can configure:

- Matter Number Prefix
- Client Number Prefix
- Invoice Number Prefix

Sequence generation remains unique.

---

## Branding

Firm branding is reflected across supported modules and generated documents.

---

## Testing

- Unit tests pass.
- Integration tests pass.
- Number sequence tests pass.
- Authorization tests pass.
- Manual QA passes.

---

# 14. File Manifest

The implementation must create the following files.

---

## Backend

```text
apps/api/src/modules/firm-settings/

index.ts

firm-settings.controller.ts

firm-settings.service.ts

firm-settings.repository.ts

firm-settings.routes.ts

firm-settings.validation.ts

firm-settings.types.ts

number-sequence.service.ts

logo-upload.service.ts

schemas/

tests/
```

---

## Frontend

```text
apps/web/src/modules/firm-settings/

pages/

FirmSettingsPage.tsx

components/

FirmProfileSection.tsx

BrandingSection.tsx

RegionalSettingsSection.tsx

NumberingSection.tsx

LogoUploader.tsx

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

- Firm Settings Management
- Branding
- Logo Upload
- Number Sequence Management
- Validation
- Audit Integration

---

## Frontend

Implement:

- Firm Settings Page
- Branding UI
- Regional Settings UI
- Numbering Configuration
- API Client
- React Query Hooks

---

## Database

Create:

- firm_settings

Implement the unique index on `firmId`.

---

## Testing

Implement:

- Unit Tests
- Integration Tests
- Number Sequence Tests
- Authorization Tests

The Firm Settings module is considered incomplete if automated tests are absent.

---

## Documentation

Update:

- API Documentation
- Settings Documentation

---

# 16. Future Enhancements

The following capabilities are intentionally excluded from this module and will be implemented in future specifications.

- Multi-office Settings
- Office-specific Branding
- Localization Packs
- Theme Builder
- Custom CSS
- White-label Domains
- Email Branding
- Multi-currency Firms

---

# 17. Definition of Done

This module is complete when:

- Product requirements are implemented.
- Business rules are implemented.
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
docs/07-implementation/043-firm-settings-progress.md
```

The progress document must be updated after each implementation phase and must include:

- Current Phase
- Overall Progress
- Completed Tasks
- Pending Tasks
- Known Issues
- Technical Decisions
- Deviations from this specification (if any)