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

# 032 - Matter Contacts

**Module ID:** 032

**Module Name:** Matter Contacts

**Module Category:** Core Supporting Module

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

The Matter Contacts module manages all contacts associated with a Matter that are not Clients or Opposing Parties.

Matter Contacts provide a centralized directory of individuals and organizations involved in legal work, enabling reuse across multiple Matters.

Examples include:

* Witnesses
* Expert Witnesses
* Judges
* Mediators
* Arbitrators
* Court Clerks
* Insurance Adjusters
* Government Officials
* Third-Party Contacts
* Other External Contacts

A Matter may have multiple Contacts, and a Contact may be associated with multiple Matters.

---

# 2. Scope

This module includes:

* Contact Management
* Individual Contacts
* Organization Contacts
* Matter Association
* Contact Roles
* Contact Search
* Duplicate Detection
* Archive

---

# 3. Out of Scope

This module does not include:

* Client Management
* Opposing Party Management
* Internal Users
* Email Communication
* Calendar Invitations

These capabilities are implemented by other modules.

---

# 4. Dependencies

Business Module Dependencies

* 010 Authentication
* 011 User Management
* 012 Roles & Permissions
* 013 Firm Management
* 024 Matter Management

Referenced By

* Calendar
* Tasks
* Documents
* Email
* Reporting

---

# 5. Business Requirements

## CONTACT-001

Every Matter Contact belongs to exactly one firm.

---

## CONTACT-002

Each Matter Contact is either:

* Individual
* Organization

The type cannot be changed after creation.

---

## CONTACT-003

A Matter Contact may be linked to multiple Matters.

A Matter may contain multiple Contacts.

---

## CONTACT-004

Each Matter association records the Contact's role.

Examples include:

* Witness
* Expert Witness
* Judge
* Mediator
* Arbitrator
* Court Clerk
* Insurance Adjuster
* Government Official
* Consultant
* Other

---

## CONTACT-005

Duplicate Matter Contacts should be minimized.

The system should assist users by detecting potential duplicates.

---

## CONTACT-006

Matter Contacts may be archived.

Historical Matter associations remain intact.

---

## CONTACT-007

Matter Contacts are never permanently deleted.

Soft deletion is mandatory.

---

## CONTACT-008

Every significant Matter Contact event must generate an Audit Log entry.

Examples include:

* Contact Created
* Contact Updated
* Contact Archived
* Contact Restored
* Linked to Matter
* Removed from Matter

---

# 6. User Stories

### Create Contact

As a legal assistant,

I want to create a Matter Contact,

so I can associate them with legal work.

---

### Link Contact

As a staff member,

I want to link a Contact to multiple Matters,

so information is reused.

---

### Search Contacts

As a staff member,

I want to search Contacts,

so duplicate records are avoided.

---

### Archive Contact

As a firm administrator,

I want to archive unused Contacts,

while preserving historical relationships.

---

# 7. User Workflows

The detailed Matter Contact workflow diagrams are documented in:

* `06-diagrams/matter-contacts-flow.drawio`

This module defines business behaviour only.

Implementation must follow the approved workflow.

---

# PART B — Engineering Specification

---

# 8. Data Model

This module follows the standards defined in:

* 003 - Database Conventions

This module owns the following collections.

| Collection           | Purpose                                     |
| -------------------- | ------------------------------------------- |
| matter_contacts      | Master contact records                      |
| matter_contact_links | Junction table between Matters and Contacts |

---

## 8.1 matter_contacts

### Purpose

Stores all reusable contacts that may participate in one or more legal matters.

These contacts are not Clients, Opposing Parties, or internal Users.

---

### Fields

