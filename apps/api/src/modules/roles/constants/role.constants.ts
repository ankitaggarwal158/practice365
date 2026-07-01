export const ROLE_ERROR_MESSAGES = {
  ROLE_NOT_FOUND: "Role not found.",
  ROLE_NAME_REQUIRED: "Role name is required.",
  ROLE_NAME_DUPLICATE: "A role with this name already exists in your firm.",
  SYSTEM_ROLE_PROTECTED: "System roles cannot be modified or deleted.",
  SYSTEM_ROLE_CANNOT_DEACTIVATE: "System roles cannot be deactivated.",
  SYSTEM_ROLE_MANDATORY_PERMISSIONS: "System roles cannot lose mandatory permissions.",
  ROLE_ASSIGNMENT_REQUIRED: "Every user must be assigned at least one role.",
  ACCESS_DENIED_SAME_FIRM: "Access denied. Role belongs to another firm.",
  PERMISSION_NOT_FOUND: "One or more permissions do not exist.",
  DUPLICATE_ASSIGNMENT: "Duplicate assignment detected.",
};

export interface SystemPermissionDef {
  code: string;
  name: string;
  module: string;
  description: string;
}

export const SYSTEM_PERMISSIONS: SystemPermissionDef[] = [
  // Users module permissions
  { code: "USERS_VIEW", name: "View Users", module: "Users", description: "View internal firm user list and details." },
  { code: "USERS_CREATE", name: "Invite Users", module: "Users", description: "Invite new firm users." },
  { code: "USERS_UPDATE", name: "Update Users", module: "Users", description: "Modify firm user details or status." },
  { code: "USERS_DELETE", name: "Delete Users", module: "Users", description: "Deactivate/delete firm users." },

  // Clients module permissions
  { code: "CLIENTS_VIEW", name: "View Clients", module: "Clients", description: "View firm client directories and details." },
  { code: "CLIENTS_CREATE", name: "Create Clients", module: "Clients", description: "Create new client records." },
  { code: "CLIENTS_UPDATE", name: "Update Clients", module: "Clients", description: "Modify client information." },

  // Matters module permissions
  { code: "MATTERS_VIEW", name: "View Matters", module: "Matters", description: "View legal matter files." },
  { code: "MATTERS_CREATE", name: "Create Matters", module: "Matters", description: "Create new legal matters." },
  { code: "MATTERS_UPDATE", name: "Update Matters", module: "Matters", description: "Edit matter details and statuses." },

  // Practice Areas module permissions
  { code: "PRACTICE_AREAS_VIEW", name: "View Practice Areas", module: "Practice Areas", description: "View firm practice areas." },
  { code: "PRACTICE_AREAS_MANAGE", name: "Manage Practice Areas", module: "Practice Areas", description: "Create, update, and delete firm practice areas." },

  // Documents module permissions
  { code: "DOCUMENTS_UPLOAD", name: "Upload Documents", module: "Documents", description: "Upload files to legal matters." },

  // Billing module permissions
  { code: "TIME_ENTRIES_CREATE", name: "Create Time Entries", module: "Billing", description: "Record billable time entries." },
  { code: "INVOICES_APPROVE", name: "Approve Invoices", module: "Billing", description: "Review and approve customer invoices." },

  // Roles & Permissions module permissions
  { code: "ROLES_VIEW", name: "View Roles", module: "Roles", description: "View system and custom roles/permissions." },
  { code: "ROLES_CREATE", name: "Create Roles", module: "Roles", description: "Create custom roles." },
  { code: "ROLES_UPDATE", name: "Update Roles", module: "Roles", description: "Modify custom role details or permissions." },
  { code: "ROLES_DELETE", name: "Delete Roles", module: "Roles", description: "Delete custom roles." },
  { code: "ROLES_ASSIGN", name: "Assign Roles", module: "Roles", description: "Assign roles to users." },
  { code: "PERMISSIONS_ASSIGN", name: "Assign Permissions", module: "Roles", description: "Assign permissions to custom roles." },

  // Firm Management module permissions
  { code: "FIRM_VIEW", name: "View Firm Settings", module: "Firm", description: "View firm details and configuration." },
  { code: "FIRM_UPDATE", name: "Update Firm Settings", module: "Firm", description: "Modify firm details, branding, settings, and billing defaults." },

  // Intake module permissions
  { code: "INTAKES_VIEW", name: "View Intakes", module: "Intake", description: "View list and details of intakes." },
  { code: "INTAKES_CREATE", name: "Create Intakes", module: "Intake", description: "Capture prospective client enquiries." },
  { code: "INTAKES_UPDATE", name: "Update Intakes", module: "Intake", description: "Update unconverted intakes, notes, and attachments." },
  { code: "INTAKES_ASSIGN", name: "Assign Intakes", module: "Intake", description: "Delegate intakes to staff members." },
  { code: "INTAKES_CONVERT", name: "Convert Intakes", module: "Intake", description: "Convert qualified intakes to leads." },

  // Lead module permissions
  { code: "LEADS_VIEW", name: "View Leads", module: "Lead", description: "View list and details of leads." },
  { code: "LEADS_CREATE", name: "Create Leads", module: "Lead", description: "Create leads manually." },
  { code: "LEADS_UPDATE", name: "Update Leads", module: "Lead", description: "Update unconverted leads, notes, and attachments." },
  { code: "LEADS_ASSIGN", name: "Assign Leads", module: "Lead", description: "Delegate lead ownership." },
  { code: "LEADS_CONVERT", name: "Convert Leads", module: "Lead", description: "Convert qualified leads to clients." },

  // Conflict Check module permissions
  { code: "CONFLICT_VIEW", name: "View Conflict Checks", module: "Conflict Check", description: "View list and details of conflict checks." },
  { code: "CONFLICT_RUN", name: "Execute Conflict Checks", module: "Conflict Check", description: "Run conflict checks and ad-hoc searches." },
  { code: "CONFLICT_REVIEW", name: "Review Conflict Checks", module: "Conflict Check", description: "Record final attorney conflict review decisions." },
];

