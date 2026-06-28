import { Types } from "mongoose";
import { InvitationToken } from "../schemas/invitation-token.schema.js";
import { InvitationTokenDocument } from "../types/user.types.js";

export async function createInvitationToken(data: {
  userId: Types.ObjectId;
  firmId: Types.ObjectId;
  tokenHash: string;
  email: string;
  expiresAt: Date;
}): Promise<InvitationTokenDocument> {
  return InvitationToken.create(data);
}

export async function findValidToken(
  tokenHash: string
): Promise<InvitationTokenDocument | null> {
  return InvitationToken.findOne({
    tokenHash,
    acceptedAt: null,
    expiresAt: { $gt: new Date() },
  });
}

export async function consumeToken(tokenId: Types.ObjectId): Promise<void> {
  await InvitationToken.findByIdAndUpdate(tokenId, {
    $set: { acceptedAt: new Date() },
  });
}

export async function invalidatePreviousTokens(email: string): Promise<void> {
  await InvitationToken.updateMany(
    {
      email: email.toLowerCase(),
      acceptedAt: null,
      expiresAt: { $gt: new Date() },
    },
    {
      $set: { expiresAt: new Date() },
    }
  );
}