| Field            | Type     | Description               |
| ---------------- | -------- | ------------------------- |
| _id              | ObjectId | Primary Key               |
| firmId           | ObjectId | Firm Reference            |
| contactType      | Enum     | INDIVIDUAL / ORGANIZATION |
| firstName        | String   | First Name                |
| lastName         | String   | Last Name                 |
| organizationName | String   | Organization Name         |
| email            | String   | Primary Email             |
| phone            | String   | Primary Phone             |
| alternatePhone   | String   | Secondary Phone           |
| website          | String   | Website                   |
| addressLine1     | String   | Address                   |
| addressLine2     | String   | Address                   |
| city             | String   | City                      |
| state            | String   | State                     |
| postalCode       | String   | Postal Code               |
| country          | String   | Country                   |
| notes            | String   | Internal Notes            |
| isActive         | Boolean  | Active Status             |
| deleted          | Boolean  | Soft Delete Flag          |
| deletedAt        | Date     | Deleted Timestamp         |
| deletedBy        | ObjectId | Deleted By                |
| createdBy        | ObjectId | Creator                   |
| createdAt        | Date     | Created Timestamp         |
| updatedAt        | Date     | Updated Timestamp         |

---

### Contact Type Enum

```text
INDIVIDUAL

ORGANIZATION
```

---

### Relationships

One Firm

↓

Many Matter Contacts

---

One Matter Contact

↓

Many Matters

---

### Indexes

Create indexes on:

* firmId
* lastName
* organizationName
* email
* phone
* isActive

Composite indexes:

* firmId + lastName
* firmId + organizationName

---

## 8.2 matter_contact_links

### Purpose

Associates reusable contacts with Matters.

Supports many-to-many relationships.

---

### Fields

| Field     | Type     |
| --------- | -------- |
| _id       | ObjectId |
| matterId  | ObjectId |
| contactId | ObjectId |
| role      | Enum     |
| createdBy | ObjectId |
| createdAt | Date     |

---

### Contact Role Enum

```text
WITNESS

EXPERT_WITNESS

JUDGE

MEDIATOR

ARBITRATOR

COURT_CLERK

INSURANCE_ADJUSTER

GOVERNMENT_OFFICIAL

CONSULTANT

OTHER
```

---

### Relationships

One Matter

↓

Many Contacts

---

One Contact

↓

Many Matters

---

# 9. API Design

This module follows:

* 004 - API Conventions

## Endpoints

| Method | Endpoint                     | Description            | Auth Required |
| ------ | ---------------------------- | ---------------------- | ------------- |
| GET    | /matter-contacts             | List Contacts          | Yes           |
| GET    | /matter-contacts/:id         | Get Contact            | Yes           |
| POST   | /matter-contacts             | Create Contact         | Yes           |
| PATCH  | /matter-contacts/:id         | Update Contact         | Yes           |
| DELETE | /matter-contacts/:id         | Soft Delete Contact    | Yes           |
| PATCH  | /matter-contacts/:id/archive | Archive Contact        | Yes           |
| PATCH  | /matters/:id/contacts        | Update Matter Contacts | Yes           |

---

## Request Models

### Create Contact

```json
{
    "contactType": "INDIVIDUAL",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
}
```

---

### Link Contacts

```json
{
    "contacts": [
        {
            "contactId": "...",
            "role": "WITNESS"
        }
    ]
}
```

---

## Response Models

### Contact Response

```json
{
    "success": true,
    "data": {}
}
```

---

### Contact List Response

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
apps/api/src/modules/matter-contacts
```

The module must implement:

* Contact CRUD
* Search
* Duplicate Detection
* Matter Association
* Archive
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
apps/web/src/modules/matter-contacts
```

Required pages

* Matter Contact List
* Matter Contact Details
* Create Matter Contact
* Edit Matter Contact

Required components

* Contact Table
* Contact Form
* Matter Association Panel
* Archive Dialog

Required hooks

* useMatterContacts
* useMatterContact
* useCreateMatterContact
* useUpdateMatterContact
* useArchiveMatterContact
* useMatterContactLinks

Required API client

* listMatterContacts()
* getMatterContact()
* createMatterContact()
* updateMatterContact()
* archiveMatterContact()
* updateMatterContactLinks()

---

# 12. Security Considerations

This module follows:

* 005 - Security Standards

The following security requirements are specific to the Matter Contacts module.

---

## Firm Isolation

Every Matter Contact belongs to exactly one firm.

Users may only access Matter Contacts belonging to their own firm.

Cross-firm access is strictly prohibited.

---

## Matter Association

