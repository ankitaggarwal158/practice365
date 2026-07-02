export type PartyType = "INDIVIDUAL" | "ORGANIZATION";

export interface OpposingParty {
  id: string;
  firmId: string;
  partyType: PartyType;
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

export interface CreateOpposingPartyRequest {
  partyType: PartyType;
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

export interface UpdateOpposingPartyRequest {
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

export interface MatterAssociation {
  id: string;
  matterId: string;
  opposingPartyId: string;
  role?: string;
  opposingParty?: OpposingParty;
  createdAt: string;
}

export interface Duplicate {
  id: string;
  name: string;
  partyType: string;
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
