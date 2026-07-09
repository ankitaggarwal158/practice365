import { numberSequenceService } from "../firm-settings/index.js";

export const invoiceNumberService = {
  async generateInvoiceNumber(firmId: string): Promise<string> {
    return numberSequenceService.generateInvoiceNumber(firmId);
  }
};

