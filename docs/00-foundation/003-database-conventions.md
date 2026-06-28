# 003 - Database Conventions

**Document ID:** 003

**Document Name:** Database Conventions

**Status:** Draft

---

# 1. Purpose

This document defines the database design standards for Practice365.

Every MongoDB collection, schema, relationship, index, and query must follow these conventions.

These conventions ensure consistency, scalability, maintainability, and predictable data access across the entire platform.

---

# 2. Database Philosophy

Practice365 uses MongoDB as its primary database.

The data model is designed around business domains rather than database normalization.

Schemas should prioritize:

- Data integrity
- Query performance
- Maintainability
- Clear ownership
- Explicit relationships

---

# 3. Collection Naming

Collection names must

- be plural
- be lowercase
- use snake_case only

Examples

```
users

firms

clients

matters

time_entries

invoice_items

calendar_events

audit_logs
```

Do not use camelCase.

Do not use PascalCase.

---

# 4. Primary Keys

Every collection uses

```
_id : ObjectId
```

MongoDB generated ObjectIds are the primary key.

Never replace ObjectIds with UUIDs unless there is a documented business requirement.

---

# 5. Relationships

Relationships are represented using ObjectId references.

Example

```
matterId

clientId

firmId

userId
```

Never embed large business objects.

Reference them.

---

# 6. Common Fields

Every collection must contain

```
createdAt

updatedAt
```

Managed automatically.

Do not update these manually.

---

# 7. Ownership

Every business record must have a clearly defined owner.

Example

Matter

↓

belongs to Client

Client

↓

belongs to Firm

User

↓

belongs to Firm

Time Entry

↓

belongs to Matter

Invoice

↓

belongs to Matter

Ownership must always be explicit.

---

# 8. Schema Design

Schemas should contain

- primitive values
- enums
- ObjectId references

Avoid deeply nested objects.

Avoid deeply nested arrays.

Large child entities should become their own collection.

---

# 9. Enumerations

States should always use enums.

Avoid arbitrary strings.

Example

```
LeadStatus

NEW

CONTACTED

ENGAGEMENT_SENT

CONVERTED

DECLINED

LOST
```

Business rules should enforce valid state transitions.

---

# 10. Immutable Data

Historical business records should never be overwritten if legal or financial history is important.

Examples

- Timeline Events
- Audit Logs
- Invoice History
- Payment History
- Document Versions

Changes should create new records where appropriate.

---

# 11. Auditability

Every important business action should be traceable.

The database should preserve sufficient information to reconstruct business history.

Avoid destructive updates whenever practical.

---

# 12. Indexing

Every collection should define indexes intentionally.

Indexes should be created for

- foreign keys
- frequently filtered fields
- frequently sorted fields
- unique constraints

Avoid unnecessary indexes.

Indexes should support expected query patterns.

---

# 13. Unique Constraints

Unique indexes should only be applied where required by business rules.

Examples

```
email

firm_slug

invitation_token
```

Do not create unnecessary unique constraints.

---

# 14. Soft Delete Policy

Business records should not be physically deleted unless legally or operationally required.

Preferred approach:

Business status changes.

Examples

```
Lead

↓

DECLINED

LOST
```

instead of deletion.

Historical records should remain available for reporting and audit purposes.

If a collection requires soft delete, use a consistent implementation across the project.

---

# 15. Date Storage

All dates must

- be stored in UTC
- use MongoDB Date type

Timezone conversion belongs in the frontend.

Never store localized timestamps.

---

# 16. Monetary Values

Money should never be stored as floating point values.

Store monetary amounts using the smallest currency unit.

Example

```
₹1000.50

↓

100050
```

(currency in paise)

The frontend is responsible for formatting currency.

---

# 17. File Storage

Files must never be stored inside MongoDB.

Only store metadata.

Example

```
fileId

storageProvider

path

mimeType

size

uploadedBy

uploadedAt
```

Actual file content belongs in object storage.

---

# 18. Search

Searchable fields should be explicitly identified.

Avoid full collection scans.

Use indexes where appropriate.

Full-text search requirements should be documented in the relevant module.

---

# 19. Schema Ownership

Each module owns its own schemas.

Example

Authentication

↓

auth_sessions

password_reset_tokens

Lead Management

↓

leads

Matter Management

↓

matters

Time Tracking

↓

time_entries

Modules must never modify another module's schema directly.

---

# 20. Migration Strategy

Schema changes must preserve existing data.

Backward compatibility should be maintained whenever practical.

Destructive schema changes require explicit migration planning.

---

# 21. Database Review Checklist

Before approving a schema verify

- Collection name follows convention.
- Relationships are explicit.
- ObjectIds are used correctly.
- Required indexes exist.
- Enums are defined.
- Ownership is clear.
- Historical data is preserved.
- Monetary values are stored correctly.
- Dates are stored in UTC.
- File metadata only is stored.
- No unnecessary duplication exists.