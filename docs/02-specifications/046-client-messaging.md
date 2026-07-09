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

# 046 - Client Messaging

**Module ID:** 046

**Module Name:** Client Messaging

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

The Client Messaging module provides secure, matter-based communication between firm users and clients through the Client Portal.

Messaging is permanently stored within Practice365. Email acts only as a notification mechanism and is never the source of truth for conversations.

Every message automatically becomes part of the Matter Timeline.

---

# 2. Scope

This module includes:

- Matter-based Message Threads
- Attorney ↔ Client Messaging
- Attachments
- Read Receipts
- Delivery Status
- Email Notifications
- Matter Timeline Integration

---

# 3. Out of Scope

This module does not include:

- Internal Staff Chat
- Group Messaging
- SMS
- WhatsApp
- Voice Calls
- Video Calls

---

# 4. Dependencies

Business Module Dependencies

- 010 Authentication
- 023 Client Management
- 024 Matter Management
- 035 Document Management
- 038 Client Portal
- 041 Notifications
- 042 Activity Log

Referenced By

- Matter Details
- Client Portal
- Dashboard

---

# 5. Business Requirements

## MESSAGE-001

Every message belongs to exactly one Matter.

---

## MESSAGE-002

Every Matter contains exactly one conversation thread shared between:

- Client
- Firm Users

---

## MESSAGE-003

Clients may only send messages within Matters they have access to.

---

## MESSAGE-004

Firm users may only send messages within Matters they have permission to access.

---

## MESSAGE-005

Every message supports:

- Text
- Attachments (optional)

---

## MESSAGE-006

Attachments automatically become Documents within the originating Matter.

---

## MESSAGE-007

Email is used only to notify recipients that a new message exists.

The full message body must never be sent by email.

---

## MESSAGE-008

Messages support delivery status:

- Delivered
- Read

---

## MESSAGE-009

Every message automatically creates a Matter Timeline entry.

---

## MESSAGE-010

Messages are immutable.

Editing is not permitted.

Deletion is not permitted.

---

# 6. User Stories

### Attorney Sends Message

As an attorney,

I want to message my client directly from the Matter,

so communication remains attached to the legal file.

---

### Client Replies

As a client,

I want to reply from the Client Portal,

so all communication remains centralized.

---

### Receive Notification

As a recipient,

I want an email notification,

so I know a new portal message is waiting.

---

### View Read Status

As a sender,

I want to know whether my message has been read.

---

# 7. User Workflows

Detailed workflows are documented in:

- `06-diagrams/client-messaging.drawio`

Implementation must follow the approved workflow.

---

# PART B — Engineering Specification

---

# 8. Data Model

This module follows:

- 003 - Database Conventions

This module owns the following collections.

| Collection | Purpose |
|------------|----------|
| matter_message_threads | One conversation thread per Matter |
| matter_messages | Individual messages |
| message_attachments | Attachment metadata |

---

## 8.1 matter_message_threads

### Purpose

Represents the conversation thread for a Matter.

Each Matter owns exactly one thread.

---

### Fields

| Field | Type | Description |
|------|------|-------------|
| _id | ObjectId | Primary Key |
| firmId | ObjectId | Firm Reference |
| matterId | ObjectId | Matter Reference |
| clientId | ObjectId | Client Reference |
| lastMessageId | ObjectId | Latest Message |
| lastMessageAt | Date | Latest Activity |
| lastMessageBy | ObjectId | Sender |
| unreadClientCount | Number | Unread for Client |
| unreadFirmCount | Number | Unread for Firm Users |
| createdAt | Date | Created Timestamp |
| updatedAt | Date | Updated Timestamp |

---

### Relationships

One Matter

↓

One Message Thread

↓

Many Messages

---

### Indexes

Create indexes on:

- firmId
- matterId
- clientId
- lastMessageAt

Composite indexes:

- firmId + matterId (Unique)
- firmId + clientId

---

## 8.2 matter_messages

### Purpose

Stores every message exchanged between the Firm and Client.

Messages are immutable.

---

### Fields

