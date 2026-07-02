export const PARTY_TYPES = ["INDIVIDUAL", "ORGANIZATION"] as const;
export type PartyType = (typeof PARTY_TYPES)[number];

export const OPPOSING_PARTY_ERROR_MESSAGES = {
  PARTY_NOT_FOUND: "Opposing party not found.",
  PARTY_TYPE_IMMUTABLE: "Party type cannot be changed after creation.",
  MATTER_ASSOCIATION_EXISTS: "This opposing party is already linked to this matter.",
  MATTER_ASSOCIATION_NOT_FOUND: "Opposing party link to matter not found.",
  CROSS_FIRM_LINK_PROHIBITED: "Cannot link opposing party and matter from different firms.",
  DUPLICATE_PARTY: "Opposing party with similar details already exists.",
} as const;
