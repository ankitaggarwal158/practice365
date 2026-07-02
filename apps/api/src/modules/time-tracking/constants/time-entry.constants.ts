export enum TimerStatus {
  RUNNING = "RUNNING",
  PAUSED = "PAUSED",
  STOPPED = "STOPPED",
  MANUAL = "MANUAL",
}

export enum BillingType {
  BILLABLE = "BILLABLE",
  NON_BILLABLE = "NON_BILLABLE",
}

export const TIME_TRACKING_CONSTANTS = {
  DEFAULT_HOURLY_RATE: 150.00, // Fallback rate until FirmSettings UI handles it
};