| Field | Type |
|------|------|
| _id | ObjectId |
| threadId | ObjectId |
| firmId | ObjectId |
| matterId | ObjectId |
| senderType | Enum |
| senderId | ObjectId |
| message | String |
| deliveryStatus | Enum |
| deliveredAt | Date |
| readAt | Date |
| hasAttachments | Boolean |
| createdAt | Date |

---

### Sender Type

```text
FIRM_USER

CLIENT
```

---

### Delivery Status

```text
DELIVERED

READ
```

---

### Relationships

One Thread

↓

Many Messages

---

### Indexes

Create indexes on:

- threadId
- matterId
- senderId
- createdAt

Composite indexes:

- threadId + createdAt

---

## 8.3 message_attachments

### Purpose

Stores attachment references for messages.

Actual files are managed by the Document Management module.

---

### Fields

| Field | Type |
|------|------|
| _id | ObjectId |
| messageId | ObjectId |
| documentId | ObjectId |
| fileName | String |
| uploadedBy | ObjectId |
| createdAt | Date |

---

### Relationships

One Message

↓

Many Attachments

---

# 9. API Design

This module follows:

- 004 - API Conventions

## Endpoints

| Method | Endpoint | Description |
|---------|------------------------------------------|----------------------------|
| GET | /message-threads | List Threads |
| GET | /message-threads/:matterId | Thread Details |
| GET | /message-threads/:matterId/messages | List Messages |
| POST | /message-threads/:matterId/messages | Send Message |
| POST | /message-threads/:matterId/attachments | Upload Attachment |
| PATCH | /messages/:id/read | Mark Message Read |

---

## Request Models

### Send Message

```json
{
    "message": "Please review the attached agreement."
}
```

---

### Upload Attachment

Multipart Form Data

```text
file
```

---

## Response Models

### Thread

```json
{
    "success": true,
    "data": {}
}
```

---

### Message List

```json
{
    "success": true,
    "data": [],
    "pagination": {}
}
```

---

# 10. Backend Requirements

Backend module location

```text
apps/api/src/modules/client-messaging
```

Implement:

- Thread Management
- Message Delivery
- Read Receipts
- Attachment Handling
- Email Notifications
- Timeline Integration
- Audit Integration

Business logic belongs in the Service layer.

Repositories contain persistence logic only.

Controllers remain thin.

---

## Messaging Rules

Each Matter has exactly one thread.

Messages are ordered chronologically.

Messages cannot be edited.

Messages cannot be deleted.

---

## Attachment Rules

Attachments uploaded through messaging must:

- Create a Document in Document Management.
- Automatically associate with the originating Matter.
- Maintain a reference back to the originating Message.

---

## Email Notification Rules

When a new message is sent:

- Store the message.
- Mark it as Delivered.
- Generate an email notification.
- Email contains:
  - Sender name
  - Short preview
  - Link back to Practice365

The complete message body must never be included in the email.

---

## Timeline Rules

Every new message automatically creates a Matter Timeline entry.

The timeline entry references the Message ID.

---

## Read Receipt Rules

A message becomes **Read** when:

- The recipient opens the Matter Messaging view (staff), or
- The recipient opens the Matter inside the Client Portal (client).

Read status updates automatically.

---

# 12. Security Considerations

This module follows:

- 005 - Security Standards

The following security requirements are specific to the Client Messaging module.

---

## Firm Isolation

Every message belongs to exactly one Firm.

Users and Clients may only access message threads belonging to their Firm.

Cross-firm access is prohibited.

---

## Matter Authorization

Messages are always scoped to a Matter.

Firm users may only access message threads for Matters they have permission to view.

Clients may only access message threads for their own Matters.

Backend authorization is mandatory.

---

## Thread Isolation

Each Matter owns exactly one conversation thread.

A client with multiple Matters has separate message threads for each Matter.

Messages must never be shared across Matters.

---

## Message Immutability

Messages are immutable.

After creation:

- No edits.
- No deletion.
- No message replacement.

If clarification is required, a new message must be sent.

---

## Attachment Security

Attachments uploaded through messaging must:

- Pass document upload validation.
- Be stored through the Document Management module.
- Inherit Matter permissions.
- Maintain references to both the Message and Matter.

