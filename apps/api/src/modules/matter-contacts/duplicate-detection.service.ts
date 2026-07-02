import * as matterContactRepository from "./matter-contact.repository.js";

function cleanPhone(num?: string): string {
  if (!num) return "";
  return num.replace(/\D/g, "");
}

export interface DuplicateMatch {
  id: string;
  name: string;
  contactType: string;
  matchReasons: string[];
}

export interface DuplicateDetectionResult {
  hasDuplicates: boolean;
  duplicates: DuplicateMatch[];
}

export async function detectDuplicates(
  firmId: string,
  data: {
    contactType: "INDIVIDUAL" | "ORGANIZATION";
    firstName?: string;
    lastName?: string;
    organizationName?: string;
    email?: string;
    phone?: string;
  },
  excludeId?: string
): Promise<DuplicateDetectionResult> {
  const potentialMatches = await matterContactRepository.findByNameAndEmailOrPhone(firmId, data);
  const duplicates: DuplicateMatch[] = [];

  const inputName =
    data.contactType === "INDIVIDUAL"
      ? `${data.firstName || ""} ${data.lastName || ""}`.trim().toLowerCase()
      : (data.organizationName || "").trim().toLowerCase();

  const inputEmail = data.email?.trim().toLowerCase() || "";
  const inputPhone = cleanPhone(data.phone);

  for (const match of potentialMatches) {
    if (excludeId && match._id.toString() === excludeId) {
      continue;
    }

    const matchReasons: string[] = [];

    const matchName =
      match.contactType === "INDIVIDUAL"
        ? `${match.firstName || ""} ${match.lastName || ""}`.trim().toLowerCase()
        : (match.organizationName || "").trim().toLowerCase();

    const matchEmail = match.email?.trim().toLowerCase() || "";
    const matchPhone = cleanPhone(match.phone);

    // 1. Name Check
    if (inputName && matchName && inputName === matchName) {
      matchReasons.push("Full Name matches exactly");
    }

    // 2. Email Check
    if (inputEmail && matchEmail && inputEmail === matchEmail) {
      matchReasons.push("Email Address matches exactly");
    }

    // 3. Phone Check
    if (inputPhone && matchPhone && inputPhone === matchPhone) {
      matchReasons.push("Phone Number matches exactly");
    }

    if (matchReasons.length > 0) {
      duplicates.push({
        id: match._id.toString(),
        name:
          match.contactType === "INDIVIDUAL"
            ? `${match.firstName} ${match.lastName}`
            : match.organizationName || "",
        contactType: match.contactType,
        matchReasons,
      });
    }
  }

  return {
    hasDuplicates: duplicates.length > 0,
    duplicates,
  };
}
