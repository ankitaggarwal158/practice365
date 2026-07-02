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

# 037 - Billing & Invoicing

**Module ID:** 037

**Module Name:** Billing & Invoicing

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

The Billing & Invoicing module converts billable work into invoices for clients.

The module manages:

- Billable Time Entries
- Billable Expenses
- Invoice Generation
- Invoice Lifecycle
- Invoice PDF
- Outstanding Balances
- Payment Status

Billing consumes data from the Time Tracking module but does not modify historical Time Entries.

---

# 2. Scope

This module includes:

- Invoice Generation
- Draft Invoices
- Invoice Editing
- Invoice Line Items
- Time Entry Billing
- Expense Billing
- Tax Calculation
- Invoice Number Generation
- Invoice PDF
- Outstanding Balance
- Soft Delete
- Audit Trail

---

# 3. Out of Scope

This module does not include:

- Online Payments
- Trust Accounting
- Refunds
- Accounting Software Integration

These capabilities are implemented by separate modules.

---

# 4. Dependencies

Business Module Dependencies

- 010 Authentication
- 011 User Management
- 013 Firm Management
- 023 Client Management
- 024 Matter Management
- 036 Time Tracking

Referenced By

- Dashboard
- Reports
- Client Portal

---

# 5. Business Requirements

## BILLING-001

Every Invoice belongs to exactly one Firm.

---

## BILLING-002

Every Invoice belongs to exactly one Client.

---

## BILLING-003

Invoices may contain:

- Billable Time Entries
- Billable Expenses
- Manual Line Items

---

## BILLING-004

Invoice numbers must be unique within a Firm.

---

## BILLING-005

Invoice status workflow:

- Draft
- Issued
- Partially Paid
- Paid
- Cancelled

Status transitions are system controlled.

---

## BILLING-006

Once issued:

- Line items cannot be edited.
- Time entries become locked.
- Billing amounts become immutable.

---

## BILLING-007

Invoices are never permanently deleted.

Soft deletion is mandatory.

---

## BILLING-008

Every significant invoice action generates an Audit Log entry.

Examples include:

- Invoice Created
- Invoice Issued
- Invoice Cancelled
- Payment Recorded
- Invoice Deleted

---

# 6. User Stories

### Generate Invoice

As a firm administrator,

I want to generate an invoice from billable work,

so clients can be billed accurately.

---

### Review Draft

As an attorney,

I want to review invoice drafts,

before issuing them to clients.

---

### Issue Invoice

As a billing administrator,

I want to issue finalized invoices,

so payment can be requested.

---

### Record Payment

As a billing administrator,

I want to record client payments,

so outstanding balances remain accurate.

---

# 7. User Workflows

Detailed workflows are documented in:

- `06-diagrams/billing-workflow.drawio`

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
| invoices | Invoice master records |
| invoice_items | Invoice line items |
| invoice_payments | Recorded payments |

---

## 8.1 invoices

### Purpose

Stores invoice headers and invoice-level financial information.

---

### Fields

| Field | Type | Description |
|------|------|-------------|
| _id | ObjectId | Primary Key |
| firmId | ObjectId | Firm Reference |
| clientId | ObjectId | Client Reference |
| matterId | ObjectId | Optional Matter Reference |
| invoiceNumber | String | Firm Unique Number |
| status | Enum | Invoice Status |
| issueDate | Date | Issue Date |
| dueDate | Date | Due Date |
| subtotal | Decimal | Before Tax |
| taxAmount | Decimal | Tax |
| totalAmount | Decimal | Invoice Total |
| amountPaid | Decimal | Payments Received |
| balanceDue | Decimal | Outstanding Balance |
| notes | String | Internal Notes |
| deleted | Boolean | Soft Delete |
| deletedAt | Date | Deleted Timestamp |
| deletedBy | ObjectId | Deleted By |
| createdBy | ObjectId | Created By |
| createdAt | Date | Created Timestamp |
| updatedAt | Date | Updated Timestamp |

---

### Invoice Status Enum

```text
DRAFT

ISSUED

PARTIALLY_PAID

PAID

CANCELLED
```

---

### Relationships

One Firm

↓

Many Invoices

---

One Client

↓

Many Invoices

---

One Invoice

↓

Many Invoice Items

---

One Invoice

↓

Many Payments

---

### Indexes

Create indexes on:

- firmId
- clientId
- invoiceNumber
- status
- issueDate
- dueDate

Composite indexes:

- firmId + invoiceNumber
- firmId + clientId
- firmId + status

---

## 8.2 invoice_items

### Purpose

Stores all billable items associated with an invoice.

Items may originate from:

- Time Entries
- Expenses
- Manual Charges

---

### Fields

| Field | Type |
|------|------|
| _id | ObjectId |
| invoiceId | ObjectId |
| sourceType | Enum |
| sourceId | ObjectId |
| description | String |
| quantity | Decimal |
| rate | Decimal |
| amount | Decimal |
| displayOrder | Number |