A Matter Contact may only be associated with Matters belonging to the same firm.

Cross-firm associations are prohibited.

Duplicate Matter associations are prohibited.

---

## Immutable Contact Type

Once created, the contact type cannot be changed.

Examples:

* Individual → Organization ❌
* Organization → Individual ❌

A new Matter Contact must be created instead.

---

## Soft Delete

Matter Contacts are never permanently deleted.

Deletion consists of:

* Setting `deleted = true`
* Recording `deletedAt`
* Recording `deletedBy`

Historical Matter associations must remain intact.

---

## Archive

Archived Matter Contacts:

* Cannot be linked to new Matters.
* Remain visible in historical Matters.
* Remain available for reporting.

---

## Duplicate Detection

The system should identify potential duplicates using:

* Name
* Organization Name
* Email
* Phone Number

Duplicate detection is advisory only.

The final decision belongs to the user.

---

## Auditability

Every significant Matter Contact action must generate an Audit Log entry.

Examples include:

* Contact Created
* Contact Updated
* Contact Archived
* Contact Restored
* Linked to Matter
* Removed from Matter

---

# 13. Acceptance Criteria

The module is complete only if all of the following are true.

---

## Creation

Users can create:

* Individual Contacts
* Organization Contacts

---

## Search

Users can:

* Search Contacts.
* Filter by Name.
* Filter by Organization.
* Filter by Active Status.

---

## Matter Association

Users can:

* Link Contacts to Matters.
* Remove links from Matters.
* View all linked Matters.

Duplicate associations are prevented.

---

## Archive

Users can archive Matter Contacts.

Archived contacts remain available for:

* Historical Matters
* Reporting

---

## Soft Delete

Unused Matter Contacts may be soft deleted.

Referenced contacts remain protected from deletion.

---

## Testing

* Unit tests pass.
* Integration tests pass.
* Duplicate Detection tests pass.
* Manual QA passes.

---

# 14. File Manifest

The implementation must create the following files.

---

## Backend

```text
apps/api/src/modules/matter-contacts/

index.ts

matter-contact.controller.ts

matter-contact.service.ts

matter-contact.repository.ts

matter-contact.routes.ts

matter-contact.validation.ts

matter-contact.constants.ts

matter-contact.types.ts

matter-contact-link.service.ts

duplicate-detection.service.ts

schemas/

tests/
```

---

## Frontend

```text
apps/web/src/modules/matter-contacts/

pages/

MatterContactListPage.tsx

MatterContactDetailsPage.tsx

CreateMatterContactPage.tsx

EditMatterContactPage.tsx

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

* Matter Contact CRUD
* Search
* Duplicate Detection
* Matter Association
* Archive
* Soft Delete

---

## Frontend

Implement:

* Matter Contact List
* Matter Contact Details
* Matter Contact Form
* Matter Association UI
* Archive UI
* Matter Contact API Client
* Matter Contact Hooks

---

## Database

Create:

* matter_contacts
* matter_contact_links

Implement indexes defined in this specification.

---

## Testing

Implement:

* Unit Tests
* Integration Tests
* Duplicate Detection Tests
* Matter Association Tests

The Matter Contacts module is considered incomplete if automated tests are absent.

---

## Documentation

Update:

* API Documentation
* Database Documentation
* Matter Contacts Workflow Diagram (if changed)

---

# 16. Future Enhancements

The following capabilities are intentionally excluded from this module and will be implemented in future specifications.

* Contact Groups
* Contact Organizations
* Contact Relationships
* Contact Communication History
* Contact Tags
* AI Duplicate Resolution
* External Contact Import
* Bulk Import / Export
* Contact Timeline
* Outlook / Google Contacts Synchronization

---

# 17. Definition of Done

This module is complete when:

* Product requirements are implemented.
* Business rules are implemented.
* Database collections are implemented.
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
docs/07-implementation/032-matter-contacts-progress.md
```

The progress document must be updated after each implementation phase and must include:

* Current Phase
* Overall Progress
* Completed Tasks
* Pending Tasks
* Known Issues
* Technical Decisions
* Deviations from this specification (if any)
