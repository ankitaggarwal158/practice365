import { Types } from "mongoose";
import { AppError } from "../../shared/app-error.js";
import { invoiceRepository } from "./invoice.repository.js";
import { invoiceNumberService } from "./invoice-number.service.js";
import { billingCalculationService } from "./billing-calculation.service.js";
import { InvoiceStatus, InvoiceItemSourceType } from "./invoice.constants.js";
import { Invoice, InvoiceItem } from "./invoice.types.js";
import { Client } from "../clients/schemas/client.schema.js";
import { Matter } from "../matters/schemas/matter.schema.js";
import { TimeEntryModel } from "../time-tracking/schemas/time-entry.schema.js";

export const invoiceService = {
  async createDraftInvoice(
    firmId: string,
    userId: string,
    data: {
      clientId: string;
      matterId?: string;
      timeEntryIds?: string[];
      expenseIds?: string[];
      manualItems?: {
        description: string;
        quantity: number;
        rate: number;
      }[];
      dueDate?: string | Date;
      notes?: string;
    }
  ): Promise<Invoice & { items: InvoiceItem[] }> {
    // 1. Validate Client
    const clientExists = await Client.exists({ _id: data.clientId, firmId });
    if (!clientExists) {
      throw AppError.badRequest("Invalid Client associated with this firm.");
    }

    // 2. Validate Matter (optional)
    if (data.matterId) {
      const matterExists = await Matter.exists({ _id: data.matterId, firmId });
      if (!matterExists) {
        throw AppError.badRequest("Invalid Matter associated with this firm.");
      }
    }

    // 3. Validate Time Entries
    const timeEntries: any[] = [];
    if (data.timeEntryIds && data.timeEntryIds.length > 0) {
      const entries = await TimeEntryModel.find({
        _id: { $in: data.timeEntryIds },
        firmId,
        deletedAt: { $exists: false },
      }).exec();

      if (entries.length !== data.timeEntryIds.length) {
        throw AppError.badRequest("One or more time entries could not be found.");
      }

      for (const entry of entries) {
        if (entry.isBilled) {
          throw AppError.badRequest(`Time entry ${entry._id} has already been billed.`);
        }
        if (entry.billingType === "NON_BILLABLE") {
          throw AppError.badRequest(`Time entry ${entry._id} is non-billable and cannot be invoiced.`);
        }
        timeEntries.push(entry);
      }
    }

    // 4. Generate unique invoice number
    const invoiceNumber = await invoiceNumberService.generateInvoiceNumber(firmId);

    // 5. Generate line items list
    const itemsToCreate: Partial<InvoiceItem>[] = [];
    let displayOrder = 0;

    // Time entries items
    timeEntries.forEach((entry) => {
      const quantity = Math.round((entry.durationMinutes / 60) * 100) / 100;
      itemsToCreate.push({
        sourceType: InvoiceItemSourceType.TIME_ENTRY,
        sourceId: entry._id,
        description: entry.description || "Billable Time",
        quantity,
        rate: entry.hourlyRate,
        amount: Math.round(quantity * entry.hourlyRate * 100) / 100,
        displayOrder: displayOrder++,
      });
    });

    // Manual items
    if (data.manualItems) {
      data.manualItems.forEach((manual) => {
        itemsToCreate.push({
          sourceType: InvoiceItemSourceType.MANUAL,
          description: manual.description,
          quantity: manual.quantity,
          rate: manual.rate,
          amount: Math.round(manual.quantity * manual.rate * 100) / 100,
          displayOrder: displayOrder++,
        });
      });
    }

    // 6. Calculate subtotal and totalAmount (0% default tax rate)
    const { subtotal, taxAmount, totalAmount, balanceDue } =
      billingCalculationService.calculateTotals(itemsToCreate as { amount: number }[], 0, 0);

    // 7. Create invoice master record
    const invoice = await invoiceRepository.create({
      firmId: new Types.ObjectId(firmId),
      clientId: new Types.ObjectId(data.clientId),
      matterId: data.matterId ? new Types.ObjectId(data.matterId) : undefined,
      invoiceNumber,
      status: InvoiceStatus.DRAFT,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      subtotal,
      taxAmount,
      totalAmount,
      amountPaid: 0,
      balanceDue,
      notes: data.notes,
      deleted: false,
      createdBy: new Types.ObjectId(userId),
    });

    // 8. Associate invoice items
    const items = await invoiceRepository.createItems(
      itemsToCreate.map((item) => ({
        ...item,
        invoiceId: invoice._id,
      }))
    );

    // 9. Lock time entries
    if (data.timeEntryIds && data.timeEntryIds.length > 0) {
      await TimeEntryModel.updateMany(
        { _id: { $in: data.timeEntryIds } },
        { $set: { isBilled: true } }
      ).exec();
    }

    console.log(`[AUDIT] Invoice Created: ID=${invoice._id}, Number=${invoice.invoiceNumber}`);

    return {
      ...((invoice as any).toObject ? (invoice as any).toObject() : invoice),
      items,
    };
  },

  async updateDraftInvoice(
    firmId: string,
    invoiceId: string,
    data: {
      clientId?: string;
      matterId?: string;
      dueDate?: string | Date;
      notes?: string;
      timeEntryIds?: string[];
      manualItems?: {
        description: string;
        quantity: number;
        rate: number;
      }[];
    }
  ): Promise<Invoice & { items: InvoiceItem[] }> {
    const invoice = await invoiceRepository.findById(invoiceId, firmId);
    if (!invoice) {
      throw AppError.notFound("Invoice not found.");
    }

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw AppError.badRequest("Only draft invoices can be updated.");
    }

    // Validate client update if changed
    if (data.clientId && data.clientId !== invoice.clientId.toString()) {
      const clientExists = await Client.exists({ _id: data.clientId, firmId });
      if (!clientExists) {
        throw AppError.badRequest("Invalid Client associated with this firm.");
      }
    }

    // Validate matter update if changed
    if (data.matterId && data.matterId !== invoice.matterId?.toString()) {
      const matterExists = await Matter.exists({ _id: data.matterId, firmId });
      if (!matterExists) {
        throw AppError.badRequest("Invalid Matter associated with this firm.");
      }
    }

    // Get current line items
    const currentItems = await invoiceRepository.findItemsByInvoiceId(invoiceId);

    // If new timeEntryIds or manualItems are provided, rewrite line items entirely
    let finalItems = currentItems;
    if (data.timeEntryIds !== undefined || data.manualItems !== undefined) {
      // 1. Release currently locked time entries
      const currentLockedIds = currentItems
        .filter((item) => item.sourceType === InvoiceItemSourceType.TIME_ENTRY && item.sourceId)
        .map((item) => item.sourceId!);

      if (currentLockedIds.length > 0) {
        await TimeEntryModel.updateMany(
          { _id: { $in: currentLockedIds } },
          { $set: { isBilled: false } }
        ).exec();
      }

      // 2. Delete old items
      await invoiceRepository.deleteItemsByInvoiceId(invoiceId);

      // 3. Construct new items list
      const itemsToCreate: Partial<InvoiceItem>[] = [];
      let displayOrder = 0;

      // Handle new time entries
      const targetTimeEntryIds = data.timeEntryIds || [];
      if (targetTimeEntryIds.length > 0) {
        const entries = await TimeEntryModel.find({
          _id: { $in: targetTimeEntryIds },
          firmId,
          deletedAt: { $exists: false },
        }).exec();

        if (entries.length !== targetTimeEntryIds.length) {
          throw AppError.badRequest("One or more time entries could not be found.");
        }

        for (const entry of entries) {
          if (entry.isBilled) {
            throw AppError.badRequest(`Time entry ${entry._id} has already been billed.`);
          }
          if (entry.billingType === "NON_BILLABLE") {
            throw AppError.badRequest(`Time entry ${entry._id} is non-billable and cannot be invoiced.`);
          }
          
          const quantity = Math.round((entry.durationMinutes / 60) * 100) / 100;
          itemsToCreate.push({
            invoiceId: invoice._id,
            sourceType: InvoiceItemSourceType.TIME_ENTRY,
            sourceId: entry._id,
            description: entry.description || "Billable Time",
            quantity,
            rate: entry.hourlyRate,
            amount: Math.round(quantity * entry.hourlyRate * 100) / 100,
            displayOrder: displayOrder++,
          });
        }
      }

      // Handle new manual items
      const targetManualItems = data.manualItems || [];
      targetManualItems.forEach((manual) => {
        itemsToCreate.push({
          invoiceId: invoice._id,
          sourceType: InvoiceItemSourceType.MANUAL,
          description: manual.description,
          quantity: manual.quantity,
          rate: manual.rate,
          amount: Math.round(manual.quantity * manual.rate * 100) / 100,
          displayOrder: displayOrder++,
        });
      });

      // 4. Save new items & lock new time entries
      finalItems = await invoiceRepository.createItems(itemsToCreate);
      if (targetTimeEntryIds.length > 0) {
        await TimeEntryModel.updateMany(
          { _id: { $in: targetTimeEntryIds } },
          { $set: { isBilled: true } }
        ).exec();
      }
    }

    // Recalculate totals
    const { subtotal, taxAmount, totalAmount, balanceDue } =
      billingCalculationService.calculateTotals(finalItems, 0, invoice.amountPaid);

    // Save invoice
    const updatedInvoice = await invoiceRepository.update(invoiceId, firmId, {
      clientId: data.clientId ? new Types.ObjectId(data.clientId) : invoice.clientId,
      matterId: data.matterId ? new Types.ObjectId(data.matterId) : invoice.matterId,
      dueDate: data.dueDate ? new Date(data.dueDate) : invoice.dueDate,
      notes: data.notes !== undefined ? data.notes : invoice.notes,
      subtotal,
      taxAmount,
      totalAmount,
      balanceDue,
    });

    console.log(`[AUDIT] Invoice Updated: ID=${invoice._id}`);

    return {
      ...((updatedInvoice as any)!.toObject ? (updatedInvoice as any)!.toObject() : updatedInvoice),
      items: finalItems,
    };
  },

  async issueInvoice(firmId: string, invoiceId: string): Promise<Invoice> {
    const invoice = await invoiceRepository.findById(invoiceId, firmId);
    if (!invoice) {
      throw AppError.notFound("Invoice not found.");
    }

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw AppError.badRequest("Only draft invoices can be issued.");
    }

    const updated = await invoiceRepository.update(invoiceId, firmId, {
      status: InvoiceStatus.ISSUED,
      issueDate: new Date(),
    });

    console.log(`[AUDIT] Invoice Issued: ID=${invoice._id}, Number=${invoice.invoiceNumber}`);

    return updated!;
  },

  async cancelInvoice(firmId: string, invoiceId: string): Promise<Invoice> {
    const invoice = await invoiceRepository.findById(invoiceId, firmId);
    if (!invoice) {
      throw AppError.notFound("Invoice not found.");
    }

    if (
      invoice.status !== InvoiceStatus.DRAFT &&
      invoice.status !== InvoiceStatus.ISSUED
    ) {
      throw AppError.badRequest("Only draft or issued invoices can be cancelled.");
    }

    // Unlock locked time entries
    const items = await invoiceRepository.findItemsByInvoiceId(invoiceId);
    const lockedIds = items
      .filter((item) => item.sourceType === InvoiceItemSourceType.TIME_ENTRY && item.sourceId)
      .map((item) => item.sourceId!);

    if (lockedIds.length > 0) {
      await TimeEntryModel.updateMany(
        { _id: { $in: lockedIds } },
        { $set: { isBilled: false } }
      ).exec();
    }

    const updated = await invoiceRepository.update(invoiceId, firmId, {
      status: InvoiceStatus.CANCELLED,
    });

    console.log(`[AUDIT] Invoice Cancelled: ID=${invoice._id}, Number=${invoice.invoiceNumber}`);

    return updated!;
  },

  async deleteDraftInvoice(firmId: string, invoiceId: string, userId: string): Promise<boolean> {
    const invoice = await invoiceRepository.findById(invoiceId, firmId);
    if (!invoice) {
      throw AppError.notFound("Invoice not found.");
    }

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw AppError.badRequest("Only draft invoices can be deleted.");
    }

    // Unlock locked time entries
    const items = await invoiceRepository.findItemsByInvoiceId(invoiceId);
    const lockedIds = items
      .filter((item) => item.sourceType === InvoiceItemSourceType.TIME_ENTRY && item.sourceId)
      .map((item) => item.sourceId!);

    if (lockedIds.length > 0) {
      await TimeEntryModel.updateMany(
        { _id: { $in: lockedIds } },
        { $set: { isBilled: false } }
      ).exec();
    }

    const deleted = await invoiceRepository.softDelete(invoiceId, firmId, userId);
    console.log(`[AUDIT] Invoice Deleted: ID=${invoice._id}, DeletedBy=${userId}`);
    return deleted;
  },

  async getInvoiceDetails(
    firmId: string,
    invoiceId: string
  ): Promise<Invoice & { items: InvoiceItem[] }> {
    const invoice = await invoiceRepository.findById(invoiceId, firmId);
    if (!invoice) {
      throw AppError.notFound("Invoice not found.");
    }

    const items = await invoiceRepository.findItemsByInvoiceId(invoiceId);
    
    return {
      ...((invoice as any).toObject ? (invoice as any).toObject() : invoice),
      items,
    };
  },

  async search(filters: {
    firmId: string;
    clientId?: string;
    matterId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    searchText?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Invoice[]; total: number }> {
    return invoiceRepository.search(filters);
  }
};
