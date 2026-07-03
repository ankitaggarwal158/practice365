import { InvoiceModel } from "./schemas/invoice.schema.js";

export const invoiceNumberService = {
  async generateInvoiceNumber(firmId: string): Promise<string> {
    const currentYear = new Date().getFullYear();
    const count = await InvoiceModel.countDocuments({ firmId }).exec();
    
    let index = count + 1;
    let invoiceNumber = `INV-${currentYear}-${String(index).padStart(6, "0")}`;
    
    // Loop to ensure uniqueness under high concurrency or deleted records gap
    let exists = await InvoiceModel.exists({ firmId, invoiceNumber });
    while (exists) {
      index++;
      invoiceNumber = `INV-${currentYear}-${String(index).padStart(6, "0")}`;
      exists = await InvoiceModel.exists({ firmId, invoiceNumber });
    }
    
    return invoiceNumber;
  }
};