---

### Source Type Enum

```text
TIME_ENTRY

EXPENSE

MANUAL
```

---

## 8.3 invoice_payments

### Purpose

Stores payments received against invoices.

---

### Fields

| Field | Type |
|------|------|
| _id | ObjectId |
| invoiceId | ObjectId |
| paymentDate | Date |
| amount | Decimal |
| paymentMethod | Enum |
| referenceNumber | String |
| notes | String |
| receivedBy | ObjectId |
| createdAt | Date |

---

### Payment Method Enum

```text
CASH

BANK_TRANSFER

CHEQUE

CARD

OTHER
```

---

# 9. API Design

This module follows:

- 004 - API Conventions

## Endpoints

| Method | Endpoint | Description | Auth Required |
|---------|----------------------------------------|-----------------------|---------------|
| GET | /invoices | List Invoices | Yes |
| GET | /invoices/:id | Invoice Details | Yes |
| POST | /invoices | Create Draft Invoice | Yes |
| PATCH | /invoices/:id | Update Draft | Yes |
| POST | /invoices/:id/issue | Issue Invoice | Yes |
| POST | /invoices/:id/payment | Record Payment | Yes |
| GET | /invoices/:id/pdf | Generate PDF | Yes |
| DELETE | /invoices/:id | Soft Delete | Yes |

---

## Request Models

### Create Invoice

```json
{
    "clientId": "...",
    "matterId": "...",
    "timeEntryIds": [
        "...",
        "..."
    ],
    "expenseIds": [],
    "manualItems": []
}
```

---

### Record Payment

```json
{
    "paymentDate": "2026-07-01",
    "amount": 500.00,
    "paymentMethod": "BANK_TRANSFER",
    "referenceNumber": "TXN12345"
}
```

---

## Response Models

### Invoice

```json
{
    "success": true,
    "data": {}
}
```

---

### Invoice List

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
apps/api/src/modules/billing
```

The module must implement:

- Invoice CRUD
- Draft Management
- Invoice Generation
- Invoice Number Generation
- Payment Recording
- PDF Generation
- Billing Integration
- Soft Delete
- Search

Business logic belongs in the Service layer.

Repositories contain persistence logic only.

Controllers remain thin.

---

## Invoice Generation Rules

Invoice generation must:

- Validate Client.
- Validate Matter.
- Validate selected Time Entries.
- Validate selected Expenses.
- Prevent duplicate billing.
- Create Invoice.
- Create Invoice Items.
- Lock referenced Time Entries.
- Calculate totals.
- Generate audit log.

Invoice generation must be atomic.

---

## Invoice Number Rules

Invoice numbers must be unique per Firm.

Example:

```text
INV-2026-000001
```

Invoice numbers are assigned only when an invoice is created.

Invoice numbers are immutable.

---

## Billing Rules

Only Time Entries with:

- BILLABLE
- Not Deleted
- Not Already Invoiced

may be included.

Attempting to invoice an already invoiced Time Entry must return a validation error.

---

## Status Transition Rules

Invoices follow the following workflow.

```text
DRAFT

↓

ISSUED

↓

PARTIALLY_PAID

↓

PAID
```

Cancellation is allowed only from:

```text
DRAFT

ISSUED
```

Paid invoices cannot be cancelled.

---

## Payment Rules

Recording a payment:

- Creates a Payment record.
- Updates Amount Paid.
- Updates Balance Due.
- Updates Invoice Status.

Invoice status changes automatically.

Example:

```text
Balance Due > 0

↓

PARTIALLY_PAID
```

```text
Balance Due = 0

↓

