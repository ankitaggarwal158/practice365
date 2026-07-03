import { Types, FilterQuery } from "mongoose";
import { InvoiceModel } from "./schemas/invoice.schema.js";
import { InvoiceItemModel } from "./schemas/invoice-item.schema.js";
import { InvoicePaymentModel } from "./schemas/invoice-payment.schema.js";
import { Invoice, InvoiceItem, InvoicePayment } from "./invoice.types.js";

export class InvoiceRepository {
  async create(data: Partial<Invoice>): Promise<Invoice> {
    const doc = new InvoiceModel(data);
    return doc.save();
  }

  async findById(id: string | Types.ObjectId, firmId: string | Types.ObjectId): Promise<Invoice | null> {
    return InvoiceModel.findOne({ _id: id, firmId, deleted: false })
      .populate("clientId", "firstName lastName name email")
      .populate("matterId", "title")
      .populate("createdBy", "firstName lastName email")
      .exec();
  }

  async update(id: string | Types.ObjectId, firmId: string | Types.ObjectId, data: Partial<Invoice>): Promise<Invoice | null> {
    return InvoiceModel.findOneAndUpdate(
      { _id: id, firmId, deleted: false },
      { $set: data },
      { new: true }
    )
      .populate("clientId", "firstName lastName name email")
      .populate("matterId", "title")
      .exec();
  }

  async softDelete(id: string | Types.ObjectId, firmId: string | Types.ObjectId, userId: string | Types.ObjectId): Promise<boolean> {
    const result = await InvoiceModel.updateOne(
      { _id: id, firmId, deleted: false },
      { 
        $set: { 
          deleted: true, 
          deletedAt: new Date(), 
          deletedBy: new Types.ObjectId(userId) 
        } 
      }
    ).exec();
    return result.modifiedCount > 0;
  }

  // Invoice Items
  async createItems(items: Partial<InvoiceItem>[]): Promise<InvoiceItem[]> {
    const docs = await InvoiceItemModel.insertMany(items);
    return docs as any;
  }

  async findItemsByInvoiceId(invoiceId: string | Types.ObjectId): Promise<InvoiceItem[]> {
    return InvoiceItemModel.find({ invoiceId }).sort({ displayOrder: 1 }).exec();
  }

  async deleteItemsByInvoiceId(invoiceId: string | Types.ObjectId): Promise<void> {
    await InvoiceItemModel.deleteMany({ invoiceId }).exec();
  }

  // Invoice Payments
  async createPayment(payment: Partial<InvoicePayment>): Promise<InvoicePayment> {
    const doc = new InvoicePaymentModel(payment);
    const saved = await doc.save();
    return saved;
  }

  async findPaymentsByInvoiceId(invoiceId: string | Types.ObjectId): Promise<InvoicePayment[]> {
    return InvoicePaymentModel.find({ invoiceId })
      .populate("receivedBy", "firstName lastName email")
      .sort({ createdAt: -1 })
      .exec();
  }

  // List and Search
  async search(filters: {
    firmId: string | Types.ObjectId;
    clientId?: string;
    matterId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    searchText?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Invoice[]; total: number }> {
    const query: FilterQuery<Invoice> = {
      firmId: new Types.ObjectId(filters.firmId),
      deleted: false,
    };

    if (filters.clientId) {
      query.clientId = new Types.ObjectId(filters.clientId);
    }
    if (filters.matterId) {
      query.matterId = new Types.ObjectId(filters.matterId);
    }
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.startDate || filters.endDate) {
      query.issueDate = {};
      if (filters.startDate) query.issueDate.$gte = new Date(filters.startDate);
      if (filters.endDate) query.issueDate.$lte = new Date(filters.endDate);
    }
    if (filters.searchText) {
      // Matches invoiceNumber exactly or partially
      query.invoiceNumber = { $regex: filters.searchText, $options: "i" };
    }

    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      InvoiceModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("clientId", "firstName lastName name email")
        .populate("matterId", "title")
        .exec(),
      InvoiceModel.countDocuments(query).exec(),
    ]);

    return { data, total };
  }
}

export const invoiceRepository = new InvoiceRepository();
