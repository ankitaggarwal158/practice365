export enum TimerStatus {
  RUNNING = "RUNNING",
  PAUSED = "PAUSED",
  STOPPED = "STOPPED",
  MANUAL = "MANUAL",
}

export enum BillingType {
  BILLABLE = "BILLABLE",
  NON_BILLABLE = "NON_BILLABLE",
  NO_CHARGE = "NO_CHARGE",
}

export interface TimeEntry {
  _id: string;
  firmId: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  matterId?: {
    _id: string;
    title: string;
  };
  clientId?: {
    _id: string;
    firstName: string;
    lastName: string;
    name?: string;
  };
  
  description?: string;
  date: string;
  
  durationMinutes: number;
  hourlyRate: number;
  billableAmount: number;
  
  billingType: BillingType;
  timerStatus: TimerStatus;
  
  timerStartedAt?: string;
  timerStoppedAt?: string;
  lastResumedAt?: string;
  accumulatedSeconds?: number;
  
  isBilled: boolean;
  
  createdAt: string;
  updatedAt: string;
}

export interface TimeEntryFormData {
  matterId?: string;
  clientId?: string;
  description?: string;
  date: string;
  durationMinutes: number;
  hourlyRate?: number;
  billingType: BillingType;
}
