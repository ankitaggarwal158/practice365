export type ContactType = "INDIVIDUAL" | "ORGANIZATION";

export type ContactRole =
  | "WITNESS"
  | "EXPERT_WITNESS"
  | "JUDGE"
  | "MEDIATOR"
  | "ARBITRATOR"
  | "COURT_CLERK"
  | "INSURANCE_ADJUSTER"
  | "GOVERNMENT_OFFICIAL"
  | "CONSULTANT"
  | "OTHER";

export interface MatterContact {
  id: string;
  firmId: string;
  contactType: ContactType;
  firstName?: string;
  lastName?: string;
  organizationName?: string;
  email?: string;
  phone?: string;
  alternatePhone?: string;
  website?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMatterContactRequest {
  contactType: ContactType;
  firstName?: string;
  lastName?: string;
  organizationName?: string;
  email?: string;
  phone?: string;
  alternatePhone?: string;
  website?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  notes?: string;
}

export interface UpdateMatterContactRequest {
  firstName?: string;
  lastName?: string;
  organizationName?: string;
  email?: string;
  phone?: string;
  alternatePhone?: string;
  website?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  notes?: string;
}

export interface MatterContactLink {
  id: string;
  matterId: string;
  contactId: string;
  role: ContactRole;
  contact?: MatterContact;
  createdAt: string;
}

export interface Duplicate {
  id: string;
  name: string;
  contactType: string;
  matchReasons: string[];
}

export interface DuplicateCheckResult {
  hasDuplicates: boolean;
  duplicates: Duplicate[];
}

export interface PaginatedResult<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
