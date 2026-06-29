import * as matterRepository from "./matter.repository.js";
import { MatterDocument } from "./matter.types.js";

/**
 * Handles legal matter search, listing, and filtration logic.
 */
export async function searchMatters(
  firmId: string,
  filters: {
    page: number;
    limit: number;
    query?: string;
    status?: string;
    priority?: string;
    practiceAreaId?: string;
    clientId?: string;
    responsibleAttorneyId?: string;
  }
): Promise<{ data: MatterDocument[]; total: number; pages: number }> {
  return matterRepository.list(firmId, filters);
}
