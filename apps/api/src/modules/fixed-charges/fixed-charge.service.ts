import { Types } from "mongoose";
import { AppError } from "../../shared/app-error.js";
import { fixedChargeRepository } from "./fixed-charge.repository.js";
import { FIXED_CHARGE_ERROR_MESSAGES } from "./fixed-charge.constants.js";
import { CreateFixedChargeDTO, UpdateFixedChargeDTO, FixedChargeResponseData } from "./fixed-charge.types.js";
import { Matter } from "../matters/schemas/matter.schema.js";
import { Client } from "../clients/schemas/client.schema.js";

export function formatFixedCharge(record: any): FixedChargeResponseData {
  return {
    id: record._id.toString(),
    firmId: record.firmId.toString(),
    matterId: record.matterId.toString(),
    clientId: record.clientId.toString(),
    clientDescription: record.clientDescription,
    internalNote: record.internalNote || undefined,
    amount: record.amount,
    billingType: record.billingType,
    isBilled: record.isBilled,
    invoiceId: record.invoiceId ? record.invoiceId.toString() : null,
    date: record.date.toISOString(),
    createdBy: record.createdBy.toString(),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export const fixedChargeService = {
  async createFixedCharge(
    firmId: string,
    userId: string,
    data: CreateFixedChargeDTO
  ): Promise<FixedChargeResponseData> {
    // 1. Verify client exists for firm
    const clientExists = await Client.exists({ _id: data.clientId, firmId });
    if (!clientExists) {
      throw AppError.badRequest("Invalid client associated with this firm.");
    }

    // 2. Verify matter exists for firm and matches client
    const matter = await Matter.findOne({ _id: data.matterId, firmId });
    if (!matter) {
      throw AppError.badRequest("Invalid matter associated with this firm.");
    }
    if (matter.clientId.toString() !== data.clientId) {
      throw AppError.badRequest("Matter does not belong to the selected client.");
    }

    const record = await fixedChargeRepository.create({
      firmId: new Types.ObjectId(firmId),
      matterId: new Types.ObjectId(data.matterId),
      clientId: new Types.ObjectId(data.clientId),
      clientDescription: data.clientDescription,
      internalNote: data.internalNote || "",
      amount: data.amount,
      billingType: data.billingType,
      date: data.date ? new Date(data.date) : new Date(),
      createdBy: new Types.ObjectId(userId),
    });

    return formatFixedCharge(record);
  },

  async getFixedCharge(id: string, firmId: string): Promise<FixedChargeResponseData> {
    const record = await fixedChargeRepository.findById(id, firmId);
    if (!record) {
      throw AppError.notFound(FIXED_CHARGE_ERROR_MESSAGES.NOT_FOUND);
    }
    return formatFixedCharge(record);
  },

  async updateFixedCharge(
    id: string,
    firmId: string,
    data: UpdateFixedChargeDTO
  ): Promise<FixedChargeResponseData> {
    const record = await fixedChargeRepository.findById(id, firmId);
    if (!record) {
      throw AppError.notFound(FIXED_CHARGE_ERROR_MESSAGES.NOT_FOUND);
    }

    if (record.isBilled) {
      throw AppError.badRequest(FIXED_CHARGE_ERROR_MESSAGES.BILLED_READ_ONLY);
    }

    const updatePayload: any = { ...data };
    if (data.date) {
      updatePayload.date = new Date(data.date);
    }

    const updated = await fixedChargeRepository.update(id, firmId, updatePayload);
    if (!updated) {
      throw AppError.notFound(FIXED_CHARGE_ERROR_MESSAGES.NOT_FOUND);
    }

    return formatFixedCharge(updated);
  },

  async deleteFixedCharge(id: string, firmId: string, userId: string): Promise<boolean> {
    const record = await fixedChargeRepository.findById(id, firmId);
    if (!record) {
      throw AppError.notFound(FIXED_CHARGE_ERROR_MESSAGES.NOT_FOUND);
    }

    if (record.isBilled) {
      throw AppError.badRequest("Cannot delete a fixed charge that has already been billed.");
    }

    return fixedChargeRepository.softDelete(id, firmId, userId);
  },

  async listFixedCharges(
    firmId: string,
    filters: {
      matterId?: string;
      clientId?: string;
      isBilled?: boolean;
      billingType?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{ data: FixedChargeResponseData[]; total: number; pages: number }> {
    const result = await fixedChargeRepository.search(firmId, filters);
    return {
      data: result.data.map(formatFixedCharge),
      total: result.total,
      pages: result.pages,
    };
  }
};