PAID
```

---

## PDF Rules

Invoice PDFs must contain:

- Firm Information
- Client Information
- Invoice Number
- Matter Reference
- Line Items
- Taxes
- Total
- Payment History (optional)

Generated PDFs must be reproducible.

---

## Search Requirements

Support searching by:

- Invoice Number
- Client
- Matter
- Status
- Date Range
- Outstanding Balance

Search excludes deleted invoices.

---

# 11. Frontend Requirements

This module follows:

- 002 - Module Architecture

Frontend module location

```text
apps/web/src/modules/billing
```

Required pages

- Invoice List
- Invoice Details
- Create Invoice
- Draft Invoice
- Payment History

Required components

- Invoice Table
- Invoice Form
- Invoice Line Items
- Payment Form
- Invoice Summary
- Invoice Preview
- Delete Confirmation Dialog

Required hooks

- useInvoices
- useInvoice
- useCreateInvoice
- useIssueInvoice
- useRecordPayment
- useInvoicePDF

Required API client

- listInvoices()
- getInvoice()
- createInvoice()
- updateInvoice()
- issueInvoice()
- recordPayment()
- downloadInvoicePDF()
- deleteInvoice()

---

# 12. Security Considerations

This module follows:

- 005 - Security Standards

The following security requirements are specific to the Billing & Invoicing module.

---

## Firm Isolation

Every Invoice belongs to exactly one Firm.

Users may only access Invoices belonging to their Firm.

Cross-firm access is prohibited.

---

## Invoice Integrity

Once an Invoice has been issued:

- Line items cannot be edited.
- Rates cannot change.
- Quantities cannot change.
- Taxes cannot change.
- Totals cannot change.

If corrections are required, a credit note or replacement invoice should be created in a future module.

---

## Time Entry Protection

Once a Time Entry is invoiced:

- It cannot be modified.
- It cannot be deleted.
- It cannot appear on another Invoice.

---

## Payment Protection

Payments cannot be modified after creation.

If an error occurs, a reversal entry must be created.

Historical payment records remain immutable.

---

## Soft Delete

Invoices are never permanently deleted.

Deletion consists of:

- deleted = true
- deletedAt
- deletedBy

Issued invoices should generally not be deletable through normal application workflows.

---

## Auditability

Every significant Invoice action must generate an Audit Log entry.

Examples include:

- Invoice Created
- Invoice Updated
- Invoice Issued
- Invoice Cancelled
- Payment Recorded
- PDF Generated
- Invoice Deleted

---

# 13. Acceptance Criteria

The module is complete only if all of the following are true.

---

## Draft Invoices

Users can:

- Create Draft Invoices.
- Edit Draft Invoices.
- Delete Draft Invoices.

---

## Invoice Generation

Users can:

- Generate invoices from Time Entries.
- Add manual line items.
- Calculate taxes.
- Calculate totals.

---

## Invoice Lifecycle

Users can:

- Issue invoices.
- View invoice history.
- View invoice status.

Status transitions follow defined business rules.

---

## Payments

Users can:

- Record payments.
- View payment history.
- Track outstanding balances.

Invoice status updates automatically.

---

## PDF

Users can:

- Preview invoices.
- Download invoice PDF.

---

## Search

Users can:

- Search by Invoice Number.
- Search by Client.
- Search by Matter.
- Search by Status.
- Search by Date Range.

---

## Testing

- Unit tests pass.
- Integration tests pass.
- Invoice generation tests pass.
- Payment tests pass.
- Authorization tests pass.
- Manual QA passes.

---

# 14. File Manifest

The implementation must create the following files.

---

## Backend

```text
apps/api/src/modules/billing/

index.ts

invoice.controller.ts

invoice.service.ts

invoice.repository.ts

invoice.routes.ts

invoice.validation.ts

invoice.constants.ts

invoice.types.ts

invoice-number.service.ts

invoice-pdf.service.ts

payment.service.ts

billing-calculation.service.ts

schemas/

tests/
```

---

## Frontend

```text
apps/web/src/modules/billing/

pages/

InvoiceListPage.tsx

InvoiceDetailsPage.tsx

CreateInvoicePage.tsx

DraftInvoicePage.tsx

PaymentHistoryPage.tsx

components/

InvoiceTable.tsx

InvoiceForm.tsx

InvoiceItems.tsx

InvoiceSummary.tsx

PaymentForm.tsx

InvoicePreview.tsx

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

- Invoice CRUD
- Draft Management
- Invoice Generation
- Invoice Number Generation
- Payment Recording
- PDF Generation
- Billing Calculations
- Soft Delete

---

## Frontend

Implement:

- Invoice List
- Invoice Details
- Draft Invoice Editor
- Payment Entry UI
- Invoice Preview
- PDF Download
- API Client
- React Query Hooks

---

## Database

Create:

- invoices
- invoice_items
- invoice_payments

Implement all indexes defined in this specification.

---

## Testing

Implement:

- Unit Tests
- Integration Tests
- Invoice Generation Tests
- Payment Tests
- Authorization Tests

The Billing & Invoicing module is considered incomplete if automated tests are absent.

---

## Documentation

Update:

- API Documentation
- Database Documentation
- Billing Workflow Diagram
- Invoice Lifecycle Diagram (if changed)

---

# 16. Future Enhancements

The following capabilities are intentionally excluded from this module and will be implemented in future specifications.

- Online Payments
- Trust Accounting
- Credit Notes
- Recurring Invoices
- Payment Gateway Integration
- Accounting Software Integration
- Multi-Currency Billing
- Subscription Billing
- Automatic Payment Reminders
- Write-offs

---

# 17. Definition of Done

This module is complete when:

- Product requirements are implemented.
- Business rules are implemented.
- Database collections are implemented.
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
docs/07-implementation/037-billing-invoicing-progress.md
```

The progress document must be updated after each implementation phase and must include:

- Current Phase
- Overall Progress
- Completed Tasks
- Pending Tasks
- Known Issues
- Technical Decisions
- Deviations from this specification (if any)