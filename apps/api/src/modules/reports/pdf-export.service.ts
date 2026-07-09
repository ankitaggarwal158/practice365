import PDFDocument from "pdfkit";
import { ReportType } from "./reports.types.js";

interface PDFTableColumn {
  header: string;
  key: string;
  width: number;
  align?: "left" | "center" | "right";
}

export async function exportToPdf(
  type: ReportType,
  docs: any[],
  summary: any,
  filters: any
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: "A4" });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      // ─── Header ───────────────────────────────────────────
      doc.fontSize(20).fillColor("#ffffff").text("Practice365 Reports", { align: "left" });
      doc.fontSize(10).fillColor("#888888").text(`Generated: ${new Date().toLocaleString()}`, { align: "left" });
      doc.moveDown(0.5);

      let reportTitle = "";
      switch (type) {
        case "matters":
          reportTitle = "Matter Workload Report";
          break;
        case "clients":
          reportTitle = "Client Directory Report";
          break;
        case "time":
          reportTitle = "Recorded Time & Productivity Report";
          break;
        case "invoices":
          reportTitle = "Invoice Billing Report";
          break;
        case "revenue":
          reportTitle = "Collected Revenue Report";
          break;
        case "user-activity":
          reportTitle = "User Activity & Audit Trail Report";
          break;
      }

      doc.fontSize(14).fillColor("#ffffff").text(reportTitle, { underline: true });
      doc.moveDown(1);

      // ─── Summary Cards / Boxes ────────────────────────────
      doc.fontSize(11).fillColor("#ffffff");
      const summaryY = doc.y;
      
      // Draw a subtle box for summary statistics
      doc.rect(40, summaryY, 515, 60).fillAndStroke("#1f1f1f", "#333333");
      doc.fillColor("#ffffff");

      let summaryText = "";
      if (type === "matters") {
        summaryText = `Total Matters: ${summary.totalCount || 0}   |   Total Est. Value: $${(summary.totalEstimatedValue || 0).toLocaleString()} \nOpen: ${summary.statusBreakdown?.OPEN || 0}   |   On Hold: ${summary.statusBreakdown?.ON_HOLD || 0}   |   Closed: ${summary.statusBreakdown?.CLOSED || 0}`;
      } else if (type === "clients") {
        summaryText = `Total Clients: ${summary.totalCount || 0} \nActive: ${summary.statusBreakdown?.ACTIVE || 0}   |   Inactive: ${summary.statusBreakdown?.INACTIVE || 0}   |   Archived: ${summary.statusBreakdown?.ARCHIVED || 0}`;
      } else if (type === "time") {
        const totalHrs = ((summary.totalRecordedMinutes || 0) / 60).toFixed(1);
        const billableHrs = ((summary.totalBillableMinutes || 0) / 60).toFixed(1);
        summaryText = `Total Recorded: ${totalHrs} hrs   |   Billable: ${billableHrs} hrs   |   Non-Billable: ${((summary.totalNonBillableMinutes || 0) / 60).toFixed(1)} hrs \nTotal Billable Amount: $${(summary.totalBillableAmount || 0).toLocaleString()}   |   Avg Hourly Rate: $${(summary.averageHourlyRate || 0).toFixed(2)}/hr`;
      } else if (type === "invoices") {
        summaryText = `Total Invoiced: $${(summary.totalInvoiced || 0).toLocaleString()}   |   Total Paid: $${(summary.totalPaid || 0).toLocaleString()}   |   Total Outstanding: $${(summary.totalBalanceDue || 0).toLocaleString()} \nPaid Invoices: ${summary.statusBreakdown?.PAID || 0}   |   Drafts: ${summary.statusBreakdown?.DRAFT || 0}   |   Overdue: ${summary.statusBreakdown?.OVERDUE || 0}`;
      } else if (type === "revenue") {
        summaryText = `Total Collected Revenue: $${(summary.totalRevenue || 0).toLocaleString()} \nStripe: $${(summary.paymentMethodBreakdown?.STRIPE || 0).toLocaleString()}   |   Bank Transfer: $${(summary.paymentMethodBreakdown?.BANK_TRANSFER || 0).toLocaleString()}   |   Cash: $${(summary.paymentMethodBreakdown?.CASH || 0).toLocaleString()}`;
      } else if (type === "user-activity") {
        summaryText = `Total Audit Logs: ${summary.totalCount || 0} \nActive Modules tracked: ${Object.keys(summary.moduleBreakdown || {}).length}`;
      }

      doc.text(summaryText, 55, summaryY + 15, { lineGap: 4 });
      doc.moveDown(4);

      // ─── Table Structure ──────────────────────────────────
      let columns: PDFTableColumn[] = [];

      switch (type) {
        case "matters":
          columns = [
            { header: "Matter #", key: "matterNumber", width: 70 },
            { header: "Title", key: "title", width: 130 },
            { header: "Status", key: "status", width: 65 },
            { header: "Billing Method", key: "billingMethod", width: 90 },
            { header: "Est. Value", key: "estimatedValue", width: 80, align: "right" },
            { header: "Opened Date", key: "openedDate", width: 80 },
          ];
          break;
        case "clients":
          columns = [
            { header: "Client #", key: "clientNumber", width: 70 },
            { header: "Name", key: "clientName", width: 140 },
            { header: "Type", key: "clientType", width: 85 },
            { header: "Status", key: "status", width: 65 },
            { header: "Email", key: "email", width: 155 },
          ];
          break;
        case "time":
          columns = [
            { header: "Date", key: "date", width: 65 },
            { header: "User", key: "userName", width: 110 },
            { header: "Duration", key: "duration", width: 65 },
            { header: "Rate", key: "hourlyRate", width: 65, align: "right" },
            { header: "Amount", key: "billableAmount", width: 70, align: "right" },
            { header: "Billing Type", key: "billingType", width: 70 },
            { header: "Billed", key: "isBilled", width: 70 },
          ];
          break;
        case "invoices":
          columns = [
            { header: "Invoice #", key: "invoiceNumber", width: 70 },
            { header: "Client", key: "clientName", width: 115 },
            { header: "Status", key: "status", width: 65 },
            { header: "Issue Date", key: "issueDate", width: 65 },
            { header: "Total", key: "totalAmount", width: 65, align: "right" },
            { header: "Paid", key: "amountPaid", width: 65, align: "right" },
            { header: "Due", key: "balanceDue", width: 65, align: "right" },
          ];
          break;
        case "revenue":
          columns = [
            { header: "Pay Date", key: "paymentDate", width: 65 },
            { header: "Amount", key: "amount", width: 75, align: "right" },
            { header: "Method", key: "paymentMethod", width: 80 },
            { header: "Ref #", key: "referenceNumber", width: 75 },
            { header: "Invoice #", key: "invoiceNumber", width: 75 },
            { header: "Client", key: "clientName", width: 145 },
          ];
          break;
        case "user-activity":
          columns = [
            { header: "Timestamp", key: "createdAt", width: 110 },
            { header: "User Name", key: "userName", width: 100 },
            { header: "Module", key: "module", width: 80 },
            { header: "Action", key: "action", width: 120 },
            { header: "IP Address", key: "ipAddress", width: 105 },
          ];
          break;
      }

      // Draw table headers
      const drawTableHeader = (y: number) => {
        doc.rect(40, y, 515, 20).fill("#2a2a2a");
        doc.fillColor("#ffffff").fontSize(9);
        let currentX = 45;
        columns.forEach((col) => {
          doc.text(col.header, currentX, y + 5, {
            width: col.width - 5,
            align: col.align || "left",
          });
          currentX += col.width;
        });
        doc.moveTo(40, y + 20).lineTo(555, y + 20).stroke("#3b3b3b");
      };

      let currentY = doc.y + 10;
      drawTableHeader(currentY);
      currentY += 20;

      // Draw table rows
      docs.forEach((item) => {
        // If height limit reached, trigger new page
        if (currentY > doc.page.height - 60) {
          doc.addPage();
          currentY = 40;
          drawTableHeader(currentY);
          currentY += 20;
        }

        // Format document properties based on columns
        const rowData: Record<string, string> = {};
        columns.forEach((col) => {
          let rawVal = item[col.key];

          // Formatting edge cases
          if (col.key === "openedDate" || col.key === "createdAt" || col.key === "issueDate" || col.key === "dueDate" || col.key === "date" || col.key === "paymentDate") {
            rowData[col.key] = rawVal ? new Date(rawVal).toLocaleDateString() : "N/A";
          } else if (col.key === "createdAt" && type === "user-activity") {
            rowData[col.key] = rawVal ? new Date(rawVal).toLocaleString() : "N/A";
          } else if (col.key === "duration") {
            rowData[col.key] = `${item.durationMinutes || 0}m`;
          } else if (col.key === "isBilled") {
            rowData[col.key] = item.isBilled ? "Yes" : "No";
          } else if (col.key === "estimatedValue") {
            rowData[col.key] = item.estimatedValue ? `$${parseFloat(item.estimatedValue.toString()).toLocaleString()}` : "$0.00";
          } else if (col.key === "hourlyRate" || col.key === "billableAmount" || col.key === "totalAmount" || col.key === "amountPaid" || col.key === "balanceDue" || col.key === "amount") {
            rowData[col.key] = `$${(rawVal || 0).toFixed(2)}`;
          } else if (col.key === "clientName" && type === "clients") {
            rowData[col.key] = item.clientType === "INDIVIDUAL"
              ? `${item.firstName || ""} ${item.lastName || ""}`.trim()
              : item.companyName || "";
          } else {
            rowData[col.key] = rawVal ? String(rawVal) : "N/A";
          }
        });

        // Alternate background rows
        if (Math.round(currentY) % 2 === 0) {
          doc.rect(40, currentY, 515, 18).fill("#141414");
        }
        doc.fillColor("#dddddd").fontSize(8);

        let currentX = 45;
        columns.forEach((col) => {
          doc.text(rowData[col.key], currentX, currentY + 4, {
            width: col.width - 5,
            align: col.align || "left",
          });
          currentX += col.width;
        });

        currentY += 18;
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
