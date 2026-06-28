import { AppError } from "../../shared/app-error.js";
import { CLIENT_ERROR_MESSAGES } from "./client.constants.js";
import { Client, ClientNote, ClientAttachment } from "./schemas/client.schema.js";
import * as clientRepository from "./client.repository.js";
import { Types } from "mongoose";

export async function mergeClients(
  firmId: string,
  sourceClientId: string,
  targetClientId: string,
  userId: string
): Promise<any> {
  if (sourceClientId === targetClientId) {
    throw AppError.badRequest(CLIENT_ERROR_MESSAGES.MERGE_SELF);
  }

  const [sourceClient, targetClient] = await Promise.all([
    clientRepository.findById(sourceClientId, firmId),
    clientRepository.findById(targetClientId, firmId),
  ]);

  if (!sourceClient || !targetClient) {
    throw AppError.notFound(CLIENT_ERROR_MESSAGES.CLIENT_NOT_FOUND);
  }

  if (sourceClient.status === "ARCHIVED") {
    throw AppError.badRequest(CLIENT_ERROR_MESSAGES.MERGE_ARCHIVED);
  }

  // 1. Reassign notes
  await ClientNote.updateMany(
    { clientId: new Types.ObjectId(sourceClientId) },
    { $set: { clientId: new Types.ObjectId(targetClientId) } }
  );

  // 2. Reassign attachments
  await ClientAttachment.updateMany(
    { clientId: new Types.ObjectId(sourceClientId) },
    { $set: { clientId: new Types.ObjectId(targetClientId) } }
  );

  // 3. Mark source client as ARCHIVED and merged
  await clientRepository.update(sourceClientId, firmId, {
    status: "ARCHIVED",
    mergedIntoClientId: new Types.ObjectId(targetClientId),
  });

  // Compliance Audit Logging
  console.log(`[AUDIT] Clients Merged: SourceID=${sourceClientId}, TargetID=${targetClientId}, ExecutorID=${userId}`);

  return clientRepository.findByIdWithDetails(targetClientId, firmId);
}
