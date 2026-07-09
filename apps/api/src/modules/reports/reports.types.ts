export type ReportType = "matters" | "clients" | "time" | "invoices" | "revenue" | "user-activity";

export interface MatterReportItem {
  id: string;
  matterNumber: string;
  title: string;
  status: string;
  openedDate: string;
  billingMethod: string;
  estimatedValue?: number;
  clientId: string;
  clientName: string;
  responsibleAttorneyId: string;
  responsibleAttorneyName: string;
  practiceAreaId: string;
  practiceAreaName: string;
}

export interface MatterReportSummary {
  totalCount: number;
  statusBreakdown: Record<string, number>;
  billingMethodBreakdown: Record<string, number>;
  totalEstimatedValue: number;
}

export interface ClientReportItem {
  id: string;
  clientNumber: string;
  clientType: "INDIVIDUAL" | "ORGANIZATION";
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  phone: string;
  createdAt: string;
}

export interface ClientReportSummary {
  totalCount: number;
  statusBreakdown: Record<string, number>;
  clientTypeBreakdown: Record<string, number>;
}

export interface TimeReportItem {
  id: string;
  durationMinutes: number;
  hourlyRate: number;
  billableAmount: number;
  billingType: "BILLABLE" | "NON_BILLABLE";
  date: string;
  description: string;
  isBilled: boolean;
  userId: string;
  userName: string;
  matterId?: string;
  matterNumber?: string;
  matterTitle?: string;
  clientId?: string;
  clientName?: string;
}

export interface TimeReportSummary {
  totalRecordedMinutes: number;
  totalBillableMinutes: number;
  totalNonBillableMinutes: number;
  totalBillableAmount: number;
  averageHourlyRate: number;
}

export interface InvoiceReportItem {
  id: string;
  invoiceNumber: string;
  status: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  clientId: string;
  clientName: string;
  matterId?: string;
  matterTitle?: string;
}

export interface InvoiceReportSummary {
  totalInvoiced: number;
  totalPaid: number;
  totalBalanceDue: number;
  statusBreakdown: Record<string, number>;
}

export interface RevenueReportItem {
  id: string;
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  referenceNumber?: string;
  invoiceId: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  matterId?: string;
  matterTitle?: string;
}

export interface RevenueReportSummary {
  totalRevenue: number;
  paymentMethodBreakdown: Record<string, number>;
}

export interface UserActivityReportItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  module: string;
  action: string;
  entityType?: string;
  entityId?: string;
  createdAt: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface UserActivityReportSummary {
  totalCount: number;
  moduleBreakdown: Record<string, number>;
  actionBreakdown: Record<string, number>;
  userBreakdown: Record<string, number>;
}
