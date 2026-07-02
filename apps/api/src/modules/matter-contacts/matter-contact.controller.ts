import { Request, Response } from "express";
import { sendSuccess } from "../../shared/api-response.js";
import { AppError } from "../../shared/app-error.js";
import * as userService from "../users/service/user.service.js";
import * as matterContactService from "./matter-contact.service.js";
import * as matterContactLinkService from "./matter-contact-link.service.js";

async function getRequestingUserFirmId(req: Request): Promise<string> {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  const user = await userService.getCurrentUser(req.user.userId);
  return user.firmId;
}

export function formatMatterContact(contact: any) {
  return {
    id: contact._id.toString(),
    firmId: contact.firmId.toString(),
    contactType: contact.contactType,
    firstName: contact.firstName || "",
    lastName: contact.lastName || "",
    organizationName: contact.organizationName || "",
    email: contact.email || "",
    phone: contact.phone || "",
    alternatePhone: contact.alternatePhone || "",
    website: contact.website || "",
    addressLine1: contact.addressLine1 || "",
    addressLine2: contact.addressLine2 || "",
    city: contact.city || "",
    state: contact.state || "",
    postalCode: contact.postalCode || "",
    country: contact.country || "",
    notes: contact.notes || "",
    isActive: contact.isActive,
    createdAt: contact.createdAt.toISOString(),
    updatedAt: contact.updatedAt.toISOString(),
  };
}

export function formatContactLink(link: any) {
  const formatted: any = {
    id: link._id.toString(),
    matterId: link.matterId._id ? link.matterId._id.toString() : link.matterId.toString(),
    contactId: link.contactId._id ? link.contactId._id.toString() : link.contactId.toString(),
    role: link.role,
    createdAt: link.createdAt.toISOString(),
  };

  if (link.contactId && link.contactId._id) {
    formatted.contact = formatMatterContact(link.contactId);
  }

  if (link.matterId && link.matterId._id) {
    formatted.matterId = {
      id: link.matterId._id.toString(),
      matterNumber: link.matterId.matterNumber,
      title: link.matterId.title,
      status: link.matterId.status,
    };
  }

  return formatted;
}

export async function listMatterContacts(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const filter = {
    contactType: req.query.contactType as string,
    isActive: req.query.isActive === undefined ? undefined : req.query.isActive === "true",
    search: req.query.search as string,
    page,
    limit,
  };

  const result = await matterContactService.listMatterContacts(firmId, filter);
  const formattedDocs = result.docs.map(formatMatterContact);

  res.status(200).json({
    success: true,
    data: formattedDocs,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.totalDocs,
      pages: result.totalPages,
    },
  });
}

export async function getMatterContact(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const id = req.params.id as string;
  const contact = await matterContactService.getMatterContact(id, firmId);
  sendSuccess(res, formatMatterContact(contact));
}

export async function createMatterContact(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const userId = req.user!.userId as string;
  const contact = await matterContactService.createMatterContact(firmId, userId, req.body);
  res.status(201).json({
    success: true,
    data: formatMatterContact(contact),
  });
}

export async function updateMatterContact(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const id = req.params.id as string;
  const contact = await matterContactService.updateMatterContact(id, firmId, req.body);
  sendSuccess(res, formatMatterContact(contact));
}

export async function deleteMatterContact(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const id = req.params.id as string;
  const userId = req.user!.userId as string;
  await matterContactService.softDeleteMatterContact(id, firmId, userId);
  res.status(204).send();
}

export async function archiveMatterContact(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const id = req.params.id as string;
  const { isActive } = req.body;

  const targetActive = typeof isActive === "boolean" ? isActive : false;

  const contact = await matterContactService.archiveMatterContact(id, firmId, targetActive);
  sendSuccess(res, formatMatterContact(contact));
}

export async function checkDuplicates(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const excludeId = req.query.excludeId as string;
  const result = await matterContactService.checkMatterContactDuplicates(
    firmId,
    req.body,
    excludeId
  );
  sendSuccess(res, result);
}

export async function listMatterContactLinks(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const matterId = req.params.id as string;
  const links = await matterContactLinkService.getMatterContactLinks(matterId, firmId);
  sendSuccess(res, links.map(formatContactLink));
}

export async function updateMatterContactLinks(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const matterId = req.params.id as string;
  const { contacts } = req.body;
  const userId = req.user!.userId as string;
  const links = await matterContactLinkService.updateMatterContactLinks(
    firmId,
    matterId,
    contacts,
    userId
  );
  sendSuccess(res, links.map(formatContactLink));
}

export async function listContactMatterLinks(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const contactId = req.params.id as string;
  const links = await matterContactLinkService.getContactMatterLinks(contactId, firmId);
  sendSuccess(res, links.map(formatContactLink));
}
