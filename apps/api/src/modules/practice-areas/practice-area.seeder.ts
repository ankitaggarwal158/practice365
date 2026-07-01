import { Types } from "mongoose";
import * as practiceAreaRepository from "./practice-area.repository.js";
import { DEFAULT_PRACTICE_AREAS } from "./practice-area.constants.js";

/**
 * Seeds the default practice areas for a firm.
 * Designed to be called during firm creation if the firm has no practice areas.
 */
export async function seedPracticeAreasForFirm(firmId: string): Promise<void> {
  const count = await practiceAreaRepository.countByFirmId(firmId);
  if (count > 0) {
    // Already has practice areas, do not seed.
    return;
  }

  const promises = DEFAULT_PRACTICE_AREAS.map((pa, index) => {
    return practiceAreaRepository.create({
      firmId: new Types.ObjectId(firmId),
      name: pa.name,
      code: pa.code,
      description: pa.description,
      displayOrder: index + 1,
      isSystem: true,
      isActive: true,
      deleted: false,
    });
  });

  await Promise.all(promises);
}
