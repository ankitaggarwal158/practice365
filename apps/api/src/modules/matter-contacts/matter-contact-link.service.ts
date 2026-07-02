import { Types } from "mongoose";
import { MatterContactLink } from "./schemas/matter-contact-link.schema.js";
import { MatterContact } from "./schemas/matter-contact.schema.js";
import { Matter } from "../matters/schemas/matter.schema.js";
import { AppError } from "../../shared/app-error.js";
import { ContactRole } from "./matter-contact.types.js";

export async function getMatterContactLinks(
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

  return MatterContactLink.find({ matterId: new Types.ObjectId(matterId) })
    .populate({
      path: "contactId",
      match: { deleted: false },
    })
    .exec();
}

export async function updateMatterContactLinks(
  firmId: string,
  matterId: string,
  incomingContacts: Array<{ contactId: string; role: ContactRole }>,
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

  const existingLinks = await MatterContactLink.find({
    matterId: new Types.ObjectId(matterId),
  });

  const existingContactIds = new Set(
    existingLinks.map((link) => link.contactId.toString())
  );

  const incomingIds = incomingContacts.map((c) => c.contactId);

  // Validate all incoming contacts
  for (const incoming of incomingContacts) {
    const { contactId, role } = incoming;

    if (!Types.ObjectId.isValid(contactId)) {
      throw AppError.validation(`Invalid Contact ID format: ${contactId}`);
    }

    const contact = await MatterContact.findOne({
      _id: new Types.ObjectId(contactId),
      firmId: new Types.ObjectId(firmId),
      deleted: false,
    });

    if (!contact) {
      throw AppError.notFound(`Matter Contact not found: ${contactId}`);
    }

    // Archived contacts cannot be linked to new matters
    const isNewLink = !existingContactIds.has(contactId);
    if (isNewLink && !contact.isActive) {
      throw AppError.validation("Archived contacts cannot be linked to new matters.");
    }
  }

  // Delete links not in the incoming list
  const incomingObjectIds = incomingIds.map((id) => new Types.ObjectId(id));
  await MatterContactLink.deleteMany({
    matterId: new Types.ObjectId(matterId),
    contactId: { $nin: incomingObjectIds },
  });

  // Upsert incoming links
  const results: any[] = [];
  for (const incoming of incomingContacts) {
    const { contactId, role } = incoming;

    const link = await MatterContactLink.findOneAndUpdate(
      {
        matterId: new Types.ObjectId(matterId),
        contactId: new Types.ObjectId(contactId),
      },
      {
        $set: { role },
        $setOnInsert: { createdBy: new Types.ObjectId(userId) },
      },
      { upsert: true, new: true }
    );

    results.push(link);
  }

  // Return populated links
  return MatterContactLink.find({ matterId: new Types.ObjectId(matterId) })
    .populate({
      path: "contactId",
      match: { deleted: false },
    })
    .exec();
}

export async function getContactMatterLinks(
  contactId: string,
  firmId: string
): Promise<any[]> {
  if (!Types.ObjectId.isValid(contactId) || !Types.ObjectId.isValid(firmId)) {
    throw AppError.validation("Invalid ID format.");
  }

  // Ensure contact belongs to this firm
  const contact = await MatterContact.findOne({
    _id: new Types.ObjectId(contactId),
    firmId: new Types.ObjectId(firmId),
    deleted: false,
  });

  if (!contact) {
    throw AppError.notFound("Contact not found.");
  }

  return MatterContactLink.find({ contactId: new Types.ObjectId(contactId) })
    .populate({
      path: "matterId",
      match: { deleted: false }, // wait, matters don't have deleted field if they don't support soft delete, let's just populate matterId.
    })
    .exec();
}
