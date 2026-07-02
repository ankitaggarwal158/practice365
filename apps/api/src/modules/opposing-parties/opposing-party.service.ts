import { Types } from "mongoose";
import * as opposingPartyRepository from "./opposing-party.repository.js";
import { OpposingPartyDocument } from "./opposing-party.types.js";
import { OPPOSING_PARTY_ERROR_MESSAGES } from "./opposing-party.constants.js";
import { MatterOpposingParty } from "./schemas/matter-opposing-party.schema.js";
import { AppError } from "../../shared/app-error.js";
import { detectDuplicates } from "./duplicate-detection.service.js";

export async function listOpposingParties(
  firmId: string,
  filter: opposingPartyRepository.ListFilter
) {
  return opposingPartyRepository.findAll(firmId, filter);
}

export async function getOpposingParty(
  id: string,
  firmId: string
): Promise<OpposingPartyDocument> {
  const party = await opposingPartyRepository.findById(id, firmId);
  if (!party) {
    throw AppError.notFound(OPPOSING_PARTY_ERROR_MESSAGES.PARTY_NOT_FOUND);
  }
  return party;
}

export async function createOpposingParty(
  firmId: string,
  userId: string,
  data: {
    partyType: "INDIVIDUAL" | "ORGANIZATION";
    firstName?: string;
    lastName?: string;
    organizationName?: string;
    email?: string;
    phone?: string;
    alternatePhone?: string;
    website?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    notes?: string;
  }
): Promise<OpposingPartyDocument> {
  // Validate fields based on type
  if (data.partyType === "INDIVIDUAL") {
    if (!data.firstName?.trim() || !data.lastName?.trim()) {
      throw AppError.validation("First name and last name are required for individual parties.");
    }
  } else if (data.partyType === "ORGANIZATION") {
    if (!data.organizationName?.trim()) {
      throw AppError.validation("Organization name is required for organization parties.");
    }
  } else {
    throw AppError.validation("Invalid party type.");
  }

  const payload: Partial<OpposingPartyDocument> = {
    ...data,
    firmId: new Types.ObjectId(firmId),
    createdBy: new Types.ObjectId(userId),
    isActive: true,
    deleted: false,
  };

  return opposingPartyRepository.create(payload);
}

export async function updateOpposingParty(
  id: string,
  firmId: string,
  data: any
): Promise<OpposingPartyDocument> {
  // Prevent mutating partyType
  if (data.partyType && data.partyType !== undefined) {
    throw AppError.validation(OPPOSING_PARTY_ERROR_MESSAGES.PARTY_TYPE_IMMUTABLE);
  }

  // Verify opposing party exists
  const existing = await opposingPartyRepository.findById(id, firmId);
  if (!existing) {
    throw AppError.notFound(OPPOSING_PARTY_ERROR_MESSAGES.PARTY_NOT_FOUND);
  }

  if (existing.partyType === "INDIVIDUAL") {
    if (data.firstName !== undefined && !data.firstName.trim()) {
      throw AppError.validation("First name cannot be empty.");
    }
    if (data.lastName !== undefined && !data.lastName.trim()) {
      throw AppError.validation("Last name cannot be empty.");
    }
  } else if (existing.partyType === "ORGANIZATION") {
    if (data.organizationName !== undefined && !data.organizationName.trim()) {
      throw AppError.validation("Organization name cannot be empty.");
    }
  }

  const updated = await opposingPartyRepository.update(id, firmId, data);
  if (!updated) {
    throw AppError.notFound(OPPOSING_PARTY_ERROR_MESSAGES.PARTY_NOT_FOUND);
  }

  return updated;
}

export async function archiveOpposingParty(
  id: string,
  firmId: string,
  isActive: boolean
): Promise<OpposingPartyDocument> {
  const party = await opposingPartyRepository.findById(id, firmId);
  if (!party) {
    throw AppError.notFound(OPPOSING_PARTY_ERROR_MESSAGES.PARTY_NOT_FOUND);
  }

  const updated = await opposingPartyRepository.archive(id, firmId, isActive);
  if (!updated) {
    throw AppError.notFound(OPPOSING_PARTY_ERROR_MESSAGES.PARTY_NOT_FOUND);
  }

  return updated;
}

export async function softDeleteOpposingParty(
  id: string,
  firmId: string,
  deletedBy: string
): Promise<OpposingPartyDocument> {
  const party = await opposingPartyRepository.findById(id, firmId);
  if (!party) {
    throw AppError.notFound(OPPOSING_PARTY_ERROR_MESSAGES.PARTY_NOT_FOUND);
  }

  // Prevent deletion if referenced in junction table
  const linkCount = await MatterOpposingParty.countDocuments({
    opposingPartyId: new Types.ObjectId(id),
  });

  if (linkCount > 0) {
    throw AppError.validation("Cannot delete an opposing party linked to matters.");
  }

  const deleted = await opposingPartyRepository.softDelete(id, firmId, deletedBy);
  if (!deleted) {
    throw AppError.notFound(OPPOSING_PARTY_ERROR_MESSAGES.PARTY_NOT_FOUND);
  }

  return deleted;
}

export async function checkOpposingPartyDuplicates(
  firmId: string,
  data: any,
  excludeId?: string
) {
  return detectDuplicates(firmId, data, excludeId);
}
