import PDFDocument from "pdfkit";
import { Invoice, InvoiceItem } from "./invoice.types.js";

export const invoicePdfService = {
  async generateInvoicePdf(invoice: Invoice, items: InvoiceItem[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: "A4" });
        const chunks: Buffer[] = [];

        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", (err) => reject(err));

        // Document title header
        doc.fontSize(20).text("INVOICE", { align: "right" });
        doc.fontSize(10).text(`Invoice Number: ${invoice.invoiceNumber}`, { align: "right" });
        doc.text(`Date: ${invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : new Date().toLocaleDateString()}`, { align: "right" });
        doc.text(`Due Date: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "N/A"}`, { align: "right" });
        doc.moveDown(2);

        // Bill To section
        doc.fontSize(12).text("Bill To:", { underline: true });
        const client = invoice.clientId as any;
        if (client) {
          const clientName = client.name || `${client.firstName || ""} ${client.lastName || ""}`.trim();
          doc.fontSize(10).text(clientName || "Unknown Client");
          if (client.email) {
            doc.text(client.email);
          }
        } else {
          doc.fontSize(10).text("N/A");
        }
        doc.moveDown(1.5);

        // Matter details
        const matter = invoice.matterId as any;
        if (matter) {
          doc.fontSize(12).text("Matter Reference:", { underline: true });
          doc.fontSize(10).text(matter.title || "N/A");
          doc.moveDown(1.5);
        }

        // Items Table
        doc.fontSize(12).text("Line Items:", { underline: true });
        doc.moveDown(0.5);

        const tableTop = doc.y;
        doc.fontSize(10);
        doc.text("Description", 50, tableTop, { width: 250 });
        doc.text("Qty", 300, tableTop, { width: 50, align: "right" });
        doc.text("Rate", 370, tableTop, { width: 70, align: "right" });
        doc.text("Amount", 460, tableTop, { width: 80, align: "right" });

        doc.moveTo(50, tableTop + 15).lineTo(540, tableTop + 15).stroke();
        let currentY = tableTop + 25;

        // Populate table rows
        items.forEach((item) => {
          doc.text(item.description || "", 50, currentY, { width: 250 });
          doc.text(item.quantity.toFixed(1), 300, currentY, { width: 50, align: "right" });
          doc.text(`$${item.rate.toFixed(2)}`, 370, currentY, { width: 70, align: "right" });
          doc.text(`$${item.amount.toFixed(2)}`, 460, currentY, { width: 80, align: "right" });
          currentY += 20;
        });

        doc.moveTo(50, currentY).lineTo(540, currentY).stroke();
        currentY += 15;

        // Invoice summaries
        doc.text("Subtotal:", 370, currentY, { width: 70, align: "right" });
        doc.text(`$${invoice.subtotal.toFixed(2)}`, 460, currentY, { width: 80, align: "right" });
        currentY += 15;

        doc.text("Tax Amount:", 370, currentY, { width: 70, align: "right" });
        doc.text(`$${invoice.taxAmount.toFixed(2)}`, 460, currentY, { width: 80, align: "right" });
        currentY += 15;

        doc.fontSize(11).text("Total Amount:", 370, currentY, { width: 70, align: "right" });
        doc.text(`$${invoice.totalAmount.toFixed(2)}`, 460, currentY, { width: 80, align: "right" });
        currentY += 20;

        doc.fontSize(11).text("Amount Paid:", 370, currentY, { width: 70, align: "right" });
        doc.text(`$${invoice.amountPaid.toFixed(2)}`, 460, currentY, { width: 80, align: "right" });
        currentY += 15;

        doc.fontSize(12).text("Balance Due:", 370, currentY, { width: 70, align: "right" });
        doc.text(`$${invoice.balanceDue.toFixed(2)}`, 460, currentY, { width: 80, align: "right" });

        // Internal Notes section
        if (invoice.notes) {
          doc.moveDown(3);
          doc.fontSize(10).text("Notes:", { underline: true });
          doc.text(invoice.notes);
        }

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
};
