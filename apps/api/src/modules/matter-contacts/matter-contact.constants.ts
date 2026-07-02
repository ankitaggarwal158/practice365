export const CONTACT_TYPES = ["INDIVIDUAL", "ORGANIZATION"] as const;

export const CONTACT_ROLES = [
  "WITNESS",
  "EXPERT_WITNESS",
  "JUDGE",
  "MEDIATOR",
  "ARBITRATOR",
  "COURT_CLERK",
  "INSURANCE_ADJUSTER",
  "GOVERNMENT_OFFICIAL",
  "CONSULTANT",
  "OTHER",
] as const;

export const MATTER_CONTACT_ERROR_MESSAGES = {
  CONTACT_NOT_FOUND: "Matter Contact not found.",
  CONTACT_TYPE_IMMUTABLE: "Contact type cannot be changed after creation.",
  MATTER_ASSOCIATION_NOT_FOUND: "Matter association not found.",
};
