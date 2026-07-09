import { AppError } from "../../shared/app-error.js";
import * as repository from "./firm-settings.repository.js";
import { ensureSettingsInitialized } from "./number-sequence.service.js";
import { FirmSettingsDocument, UpdateFirmSettingsRequest } from "./firm-settings.types.js";
import { recordAuditEvent } from "../audit-log/index.js";

export async function getSettings(firmId: string): Promise<FirmSettingsDocument> {
  const doc = await repository.findByFirmId(firmId);
  if (doc) {
    return doc;
  }
  // Initialize and fallback to defaults from firm if settings not found
  return ensureSettingsInitialized(firmId);
}

export async function updateSettings(
  firmId: string,
  data: UpdateFirmSettingsRequest,
  authContext: { userId: string; ipAddress?: string; userAgent?: string }
): Promise<FirmSettingsDocument> {
  const previous = await getSettings(firmId);
  const previousState = previous.toObject();

  const updated = await repository.update(firmId, data);
  if (!updated) {
    throw AppError.notFound("Firm settings not found.");
  }

  const currentState = updated.toObject();

  // central audit logging
  await recordAuditEvent({
    firmId,
    userId: authContext.userId,
    module: "Firm Settings",
    entityType: "FirmSettings",
    entityId: updated._id.toString(),
    action: "UPDATE",
    previousState,
    currentState,
    ipAddress: authContext.ipAddress,
    userAgent: authContext.userAgent,
    metadata: { message: "Modified firm settings configurations" },
  });

  return updated;
}

export async function updateLogoUrl(
  firmId: string,
  logoUrl: string,
  authContext: { userId: string; ipAddress?: string; userAgent?: string }
): Promise<FirmSettingsDocument> {
  return updateSettings(firmId, { firmLogo: logoUrl }, authContext);
}
