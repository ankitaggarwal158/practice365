export const PRACTICE_AREA_ERROR_MESSAGES = {
  NOT_FOUND: "Practice area not found.",
  DUPLICATE_NAME_OR_CODE: "A practice area with this name or code already exists in your firm.",
  CANNOT_DELETE_REFERENCED: "Cannot delete this practice area because it is referenced by one or more matters.",
  CANNOT_DELETE_SYSTEM: "Cannot delete a system default practice area.",
  INVALID_REORDER_DATA: "Invalid data provided for reordering practice areas.",
};

export const DEFAULT_PRACTICE_AREAS = [
  { name: "Civil Litigation", code: "CIVIL", description: "General civil litigation matters." },
  { name: "Criminal Law", code: "CRIMINAL", description: "Criminal defense and prosecution." },
  { name: "Family Law", code: "FAMILY", description: "Divorce, custody, and family matters." },
  { name: "Corporate Law", code: "CORPORATE", description: "Business formation and corporate governance." },
  { name: "Real Estate", code: "REAL_ESTATE", description: "Property transactions and disputes." },
  { name: "Employment Law", code: "EMPLOYMENT", description: "Workplace disputes and compliance." },
  { name: "Immigration", code: "IMMIGRATION", description: "Visas, citizenship, and deportation." },
  { name: "Estate Planning", code: "ESTATE", description: "Wills, trusts, and probate." },
];
