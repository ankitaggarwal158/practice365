import { Request, Response } from "express";
import { sendSuccess } from "../../shared/api-response.js";
import { AppError } from "../../shared/app-error.js";
import * as userService from "../users/service/user.service.js";
import * as opposingPartyService from "./opposing-party.service.js";
import * as matterOpposingPartyService from "./matter-opposing-party.service.js";

async function getRequestingUserFirmId(req: Request): Promise<string> {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  const user = await userService.getCurrentUser(req.user.userId);
  return user.firmId;
}

export function formatOpposingParty(party: any) {
  return {
    id: party._id.toString(),
    firmId: party.firmId.toString(),
    partyType: party.partyType,
    firstName: party.firstName || "",
    lastName: party.lastName || "",
    organizationName: party.organizationName || "",
    email: party.email || "",
    phone: party.phone || "",
    alternatePhone: party.alternatePhone || "",
    website: party.website || "",
    addressLine1: party.addressLine1 || "",
    addressLine2: party.addressLine2 || "",
    city: party.city || "",
    state: party.state || "",
    postalCode: party.postalCode || "",
    country: party.country || "",
    notes: party.notes || "",
    isActive: party.isActive,
    createdAt: party.createdAt.toISOString(),
    updatedAt: party.updatedAt.toISOString(),
  };
}

export function formatAssociation(assoc: any) {
  const formatted: any = {
    id: assoc._id.toString(),
    matterId: assoc.matterId.toString(),
    opposingPartyId: assoc.opposingPartyId._id ? assoc.opposingPartyId._id.toString() : assoc.opposingPartyId.toString(),
    role: assoc.role || "Opposing Party",
    createdAt: assoc.createdAt.toISOString(),
  };

  if (assoc.opposingPartyId && assoc.opposingPartyId._id) {
    formatted.opposingParty = formatOpposingParty(assoc.opposingPartyId);
  }

  return formatted;
}

export async function listOpposingParties(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const filter = {
    partyType: req.query.partyType as string,
    isActive: req.query.isActive === undefined ? undefined : req.query.isActive === "true",
    search: req.query.search as string,
    page,
    limit,
  };

  const result = await opposingPartyService.listOpposingParties(firmId, filter);
  const formattedDocs = result.docs.map(formatOpposingParty);

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

export async function getOpposingParty(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const id = req.params.id as string;
  const party = await opposingPartyService.getOpposingParty(id, firmId);
  sendSuccess(res, formatOpposingParty(party));
}

export async function createOpposingParty(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const userId = req.user!.userId;
  const party = await opposingPartyService.createOpposingParty(firmId, userId, req.body);
  res.status(201).json({
    success: true,
    data: formatOpposingParty(party),
  });
}

export async function updateOpposingParty(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const id = req.params.id as string;
  const party = await opposingPartyService.updateOpposingParty(id, firmId, req.body);
  sendSuccess(res, formatOpposingParty(party));
}

export async function deleteOpposingParty(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const id = req.params.id as string;
  const userId = req.user!.userId;
  await opposingPartyService.softDeleteOpposingParty(id, firmId, userId);
  res.status(204).send();
}

export async function archiveOpposingParty(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const id = req.params.id as string;
  const { isActive } = req.body;
  
  // Default to archiving (isActive: false) if not specified
  const targetActive = typeof isActive === "boolean" ? isActive : false;
  
  const party = await opposingPartyService.archiveOpposingParty(id, firmId, targetActive);
  sendSuccess(res, formatOpposingParty(party));
}

export async function checkDuplicates(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const excludeId = req.query.excludeId as string;
  const result = await opposingPartyService.checkOpposingPartyDuplicates(
    firmId,
    req.body,
    excludeId
  );
  sendSuccess(res, result);
}

export async function listMatterAssociations(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const matterId = req.params.id as string;
  const assocs = await matterOpposingPartyService.getMatterAssociations(matterId, firmId);
  sendSuccess(res, assocs.map(formatAssociation));
}

export async function updateMatterAssociations(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const matterId = req.params.id as string;
  const { opposingPartyIds } = req.body;
  const userId = req.user!.userId;
  const assocs = await matterOpposingPartyService.linkOpposingParties(
    firmId,
    matterId,
    opposingPartyIds,
    userId
  );
  sendSuccess(res, assocs.map(formatAssociation));
}

export async function unlinkMatterAssociation(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const matterId = req.params.id as string;
  const partyId = req.params.partyId as string;
  await matterOpposingPartyService.unlinkOpposingParty(firmId, matterId, partyId);
  res.status(204).send();
}
