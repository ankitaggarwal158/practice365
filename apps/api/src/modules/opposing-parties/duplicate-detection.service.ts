import * as opposingPartyRepository from "./opposing-party.repository.js";
import { OpposingPartyDocument } from "./opposing-party.types.js";

export interface DuplicateCheckResult {
  hasDuplicates: boolean;
  duplicates: Array<{
    id: string;
    name: string;
    partyType: string;
    matchReasons: string[];
  }>;
}

export async function detectDuplicates(
  firmId: string,
  data: {
    partyType: string;
    firstName?: string;
    lastName?: string;
    organizationName?: string;
    email?: string;
    phone?: string;
  },
  excludeId?: string
): Promise<DuplicateCheckResult> {
  const potentials = await opposingPartyRepository.findByNameAndEmailOrPhone(
    firmId,
    data,
    excludeId
  );

  if (potentials.length === 0) {
    return { hasDuplicates: false, duplicates: [] };
  }

  const duplicates = potentials.map((p) => {
    const reasons: string[] = [];

    // Check Email Match
    if (
      data.email &&
      p.email &&
      data.email.trim().toLowerCase() === p.email.trim().toLowerCase()
    ) {
      reasons.push("Email Address matches exactly");
    }

    // Check Phone Match
    if (
      data.phone &&
      p.phone &&
      data.phone.replace(/\D/g, "") === p.phone.replace(/\D/g, "")
    ) {
      reasons.push("Phone Number matches exactly");
    }

    // Check Name Match
    if (data.partyType === "INDIVIDUAL" && p.partyType === "INDIVIDUAL") {
      if (
        data.firstName?.trim().toLowerCase() === p.firstName?.trim().toLowerCase() &&
        data.lastName?.trim().toLowerCase() === p.lastName?.trim().toLowerCase()
      ) {
        reasons.push("Full Name matches exactly");
      }
    }

    // Check Org Name Match
    if (data.partyType === "ORGANIZATION" && p.partyType === "ORGANIZATION") {
      if (
        data.organizationName?.trim().toLowerCase() === p.organizationName?.trim().toLowerCase()
      ) {
        reasons.push("Organization Name matches exactly");
      }
    }

    const name =
      p.partyType === "INDIVIDUAL"
        ? `${p.firstName} ${p.lastName}`
        : p.organizationName || "";

    return {
      id: p._id.toString(),
      name,
      partyType: p.partyType,
      matchReasons: reasons.length > 0 ? reasons : ["Similar contact attributes found"],
    };
  });

  return {
    hasDuplicates: true,
    duplicates,
  };
}
