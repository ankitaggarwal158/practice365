import { Types } from "mongoose";
import * as matterContactRepository from "./matter-contact.repository.js";
import { MatterContactDocument } from "./matter-contact.types.js";
import { MATTER_CONTACT_ERROR_MESSAGES } from "./matter-contact.constants.js";
import { MatterContactLink } from "./schemas/matter-contact-link.schema.js";
import { AppError } from "../../shared/app-error.js";
import { detectDuplicates } from "./duplicate-detection.service.js";

export async function listMatterContacts(
  firmId: string,
  filter: matterContactRepository.ListFilter
) {
  return matterContactRepository.findAll(firmId, filter);
}

export async function getMatterContact(
  id: string,
  firmId: string
): Promise<MatterContactDocument> {
  const contact = await matterContactRepository.findById(id, firmId);
  if (!contact) {
    throw AppError.notFound(MATTER_CONTACT_ERROR_MESSAGES.CONTACT_NOT_FOUND);
  }
  return contact;
}

export async function createMatterContact(
  firmId: string,
  userId: string,
  data: {
    contactType: "INDIVIDUAL" | "ORGANIZATION";
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
): Promise<MatterContactDocument> {
  if (data.contactType === "INDIVIDUAL") {
    if (!data.firstName?.trim() || !data.lastName?.trim()) {
      throw AppError.validation("First name and last name are required for individual contacts.");
    }
  } else if (data.contactType === "ORGANIZATION") {
    if (!data.organizationName?.trim()) {
      throw AppError.validation("Organization name is required for organization contacts.");
    }
  } else {
    throw AppError.validation("Invalid contact type.");
  }

  const payload: Partial<MatterContactDocument> = {
    ...data,
    firmId: new Types.ObjectId(firmId),
    createdBy: new Types.ObjectId(userId),
    isActive: true,
    deleted: false,
  };

  return matterContactRepository.create(payload);
}

export async function updateMatterContact(
  id: string,
  firmId: string,
  data: any
): Promise<MatterContactDocument> {
  if (data.contactType && data.contactType !== undefined) {
    throw AppError.validation(MATTER_CONTACT_ERROR_MESSAGES.CONTACT_TYPE_IMMUTABLE);
  }

  const existing = await matterContactRepository.findById(id, firmId);
  if (!existing) {
    throw AppError.notFound(MATTER_CONTACT_ERROR_MESSAGES.CONTACT_NOT_FOUND);
  }

  if (existing.contactType === "INDIVIDUAL") {
    if (data.firstName !== undefined && !data.firstName.trim()) {
      throw AppError.validation("First name cannot be empty.");
    }
    if (data.lastName !== undefined && !data.lastName.trim()) {
      throw AppError.validation("Last name cannot be empty.");
    }
  } else if (existing.contactType === "ORGANIZATION") {
    if (data.organizationName !== undefined && !data.organizationName.trim()) {
      throw AppError.validation("Organization name cannot be empty.");
    }
  }

  const updated = await matterContactRepository.update(id, firmId, data);
  if (!updated) {
    throw AppError.notFound(MATTER_CONTACT_ERROR_MESSAGES.CONTACT_NOT_FOUND);
  }

  return updated;
}

export async function archiveMatterContact(
  id: string,
  firmId: string,
  isActive: boolean
): Promise<MatterContactDocument> {
  const contact = await matterContactRepository.findById(id, firmId);
  if (!contact) {
    throw AppError.notFound(MATTER_CONTACT_ERROR_MESSAGES.CONTACT_NOT_FOUND);
  }

  const updated = await matterContactRepository.archive(id, firmId, isActive);
  if (!updated) {
    throw AppError.notFound(MATTER_CONTACT_ERROR_MESSAGES.CONTACT_NOT_FOUND);
  }

  return updated;
}

export async function softDeleteMatterContact(
  id: string,
  firmId: string,
  deletedBy: string
): Promise<MatterContactDocument> {
  const contact = await matterContactRepository.findById(id, firmId);
  if (!contact) {
    throw AppError.notFound(MATTER_CONTACT_ERROR_MESSAGES.CONTACT_NOT_FOUND);
  }

  const linkCount = await MatterContactLink.countDocuments({
    contactId: new Types.ObjectId(id),
  });

  if (linkCount > 0) {
    throw AppError.validation("Cannot delete a contact linked to matters.");
  }

  const deleted = await matterContactRepository.softDelete(id, firmId, deletedBy);
  if (!deleted) {
    throw AppError.notFound(MATTER_CONTACT_ERROR_MESSAGES.CONTACT_NOT_FOUND);
  }

  return deleted;
}

export async function checkMatterContactDuplicates(
  firmId: string,
  data: any,
  excludeId?: string
) {
  return detectDuplicates(firmId, data, excludeId);
}
