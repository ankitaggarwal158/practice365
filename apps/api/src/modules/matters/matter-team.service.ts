import { Types } from "mongoose";
import { AppError } from "../../shared/app-error.js";
import * as matterRepository from "./matter.repository.js";
import { User } from "../users/schemas/user.schema.js";
import { MATTER_ERROR_MESSAGES } from "./matter.constants.js";
import { MatterTeamMember } from "./schemas/matter.schema.js";

/**
 * Syncs/Updates the team members list for a matter.
 * Ensures firm isolation and prevents duplicate assignments.
 */
export async function updateTeam(
  matterId: string,
  firmId: string,
  teamMembers: Array<{ userId: string; role: string }>,
  assignerId: string
): Promise<any> {
  // Validate matter exists and belongs to firm
  const matter = await matterRepository.findById(matterId, firmId);
  if (!matter) {
    throw AppError.notFound(MATTER_ERROR_MESSAGES.MATTER_NOT_FOUND);
  }

  // Validate users belong to the same firm and exist
  const userIds = teamMembers.map((m) => new Types.ObjectId(m.userId));
  const users = await User.find({ _id: { $in: userIds }, firmId: new Types.ObjectId(firmId) });
  if (users.length !== teamMembers.length) {
    throw AppError.badRequest("One or more team members do not exist or belong to another firm.");
  }

  // Check for duplicates in the request
  const uniqueUserIds = new Set(teamMembers.map((m) => m.userId));
  if (uniqueUserIds.size !== teamMembers.length) {
    throw AppError.badRequest("Duplicate team members in request.");
  }

  // Delete all existing team members for this matter and insert the new ones
  await MatterTeamMember.deleteMany({ matterId: new Types.ObjectId(matterId) });

  const docs = teamMembers.map((m) => ({
    matterId: new Types.ObjectId(matterId),
    userId: new Types.ObjectId(m.userId),
    role: m.role,
    assignedBy: new Types.ObjectId(assignerId),
    assignedAt: new Date(),
  }));

  if (docs.length > 0) {
    await MatterTeamMember.insertMany(docs);
  }

  // Compliance Audit Logging
  console.log(`[AUDIT] Team Updated: MatterID=${matterId}, MemberCount=${docs.length}, ExecutorID=${assignerId}`);

  return matterRepository.findTeamMembersForMatter(matterId);
}
