import { Types } from "mongoose";
import { MatterOpposingParty } from "./schemas/matter-opposing-party.schema.js";
import { OpposingParty } from "./schemas/opposing-party.schema.js";
import { Matter } from "../matters/schemas/matter.schema.js";
import { AppError } from "../../shared/app-error.js";
import { OPPOSING_PARTY_ERROR_MESSAGES } from "./opposing-party.constants.js";

export async function getMatterAssociations(
  matterId: string,
  firmId: string
): Promise<any[]> {
  if (!Types.ObjectId.isValid(matterId) || !Types.ObjectId.isValid(firmId)) {
    throw AppError.validation("Invalid ID format.");
  }

  // Ensure matter belongs to this firm
  const matter = await Matter.findOne({
    _id: new Types.ObjectId(matterId),
    firmId: new Types.ObjectId(firmId),
  });

  if (!matter) {
    throw AppError.notFound("Matter not found.");
  }

  return MatterOpposingParty.find({ matterId: new Types.ObjectId(matterId) })
    .populate({
      path: "opposingPartyId",
      match: { deleted: false },
    })
    .exec();
}

export async function linkOpposingParties(
  firmId: string,
  matterId: string,
  opposingPartyIds: string[],
  userId: string
): Promise<any[]> {
  if (!Types.ObjectId.isValid(matterId) || !Types.ObjectId.isValid(firmId)) {
    throw AppError.validation("Invalid ID format.");
  }

  // Ensure matter belongs to this firm
  const matter = await Matter.findOne({
    _id: new Types.ObjectId(matterId),
    firmId: new Types.ObjectId(firmId),
  });

  if (!matter) {
    throw AppError.notFound("Matter not found.");
  }

  const results: any[] = [];

  for (const partyId of opposingPartyIds) {
    if (!Types.ObjectId.isValid(partyId)) {
      throw AppError.validation(`Invalid Opposing Party ID format: ${partyId}`);
    }

    // Verify opposing party belongs to this firm, is not deleted, and is ACTIVE (not archived)
    const party = await OpposingParty.findOne({
      _id: new Types.ObjectId(partyId),
      firmId: new Types.ObjectId(firmId),
      deleted: false,
    });

    if (!party) {
      throw AppError.notFound(`Opposing Party not found: ${partyId}`);
    }

    if (!party.isActive) {
      throw AppError.validation("Archived opposing parties cannot be linked to new matters.");
    }

    // Check if link already exists
    const existing = await MatterOpposingParty.findOne({
      matterId: new Types.ObjectId(matterId),
      opposingPartyId: new Types.ObjectId(partyId),
    });

    if (existing) {
      continue; // Skip if already linked
    }

    const linked = await MatterOpposingParty.create({
      matterId: new Types.ObjectId(matterId),
      opposingPartyId: new Types.ObjectId(partyId),
      createdBy: new Types.ObjectId(userId),
    });

    results.push(linked);
  }

  return results;
}

export async function unlinkOpposingParty(
  firmId: string,
  matterId: string,
  opposingPartyId: string
): Promise<void> {
  if (
    !Types.ObjectId.isValid(matterId) ||
    !Types.ObjectId.isValid(opposingPartyId) ||
    !Types.ObjectId.isValid(firmId)
  ) {
    throw AppError.validation("Invalid ID format.");
  }

  // Ensure matter belongs to this firm
  const matter = await Matter.findOne({
    _id: new Types.ObjectId(matterId),
    firmId: new Types.ObjectId(firmId),
  });

  if (!matter) {
    throw AppError.notFound("Matter not found.");
  }

  const result = await MatterOpposingParty.findOneAndDelete({
    matterId: new Types.ObjectId(matterId),
    opposingPartyId: new Types.ObjectId(opposingPartyId),
  });

  if (!result) {
    throw AppError.notFound(OPPOSING_PARTY_ERROR_MESSAGES.MATTER_ASSOCIATION_NOT_FOUND);
  }
}