export interface SystemRoleDef {
  name: string;
  description: string;
  permissions: string[]; // Codes of permissions assigned by default
}

export const SYSTEM_ROLES: SystemRoleDef[] = [
  {
    name: "Firm Owner",
    description: "Full ownership and control of the firm, including billing and user roles.",
    permissions: SYSTEM_PERMISSIONS.map((p) => p.code),
  },
  {
    name: "Firm Administrator",
    description: "Administrative management of the firm, users, settings, and billing.",
    permissions: SYSTEM_PERMISSIONS.map((p) => p.code),
  },
  {
    name: "Attorney",
    description: "Legal professionals with client, matter, and billing creation access.",
    permissions: [
      "USERS_VIEW",
      "CLIENTS_VIEW",
      "CLIENTS_CREATE",
      "CLIENTS_UPDATE",
      "MATTERS_VIEW",
      "MATTERS_CREATE",
      "MATTERS_UPDATE",
      "PRACTICE_AREAS_VIEW",
      "DOCUMENTS_UPLOAD",
      "TIME_ENTRIES_CREATE",
      "FIRM_VIEW",
      "INTAKES_VIEW",
      "INTAKES_CREATE",
      "INTAKES_UPDATE",
      "INTAKES_ASSIGN",
      "INTAKES_CONVERT",
      "LEADS_VIEW",
      "LEADS_CREATE",
      "LEADS_UPDATE",
      "LEADS_ASSIGN",
      "LEADS_CONVERT",
      "CONFLICT_VIEW",
      "CONFLICT_RUN",
      "CONFLICT_REVIEW",
    ],
  },
  {
    name: "Paralegal",
    description: "Legal support staff with client, matter view and document upload access.",
    permissions: [
      "USERS_VIEW",
      "CLIENTS_VIEW",
      "MATTERS_VIEW",
      "PRACTICE_AREAS_VIEW",
      "DOCUMENTS_UPLOAD",
      "TIME_ENTRIES_CREATE",
      "FIRM_VIEW",
      "INTAKES_VIEW",
      "INTAKES_CREATE",
      "INTAKES_UPDATE",
      "LEADS_VIEW",
      "LEADS_CREATE",
      "LEADS_UPDATE",
      "CONFLICT_VIEW",
      "CONFLICT_RUN",
    ],
  },
  {
    name: "Staff",
    description: "General staff with basic viewing privileges.",
    permissions: [
      "USERS_VIEW",
      "CLIENTS_VIEW",
      "MATTERS_VIEW",
      "PRACTICE_AREAS_VIEW",
      "DOCUMENTS_UPLOAD",
      "FIRM_VIEW",
      "INTAKES_VIEW",
      "INTAKES_CREATE",
      "LEADS_VIEW",
      "LEADS_CREATE",
      "CONFLICT_VIEW",
      "CONFLICT_RUN",
    ],
  },
];
