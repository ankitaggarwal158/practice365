export type ReportType = "matters" | "clients" | "time" | "invoices" | "revenue" | "user-activity";

export interface MatterReportFilters {
  status?: string;
  practiceAreaId?: string;
  responsibleAttorneyId?: string;
  clientId?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface ClientReportFilters {
  status?: string;
  clientType?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface TimeReportFilters {
  matterId?: string;
  userId?: string;
  billingType?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface InvoiceReportFilters {
  status?: string;
  clientId?: string;
  matterId?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface RevenueReportFilters {
  paymentMethod?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface UserActivityReportFilters {
  userId?: string;
  module?: string;
  action?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

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
