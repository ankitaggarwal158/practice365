**FEATURE & LOGIC SPECIFICATION**

**Practice Management & Client/Matter CRM for Solo and Small Law Firms**

# **1\. Leads, Clients & Matter Records**

## **1.1 Lead Record**

* A Lead is a distinct record type, separate from Client. Every accepted intake submission (Section 2\) creates a Lead, not a Client.

* Lead fields: contact info, matter description, opposing party name(s), referral source, lead status (New → Contacted → Engagement Sent → Converted / Declined / Lost).

* A Lead has no matter, no billing, and no portal access until conversion (Section 1.3).

* Leads marked Declined or Lost are retained, not deleted, to preserve pipeline reporting and conflict-check history.

## **1.2 Client Record**

* A Client record is created only at the point of conversion from a Lead (Section 1.3) — a person or entity is never a Client until that step occurs.

* Stores: contact info, communication history, linked matters (past and active), notes, billing/payment history.

* A client can have multiple matters linked to a single client record.

## **1.3 Lead-to-Client Conversion Logic**

* Conversion is triggered by one event: the engagement letter / retainer agreement is signed (via the e-signature module, Section 8, or marked as signed by attorney record if executed outside the system).

* On signature completion, the system automatically creates the Client record from the Lead's contact info, creates the linked Matter record, sets the Lead status to Converted, and grants client portal access.

* Until that signature event fires, no Matter, billing, time entry, or portal access can be created against that Lead — this is system-enforced, not just a UI convention, so billable work cannot begin against an unsigned engagement.

## **1.4 Matter Record**

* One record per matter, linked to exactly one client (or multiple clients for joint matters, e.g., divorce, co-defendants).

* Fields: matter name, practice area, responsible attorney, open date, status, close date.

* Status field is configurable per practice area (e.g., Intake → Active → Awaiting Client → Closed), with the ability to define custom statuses per firm.

* Every note, document, calendar event, time entry, and invoice in the system is attached to a matter (or to a client directly, for non-matter-specific items).

## **1.5 Retainer Tracking**

* Each matter has a Retainer field set: retainer amount agreed (from the engagement letter), retainer collected (yes/no), date collected, amount collected (supports partial collection).

* Retainer status displays on the matter summary view (Section 1.7) and on the firm-wide dashboard (Section 10\) as a flag for matters where work has begun but the retainer is marked not collected.

* Retainer collection can be marked manually by the attorney/staff, or automatically when a retainer payment is received through the client portal payment flow (Section 7.3).

## **1.6 Matter Timeline (Logic)**

* All activity tied to a matter (notes, document uploads, status changes, calendar events, communications) is logged chronologically and displayed as a single timeline.

* Timeline entries are immutable once created — edits create a new timestamped entry rather than overwriting history.

## **1.7 Matter Summary View (Differentiating Logic)**

* In addition to the raw chronological timeline, each matter generates a persistent summary block shown at the top of the matter view, containing: current status, retainer collection status, date of last activity, next upcoming deadline, date and method of last client contact.

* This summary updates automatically whenever a new timeline event is logged — it is not manually maintained.

* Logic: the summary block always reflects the most recent qualifying event per category (e.g., “last client contact” is the most recent timeline entry tagged as a client communication, regardless of entry type).

## **1.8 Custom Fields**

* Firms can define additional fields beyond the system defaults on Lead, Client, and Matter records (e.g., a custom “Referral campaign” field on Leads, or a “Case type sub-category” field on Matters).

* Custom fields can be defined per practice area, so a family law matter and an estate planning matter can each surface different custom fields without affecting one another.

* Custom field values are included in search and in dashboard/reporting views (Section 10\) alongside system-default fields — they are first-class data, not a separate notes blob.

# **2\. Client Intake**

## **2.1 Intake Form**

* Web-embeddable form, customizable per practice area (different field sets for, e.g., family law vs. estate planning vs. immigration).

* Captures: prospective client contact info, matter description, opposing party name(s) (for conflict checking), referral source.

## **2.2 Intake Logic**

* Submitted intake forms create a Lead record (Section 1.1) in a review queue — they do not create a Client or Matter.

* On review, the responsible attorney can: accept (Lead moves to Contacted, ready for engagement letter), decline (Lead status set to Declined), or flag for further information.

* Opposing party name(s) entered at intake are checked against the firm's existing client, lead, and opposing-party records; any name match across the firm's history is surfaced as a conflict flag before the Lead is accepted.

* Sending the engagement letter for signature (via Section 8\) moves the Lead to Engagement Sent; the Lead remains in this status until the signature event converts it per Section 1.3.

# **3\. Calendar & Deadlines**

## **3.1 Calendar**

* Firm-wide calendar view and per-attorney calendar view.

