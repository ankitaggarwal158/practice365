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

# 035 - Document Management

**Module ID:** 035

**Module Name:** Document Management

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

The Document Management module provides centralized storage, organization, retrieval and lifecycle management of documents throughout Practice365.

Documents may belong to Matters, Clients, Leads, Intakes or other supported entities depending on business context.

This module serves as the primary repository for legal documents while maintaining complete auditability and version history.

---

# 2. Scope

This module includes:

- Document Upload
- Document Download
- Folder Management
- Document Versioning
- Document Metadata
- Matter Association
- Client Association
- Document Search
- Document Preview
- Soft Delete
- Audit Trail

---

# 3. Out of Scope

This module does not include:

- Electronic Signatures
- OCR
- AI Document Analysis
- External DMS Integration
- Email Attachments
- Client Portal Sharing Rules

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
- 033 Notes

Referenced By

- Client Portal
- Billing
- Calendar
- Tasks
- Dashboard

---

# 5. Business Requirements

## DOCUMENT-001

Every Document belongs to exactly one Firm.

---

## DOCUMENT-002

A Document may optionally belong to:

- Matter
- Client
- Lead
- Intake

Future entity associations may be added.

---

## DOCUMENT-003

Every uploaded file creates Version 1.

---

## DOCUMENT-004

Uploading a replacement creates a new immutable version.

Previous versions are never modified.

---

## DOCUMENT-005

Documents support metadata.

Examples include:

- Category
- Tags
- Description
- Document Date

---

## DOCUMENT-006

Documents may be organized into folders.

Folders are logical only.

Moving a document between folders does not affect storage.

---

## DOCUMENT-007

Documents may be previewed where supported by file type.

---

## DOCUMENT-008

Documents are never permanently deleted.

Soft deletion is mandatory.

---

## DOCUMENT-009

Every significant document action generates an Audit Log entry.

Examples include:

- Upload
- Download
- Update Metadata
- New Version
- Move Folder
- Delete
- Restore

---

# 6. User Stories

### Upload Document

As a staff member,

I want to upload a legal document,

so it becomes available within the Matter.

---

### Create New Version

As an attorney,

I want to upload a revised document,

while preserving previous versions.

---

### Search Documents

As a legal assistant,

I want to search documents,

so I can quickly locate files.

---

### Restore Document

As a Firm Administrator,

I want to restore deleted documents,

so accidental deletions can be recovered.

---

# 7. User Workflows

Detailed workflows are documented in:

- `06-diagrams/document-management.drawio`

Implementation must follow the approved workflow.

---

# PART B — Engineering Specification

---

# 8. Data Model

This module follows the standards defined in:

- 003 - Database Conventions

This module owns the following collections.

| Collection | Purpose |
|------------|----------|
| documents | Master document records |
| document_versions | Immutable version history |
| document_folders | Logical folder hierarchy |

---

## 8.1 documents

### Purpose

Stores the master record for every uploaded document.

The actual file is stored in object storage (Bunny, S3, GCS, etc.).

The database stores metadata and references only.

---

### Fields

| Field | Type | Description |
|---------|------|-------------|
| _id | ObjectId | Primary Key |
| firmId | ObjectId | Firm Reference |
| matterId | ObjectId | Matter Reference (nullable) |
| clientId | ObjectId | Client Reference (nullable) |
| leadId | ObjectId | Lead Reference (nullable) |
| intakeId | ObjectId | Intake Reference (nullable) |
| folderId | ObjectId | Folder Reference |
| currentVersionId | ObjectId | Latest Version |
| documentName | String | Display Name |
| originalFileName | String | Original Uploaded Name |
| description | String | Description |
| category | String | Category |
| tags | String[] | Search Tags |
| mimeType | String | MIME Type |
| fileExtension | String | Extension |
| fileSize | Number | Bytes |
| isLocked | Boolean | Lock Flag |
| deleted | Boolean | Soft Delete |
| deletedAt | Date | Deleted Timestamp |
| deletedBy | ObjectId | Deleted By |
| createdBy | ObjectId | Uploaded By |
| createdAt | Date | Created Timestamp |
| updatedAt | Date | Updated Timestamp |

---

### Relationships

One Firm

↓

Many Documents

---

One Matter

↓

Many Documents

---

One Client

↓

Many Documents

---

One Document

↓

Many Versions

---

### Indexes

Create indexes on:

- firmId
- matterId
- clientId
- folderId
- category
- createdAt

Composite indexes:

- firmId + matterId
- firmId + clientId
- firmId + folderId
- firmId + deleted

---

## 8.2 document_versions

### Purpose

Stores immutable historical versions of every document.

Versions are append-only.

---

### Fields

| Field | Type |
|---------|------|
| _id | ObjectId |
| documentId | ObjectId |
| versionNumber | Number |
| storageKey | String |
| fileHash | String |
| mimeType | String |
| fileSize | Number |
| uploadedBy | ObjectId |
| uploadedAt | Date |
| notes | String |

---

### Rules

Version numbers begin at:

