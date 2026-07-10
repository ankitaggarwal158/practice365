export enum BillingType {
  BILLABLE = "BILLABLE",
  NON_BILLABLE = "NON_BILLABLE",
}

export const FIXED_CHARGE_ERROR_MESSAGES = {
  NOT_FOUND: "Fixed charge record not found.",
  BILLED_READ_ONLY: "This fixed charge has been billed and is now read-only.",
};
