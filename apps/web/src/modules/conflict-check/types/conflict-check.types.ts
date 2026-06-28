export interface MatchRecord {
  entityType: "LEAD" | "CLIENT" | "MATTER" | "OPPOSING_PARTY";
  entityId: string;
  entityName: string;
  matchedField: string;
  matchedValue: string;
  similarityScore: number;
}

export interface ConflictCheck {
  id: string;
  firmId: string;
  leadId?: string;
  clientId?: string;
  matterId?: string;
  requestedBy: string;
  requestedByName?: string;
  reviewedBy?: string;
  reviewedByName?: string;
  overallResult: "NO_CONFLICT" | "POSSIBLE_CONFLICT" | "CONFIRMED_CONFLICT";
  finalDecision: "PENDING" | "CLEARED" | "WAIVED" | "REJECTED";
  reviewNotes: string;
  completedAt?: string;
  createdAt: string;
  matches: MatchRecord[];
}

export interface PaginatedConflictChecks {
  data: ConflictCheck[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ManualSearchRequest {
  personName?: string;
  organizationName?: string;
  email?: string;
  phone?: string;
}

export interface ConflictEngineResult {
  overallResult: "NO_CONFLICT" | "POSSIBLE_CONFLICT" | "CONFIRMED_CONFLICT";
  matches: MatchRecord[];
}