```text
1
```

Each replacement upload increments:

```text
+1
```

Previous versions are immutable.

No version may be modified after creation.

---

### Indexes

- documentId
- versionNumber

Composite

- documentId + versionNumber

---

## 8.3 document_folders

### Purpose

Provides logical organization of documents.

Folders do not represent physical storage.

---

### Fields

| Field | Type |
|---------|------|
| _id | ObjectId |
| firmId | ObjectId |
| parentFolderId | ObjectId |
| folderName | String |
| displayOrder | Number |
| createdBy | ObjectId |
| createdAt | Date |
| updatedAt | Date |

---

### Rules

Folders support unlimited nesting.

Folder deletion is soft delete.

Documents remain intact when folders are deleted.

---

# 9. API Design

This module follows:

- 004 API Conventions

## Endpoints

| Method | Endpoint | Description | Auth |
|----------|--------------------------------------|----------------------|------|
| GET | /documents | List Documents | Yes |
| GET | /documents/:id | Get Document | Yes |
| POST | /documents | Upload Document | Yes |
| PATCH | /documents/:id | Update Metadata | Yes |
| POST | /documents/:id/version | Upload New Version | Yes |
| GET | /documents/:id/download | Download | Yes |
| GET | /documents/:id/versions | Version History | Yes |
| DELETE | /documents/:id | Soft Delete | Yes |
| POST | /document-folders | Create Folder | Yes |
| PATCH | /document-folders/:id | Rename Folder | Yes |
| DELETE | /document-folders/:id | Delete Folder | Yes |

---

## Request Models

### Upload Document

```json
{
    "matterId": "...",
    "folderId": "...",
    "category": "Evidence",
    "description": "Signed Agreement"
}
```

---

### Upload New Version

```json
{
    "notes": "Corrected signature page."
}
```

---

### Update Metadata

```json
{
    "documentName": "Updated Agreement",
    "category": "Contract",
    "tags": [
        "agreement",
        "signed"
    ]
}
```

---

## Response Models

### Document

```json
{
    "success": true,
    "data": {}
}
```

---

### Document List

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
apps/api/src/modules/documents
```

The module must implement:

- Document CRUD
- Upload
- Download
- Version Management
- Folder Management
- Metadata Management
- Search
- Soft Delete
- Audit Integration

Business logic belongs in the Service layer.

Repositories contain persistence logic only.

Controllers remain thin.

---

## Upload Rules

The upload service must:

- Validate authentication.
- Validate permissions.
- Validate parent entity.
- Validate firm ownership.
- Validate supported file types.
- Validate maximum file size.
- Generate storage path.
- Upload file to storage provider.
- Persist metadata.
- Create Version 1.
- Create audit log.

The upload operation must be atomic.

---

## Version Management

Uploading a replacement:

- Creates a new immutable version.
- Updates `currentVersionId`.
- Preserves previous versions.
- Updates document metadata only where applicable.
- Generates an audit entry.

Version history must never be rewritten.

---

## Folder Rules

Folders are logical only.

Moving a document:

- Does not copy files.
- Does not create versions.
- Does not change storage location.

Only metadata changes.

---

## Download Rules

Downloads must:

- Validate authorization.
- Validate firm ownership.
- Validate document exists.
- Validate document is not deleted.
- Generate secure download URL.
- Log download activity.

---

## Search Requirements

Support searching by:

- Document Name
- Original File Name
- Category
- Tags
- Matter
- Client
- Upload Date
- Uploaded By

Search must exclude soft deleted documents.

---

# 11. Frontend Requirements

This module follows:

- 002 - Module Architecture

Frontend module location

```text
apps/web/src/modules/documents
```

Required pages

- Document List
- Document Details
- Upload Document
- Edit Metadata
- Folder Management
- Version History

Required components

- Upload Component
- Folder Tree
- Document Table
- Document Card
- Metadata Form
- Version History Panel
- Search Bar
- Preview Panel
- Delete Confirmation Dialog

Required hooks

- useDocuments
- useDocument
- useUploadDocument
- useUpdateDocument
- useDeleteDocument
- useFolders
- useVersions

Required API client

- listDocuments()
- getDocument()
- uploadDocument()
- uploadVersion()
- updateDocument()
- deleteDocument()
- listFolders()
- createFolder()
- renameFolder()
- deleteFolder()

---

## UI Requirements

The Document List must support:

- List View
- Grid View
- Folder Navigation
- Search
- Filters
- Sorting
- Pagination

---

## Filters

Support filtering by:

- Matter
- Client
- Category
- Folder
- Uploaded By
- Upload Date
- File Type

---

## Sorting

Support sorting by:

- Name
- Upload Date
- File Size
- Category
- Last Modified

Ascending and descending sorting must be supported.

---

## Preview Support

Preview should be supported for:

- PDF
- Images
- Text Files

Unsupported file types should provide download only.

---

# 12. Security Considerations

This module follows:

- 005 - Security Standards

The following security requirements are specific to Document Management.

---

## Firm Isolation

Every document belongs to exactly one Firm.

Users may only access documents belonging to their Firm.

Cross-firm access is prohibited.

---

## Authorization

Users may only access documents attached to entities they are authorized to access.

Authorization must always be validated against the parent entity.

---

## Version Integrity

Document versions are immutable.

No version may be edited or overwritten.

Corrections require a new version.

---

## Storage Security

Files must never be publicly accessible.

Downloads must use signed or temporary URLs.

Storage keys must never expose predictable paths.

---

## Soft Delete

Documents are never permanently deleted.

Deletion consists of:

- deleted = true
- deletedAt
- deletedBy

Historical versions remain preserved.

---

## Auditability

Every significant document action must generate an Audit Log entry.

Examples include:

- Upload
- Download
- Metadata Update
- Version Upload
- Folder Move
- Delete
- Restore

---

# 13. Acceptance Criteria

The module is complete only if all of the following are true.

---

## Upload

Users can:

- Upload new documents.
- Upload multiple documents.
- Associate uploads with Matters.
- Associate uploads with Clients.
- Organize uploads into folders.

---

## Version Management

Users can:

- Upload new versions.
- View complete version history.
- Download any historical version.
- Identify the current version.

Previous versions remain immutable.

---

## Folder Management

Users can:

- Create folders.
- Rename folders.
- Move documents between folders.
- Browse folder hierarchy.

Deleting a folder does not delete documents.

---

## Metadata

Users can:

- Edit document metadata.
- Manage categories.
- Manage tags.
- Update descriptions.

Uploading a new version does not remove existing metadata unless explicitly changed.

---

## Search

Users can:

- Search documents by name.
- Search by tags.
- Search by category.
- Filter by Matter.
- Filter by Client.
- Filter by upload date.
- Filter by uploader.

---

## Preview

Supported file types render in-browser.

Unsupported file types provide download only.

---

## Soft Delete

Documents can be soft deleted.

Deleted documents:

- Are hidden from normal searches.
- Remain recoverable.
- Preserve all versions.

---

## Testing

- Unit tests pass.
- Integration tests pass.
- Upload tests pass.
- Download tests pass.
- Versioning tests pass.
- Authorization tests pass.
- Manual QA passes.

---

# 14. File Manifest

The implementation must create the following files.

---

## Backend

```text
apps/api/src/modules/documents/