* Events can be linked to a specific matter or stand alone (e.g., internal firm meetings).

## **3.2 Deadline & Reminder Logic**

* Any calendar event can be flagged as a deadline (e.g., statute of limitations, filing date, response due date).

* Deadlines support configurable reminder intervals (e.g., 30/14/7/1 days before), each generating a separate notification.

* Reminder notifications are sent to the responsible attorney by default; additional staff can be added as recipients per deadline.

* Deadlines marked complete are retained on the matter timeline with a completion timestamp, not deleted.

* Overdue, incomplete deadlines are surfaced on a firm-wide dashboard view, sorted by how overdue they are.

# **4\. Notes**

* Free-text notes can be attached to a client record or a matter record.

* Each note is timestamped and attributed to the authoring user; notes are not editable after creation (edits create a new linked note, preserving the original).

* Notes can optionally be tagged by type (e.g., Client Call, Internal, Research, Court Appearance) to support filtering.

* Full-text search runs across all notes the searching user has permission to view, scoped by client name, matter name, or keyword.

# **5\. Document Management**

## **5.1 Storage & Organization**

* Documents are uploaded directly to a matter (or to a client record for non-matter documents).

* Each matter has a folder structure; firms can define default folder templates per practice area (e.g., Pleadings, Correspondence, Discovery, Signed Documents).

* Documents support tagging independent of folder placement, enabling cross-folder search.

## **5.2 Versioning Logic**

* Uploading a new file with the same name to the same location creates a new version rather than overwriting; all prior versions remain accessible.

* Version history displays uploader and timestamp for each version.

## **5.3 Preview**

* Common document types (PDF, DOCX, image formats) render in an in-browser preview without requiring download.

# **6\. Time Tracking & Billing**

## **6.1 Rate Setting & Assignment**

* Firms define one or more billing rates at three possible levels: a firm-wide default rate per attorney, an override rate per practice area, and an override rate on an individual matter (e.g., a discounted or flat-structure rate negotiated for that specific client).

* Resolution logic: when a time entry is created, the system applies the most specific rate available — matter-level override, if set, takes precedence over practice-area rate, which takes precedence over the attorney's firm-wide default.

* A matter can also be flagged as flat-fee or contingency rather than hourly; on flat-fee/contingency matters, time entries are still logged for internal tracking but do not generate a per-hour charge on the invoice.

* Rate changes apply only to time entries created after the change — previously logged entries retain the rate that was in effect at the time, so historical invoices and reports never recalculate retroactively.

## **6.2 Time Entry**

* Time can be entered manually (date, duration, matter, description) or via a running timer.

* Multiple timers can run concurrently across different matters for the same user, supporting attorneys who switch between matters throughout the day.

* Each time entry has two distinct text fields: a Client-Facing Description (plain-language summary of the work performed, shown to the client on the invoice and in the portal) and an Internal Note (optional, firm-only detail not shown to the client).

* Each time entry is linked to a matter and resolves to a billing rate automatically per Section 6.1; the calculated line amount (duration × rate) is computed at entry time, not deferred to invoicing.

## **6.3 Fixed Charges**

* Independent of time entries, a firm can add a Fixed Charge directly to a matter — a flat dollar amount tied to a description, not generated by a timer or hourly rate (e.g., a filing fee, a flat charge for drafting a specific document, a flat fee for an entire flat-fee matter).

* Fixed Charges have the same two-field structure as time entries: a Client-Facing Description shown on the invoice, and an optional Internal Note that is not.

* Fixed Charges can be marked as Billable (flows into the next invoice for that matter, same as a time entry) or Non-Billable (logged on the matter for record-keeping, e.g., a cost the firm absorbed, but excluded from invoice totals).

* A flat-fee matter (Section 6.1) is typically billed entirely through one or more Fixed Charges rather than time entries, though both can coexist on the same matter if a firm bills a flat fee for one phase of a matter and hourly for another.

## **6.4 Invoicing Logic**

* Invoices are generated by selecting a date range and a matter (or client); the system pulls all unbilled time entries and billable Fixed Charges in that range into a draft invoice.

* Each line item on the generated invoice displays the Client-Facing Description, date, and line total — time-entry lines additionally show duration and rate; Fixed Charge lines show the flat amount. Internal Notes never appear on an invoice or in the client portal under any circumstance.

* The invoice total is the sum of all included time-entry line amounts plus all included billable Fixed Charges plus any expenses added; this total is recalculated live while the invoice is in Draft status and locked once finalized.

* Draft invoices can be edited (entries removed, fees added) before finalizing; once finalized, an invoice is locked and any further changes require a credit/adjustment entry rather than editing the original.

* Invoice statuses: Draft → Sent → Paid / Partially Paid / Overdue.

