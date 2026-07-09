import { ReportType } from "./reports.types.js";

/**
 * Escapes a cell value for CSV formatting.
 */
function escapeCsvValue(val: any): string {
  if (val === null || val === undefined) return "";
  const str = String(val);
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

/**
 * Converts report documents to a CSV formatted string.
 */
export async function exportToCsv(type: ReportType, docs: any[]): Promise<string> {
  let headers: string[] = [];
  const rows: string[][] = [];

  switch (type) {
    case "matters":
      headers = [
        "Matter Number",
        "Title",
        "Status",
        "Practice Area",
        "Billing Method",
        "Estimated Value",
        "Responsible Attorney",
        "Client",
        "Opened Date",
      ];
      docs.forEach((doc) => {
        rows.push([
          doc.matterNumber || "",
          doc.title || "",
          doc.status || "",
          doc.practiceAreaName || "",
          doc.billingMethod || "",
          doc.estimatedValue ? String(doc.estimatedValue) : "0",
          doc.responsibleAttorneyName || "",
          doc.clientName || "",
          doc.openedDate ? new Date(doc.openedDate).toLocaleDateString() : "",
        ]);
      });
      break;

    case "clients":
      headers = [
        "Client Number",
        "Client Type",
        "Status",
        "First Name",
        "Last Name",
        "Company Name",
        "Email",
        "Phone",
        "Created Date",
      ];
      docs.forEach((doc) => {
        rows.push([
          doc.clientNumber || "",
          doc.clientType || "",
          doc.status || "",
          doc.firstName || "",
          doc.lastName || "",
          doc.companyName || "",
          doc.email || "",
          doc.phone || "",
          doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : "",
        ]);
      });
      break;

    case "time":
      headers = [
        "Date",
        "Duration (Mins)",
        "Rate",
        "Amount",
        "Billing Type",
        "Billed",
        "User",
        "Matter Number",
        "Matter Title",
        "Client",
        "Description",
      ];
      docs.forEach((doc) => {
        rows.push([
          doc.date ? new Date(doc.date).toLocaleDateString() : "",
          String(doc.durationMinutes || 0),
          `$${(doc.hourlyRate || 0).toFixed(2)}`,
          `$${(doc.billableAmount || 0).toFixed(2)}`,
          doc.billingType || "",
          doc.isBilled ? "Yes" : "No",
          doc.userName || "",
          doc.matterNumber || "",
          doc.matterTitle || "",
          doc.clientName || "",
          doc.description || "",
        ]);
      });
      break;

    case "invoices":
      headers = [
        "Invoice Number",
        "Status",
        "Issue Date",
        "Due Date",
        "Subtotal",
        "Tax",
        "Total",
        "Amount Paid",
        "Balance Due",
        "Client",
        "Matter",
      ];
      docs.forEach((doc) => {
        rows.push([
          doc.invoiceNumber || "",
          doc.status || "",
          doc.issueDate ? new Date(doc.issueDate).toLocaleDateString() : "",
          doc.dueDate ? new Date(doc.dueDate).toLocaleDateString() : "",
          `$${(doc.subtotal || 0).toFixed(2)}`,
          `$${(doc.taxAmount || 0).toFixed(2)}`,
          `$${(doc.totalAmount || 0).toFixed(2)}`,
          `$${(doc.amountPaid || 0).toFixed(2)}`,
          `$${(doc.balanceDue || 0).toFixed(2)}`,
          doc.clientName || "",
          doc.matterTitle || "",
        ]);
      });
      break;

    case "revenue":
      headers = [
        "Payment Date",
        "Amount",
        "Payment Method",
        "Reference Number",
        "Invoice Number",
        "Client",
        "Matter Title",
      ];
      docs.forEach((doc) => {
        rows.push([
          doc.paymentDate ? new Date(doc.paymentDate).toLocaleDateString() : "",
          `$${(doc.amount || 0).toFixed(2)}`,
          doc.paymentMethod || "",
          doc.referenceNumber || "",
          doc.invoiceNumber || "",
          doc.clientName || "",
          doc.matterTitle || "",
        ]);
      });
      break;

    case "user-activity":
      headers = [
        "Timestamp",
        "User",
        "Email",
        "Module",
        "Action",
        "Entity Type",
        "Entity ID",
        "IP Address",
        "User Agent",
      ];
      docs.forEach((doc) => {
        rows.push([
          doc.createdAt ? new Date(doc.createdAt).toISOString() : "",
          doc.userName || "",
          doc.userEmail || "",
          doc.module || "",
          doc.action || "",
          doc.entityType || "",
          doc.entityId || "",
          doc.ipAddress || "",
          doc.userAgent || "",
        ]);
      });
      break;
  }

  const csvRows = [headers.join(",")];
  rows.forEach((row) => {
    csvRows.push(row.map(escapeCsvValue).join(","));
  });

  return csvRows.join("\n");
}