index.ts

document.controller.ts

document.service.ts

document.repository.ts

document.routes.ts

document.validation.ts

document.constants.ts

document.types.ts

document-upload.service.ts

document-download.service.ts

document-version.service.ts

document-folder.service.ts

document-search.service.ts

schemas/

tests/
```

---

## Frontend

```text
apps/web/src/modules/documents/

pages/

DocumentListPage.tsx

DocumentDetailsPage.tsx

UploadDocumentPage.tsx

EditDocumentPage.tsx

FolderManagementPage.tsx

components/

DocumentTable.tsx

DocumentCard.tsx

DocumentUpload.tsx

DocumentPreview.tsx

FolderTree.tsx

VersionHistory.tsx

DocumentFilters.tsx

DocumentSearch.tsx

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

- Document CRUD
- Upload
- Download
- Metadata Management
- Folder Management
- Version Management
- Search
- Soft Delete
- Audit Integration

---

## Frontend

Implement:

- Document List
- Folder Browser
- Upload UI
- Document Preview
- Metadata Editor
- Version History
- Search & Filters
- API Client
- React Query Hooks

---

## Database

Create:

- documents
- document_versions
- document_folders

Implement all indexes defined in this specification.

---

## Storage

Implement storage abstraction.

Storage provider must support:

- Upload
- Download
- Delete
- Signed URLs

The storage implementation must be provider-agnostic so Bunny Storage, AWS S3, Google Cloud Storage or other providers can be substituted without changing business logic.

---

## Testing

Implement:

- Unit Tests
- Integration Tests
- Upload Tests
- Download Tests
- Versioning Tests
- Authorization Tests

The Document Management module is considered incomplete if automated tests are absent.

---

## Documentation

Update:

- API Documentation
- Database Documentation
- Upload Workflow Diagram
- Versioning Workflow Diagram (if changed)

---

# 16. Future Enhancements

The following capabilities are intentionally excluded from this module and will be implemented in future specifications.

- Electronic Signature Integration
- OCR
- AI Document Classification
- AI Metadata Extraction
- Document Approval Workflow
- Document Check-In / Check-Out
- External DMS Integration
- Document Expiration Rules
- Bulk Upload
- Bulk Download
- Watermarking
- PDF Annotation

---

# 17. Definition of Done

This module is complete when:

- Product requirements are implemented.
- Business rules are implemented.
- Database collections are implemented.
- Storage integration is implemented.
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
docs/07-implementation/035-document-management-progress.md
```

The progress document must be updated after each implementation phase and must include:

- Current Phase
- Overall Progress
- Completed Tasks
- Pending Tasks
- Known Issues
- Technical Decisions
- Deviations from this specification (if any)