Attachment downloads must validate authorization before generating download URLs.

---

## Email Notifications

Email serves only as a notification channel.

Email notifications may contain:

- Sender Name
- Message Preview (truncated)
- Matter Name
- Link back to Practice365

Email notifications must never include:

- Full message body
- Confidential attachments
- Secure portal data

---

## Read Receipts

Read receipts are automatically generated when the recipient opens the conversation.

Users cannot manually modify read status.

---

## Auditability

Every messaging action generates an Audit Log entry.

Examples include:

- Message Sent
- Message Read
- Attachment Uploaded
- Email Notification Sent

---

# 13. Acceptance Criteria

The module is complete only if all of the following are true.

---

## Messaging

Firm users can:

- View Matter conversations.
- Send messages.
- Attach files.
- View read status.

---

## Client Portal

Clients can:

- View Matter conversations.
- Reply to messages.
- Upload attachments.

Clients cannot message outside the context of a Matter.

---

## Attachments

Attachments:

- Are stored in Document Management.
- Appear in the Matter Document List.
- Remain linked to the originating Message.

---

## Notifications

Sending a message:

- Stores the message.
- Sends an email notification.
- Updates unread counts.

---

## Timeline

Every message appears automatically in the Matter Timeline.

---

## Security

Cross-client messaging is impossible.

Cross-firm messaging is impossible.

---

## Testing

- Unit tests pass.
- Integration tests pass.
- Messaging workflow tests pass.
- Authorization tests pass.
- Manual QA passes.

---

# 14. File Manifest

The implementation must create the following files.

---

## Backend

```text
apps/api/src/modules/client-messaging/

index.ts

message-thread.controller.ts

message-thread.service.ts

message-thread.repository.ts

message-thread.routes.ts

message-thread.validation.ts

message-thread.types.ts

message-notification.service.ts

message-attachment.service.ts

schemas/

tests/
```

---

## Frontend

```text
apps/web/src/modules/client-messaging/

pages/

MatterMessagesPage.tsx

PortalMessagesPage.tsx

components/

MessageThread.tsx

MessageBubble.tsx

MessageComposer.tsx

AttachmentUploader.tsx

AttachmentList.tsx

ReadReceipt.tsx

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

- Matter Thread Management
- Message Delivery
- Read Receipts
- Attachment Handling
- Email Notification Integration
- Timeline Integration
- Audit Integration

---

## Frontend

Implement:

- Matter Messaging Panel
- Client Portal Messaging
- Attachment Upload
- Read Receipts
- API Client
- React Query Hooks

---

## Database

Create:

- matter_message_threads
- matter_messages
- message_attachments

Implement all indexes defined in this specification.

---

## Testing

Implement:

- Unit Tests
- Integration Tests
- Messaging Workflow Tests
- Authorization Tests

The Client Messaging module is considered incomplete if automated tests are absent.

---

## Documentation

Update:

- API Documentation
- Messaging Workflow Documentation

---

# 16. Future Enhancements

The following capabilities are intentionally excluded from this module and will be implemented in future specifications.

- Internal Staff Chat
- Group Conversations
- Message Reactions
- Rich Text Messages
- Voice Messages
- Video Calls
- SMS Integration
- WhatsApp Integration
- Push Notifications
- AI-generated Message Summaries

---

# 17. Definition of Done

This module is complete when:

- Product requirements are implemented.
- Business rules are implemented.
- API endpoints are implemented.
- Backend implementation is complete.
- Frontend implementation is complete.
- Timeline integration works.
- Email notifications work.
- Automated tests pass.
- Manual QA passes.
- Documentation is updated.
- Code review is complete.

---

# AI Implementation Strategy

Refer to the standard AI Implementation Strategy defined for all modules.

The AI agent must create and maintain:

```text
docs/07-implementation/046-client-messaging-progress.md
```

The progress document must be updated after each implementation phase and must include:

- Current Phase
- Overall Progress
- Completed Tasks
- Pending Tasks
- Known Issues
- Technical Decisions
- Deviations from this specification (if any)