# Billing & Invoicing (037) Implementation Progress

## Current Phase
- Completed & Verified

## Overall Progress
- Scaffolding & Setup: 100%
- Database & Backend Logic: 100%
- Frontend Pages & Hooks: 100%
- Verification & Testing: 100%

## Completed Tasks
- Installed dependencies (`pdfkit`, `@types/pdfkit`)
- Updated role permissions constants and seeded defaults
- Implemented Mongoose database collections (`invoices`, `invoice_items`, `invoice_payments`)
- Developed core services (invoice calculations, thread-safe sequence number generator, PDF generator, and automated status payment posting service)
- Coded and mounted API controllers, endpoints, and validation schemas
- Authored and verified backend unit tests matching model requirements (all passed)
- Built frontend API client, customized binary download wrappers, and React Query custom hooks
- Built frontend UI list, creation view, detailed summary log, payment recording modal, and draft adjustments editor
- Configured routes in React Router and added "Billing & Invoices" link in Dashboard Sidebar

## Pending Tasks
- *None*

## Known Issues
- *None*

## Technical Decisions
1. **Time Entries Release:** Time entries are marked as `isBilled: false` when a draft/issued invoice is cancelled or deleted.
2. **Expenses Module Stubbed:** Since the Expenses module is not yet present, the invoice schema accepts `expenseIds` as an empty list, and frontend features for expenses are stubbed/hidden.
3. **Robust PDF Download:** Built a custom fetch download script in frontend API wrappers to secure token transport and bypass `httpClient`'s JSON parsing limitation on binary files.

## Deviations from Specification
- *None*