* Overdue invoices (past their due date with an outstanding balance) are surfaced on a firm-wide dashboard.

# **7\. Client Portal**

## **7.1 Access Logic**

* Each client is issued portal credentials scoped to their own client record and linked matters only — a client cannot see any other client's data under any condition.

* Portal access is granted automatically at Lead-to-Client conversion (Section 1.3); it does not exist before that point.

* Within the portal, a client can view: matter status, documents the firm has explicitly shared (sharing is an explicit per-document action, not a default), invoices, and message history.

## **7.2 Messaging — Mechanics**

* Messaging is a two-way thread per matter, not per client — a client with multiple matters has a separate message thread for each.

* Attorney/staff side: messages are composed and read from within the matter view, in a panel alongside the timeline and documents.

* Client side: messages are composed and read from within the portal's view of that specific matter; the client cannot message the firm outside the context of a matter.

* Delivery logic: a message sent from either side is (a) stored in the system as the source of truth, and (b) triggers an email notification to the other party containing a short preview and a link back into the portal/matter view to read and reply — the full message body is not sent by email, only a notification that a message is waiting.

* This means email is a notification channel only; the actual conversation and its permanent record live in the portal/matter thread, not in anyone's email inbox.

* Every message (both directions) is automatically appended to the matter timeline (Section 1.6) as a timestamped, attributed entry, identical in structure to other timeline events.

* Read-receipt logic: a message is marked Delivered when stored, and Read when the recipient opens the matter/portal view containing it — visible to the sender as a status indicator on the message.

* Attachments can be included on a portal message; an attachment sent this way is also filed into the matter's document store (Section 5), tagged by the message thread it came from.

## **7.3 Billing & Payment**

* Clients can view all invoices (Draft-stage invoices excluded; only Sent or later statuses are visible) and outstanding balances for their matters.

* Payment is processed via Stripe, embedded in the portal — the client pays directly from the invoice view without leaving the portal.

* On successful Stripe payment, the system automatically: marks the invoice Paid or Partially Paid depending on amount received, logs a payment entry on the matter timeline, and — if the payment is tagged as a retainer payment rather than an invoice payment — updates the Retainer Tracking fields (Section 1.5) to collected.

* Failed or disputed Stripe payments revert the invoice to its prior status and generate a notification to the attorney/staff, not a silent failure.

# **8\. E-Signature**

## **8.1 Sending for Signature**

* Any document attached to a matter can be sent for signature directly from the matter view.

* Sending generates a unique, single-use signing link emailed to the signer; the link is not valid for any other document or signer.

## **8.2 Verification & Audit Trail Logic**

* Signer identity is verified via the emailed link tied to the signer's email address on file for that matter.

* Every step is timestamped and logged: link sent, link opened, each page viewed, each required field completed, signature applied, document completed.

* Signer IP address is captured at the time of signing.

* On completion, the system generates a certificate of completion (timestamps, IP address, signer email, document hash) and permanently attaches it to the signed document; the signed document and certificate cannot be altered after generation.

## **8.3 Filing Logic**

* Completed, signed documents file back into the originating matter's document store automatically, versioned against the unsigned original.

# **9\. User & Firm Settings**

## **9.1 Roles & Permissions**

* Two base role types: Attorney (full access to matters they are responsible for or have been granted access to) and Staff/Paralegal (configurable access, typically excluding billing rate visibility and trust-level financial detail).

* Matter-level access can be restricted to specific users beyond the base role (e.g., a sensitive matter visible only to the responsible attorney).

## **9.2 Firm Branding**

* Firm name, logo, and contact details are applied automatically to: client portal interface, generated invoices, and signing-link emails.

# **10\. Activity & Audit Log**

## **10.1 What Is Logged**

* Every create, edit, status change, document upload/version, time entry, invoice action, message, and login event is recorded with: acting user, timestamp, record affected, and a description of the action.

* This is a firm-wide log, distinct from any single matter's timeline (Section 1.6) — the matter timeline is a filtered, client-relevant view; the audit log is the complete, unfiltered record across the entire firm.

## **10.2 Logic**

* Audit log entries are append-only — no entry can be edited or deleted by any user, including firm administrators, preserving the log's evidentiary value if a firm's process is ever questioned.

* Entries are queryable by user, by record/matter, by action type, and by date range.

* Permission changes (e.g., a staff member's access being granted or revoked on a matter) are themselves logged as audit events.

# **11\. Firm Dashboard (Cross-Cutting Logic)**

* Aggregates, firm-wide and per-attorney: overdue deadlines, overdue invoices, matters with retainer not yet collected despite logged time entries, matters with no activity in a configurable trailing period (e.g., 14 days), and pending leads awaiting review.

* Each dashboard item links directly to the underlying matter or record — the dashboard itself stores no separate data, it is a live query view.