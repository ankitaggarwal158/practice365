import { httpClient, API_BASE_URL, PaginatedData } from "../../../services/http-client";
import { Invoice, InvoiceItem, InvoicePayment, CreateInvoiceDTO, UpdateInvoiceDTO, RecordPaymentDTO } from "../types/invoice.types";

export interface InvoiceFilters {
  page?: number;
  limit?: number;
  clientId?: string;
  matterId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  searchText?: string;
}

export const invoiceApi = {
  listInvoices: async (filters: InvoiceFilters): Promise<PaginatedData<Invoice>> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, String(value));
      }
    });
    return httpClient.getPaginated<Invoice>(`/invoices?${params.toString()}`);
  },

  getInvoice: async (id: string): Promise<Invoice & { items: InvoiceItem[] }> => {
    return httpClient.get<Invoice & { items: InvoiceItem[] }>(`/invoices/${id}`);
  },

  createInvoice: async (data: CreateInvoiceDTO): Promise<Invoice & { items: InvoiceItem[] }> => {
    return httpClient.post<Invoice & { items: InvoiceItem[] }>("/invoices", data);
  },

  updateInvoice: async (id: string, data: UpdateInvoiceDTO): Promise<Invoice & { items: InvoiceItem[] }> => {
    return httpClient.patch<Invoice & { items: InvoiceItem[] }>(`/invoices/${id}`, data);
  },

  issueInvoice: async (id: string): Promise<Invoice> => {
    return httpClient.post<Invoice>(`/invoices/${id}/issue`, {});
  },

  cancelInvoice: async (id: string): Promise<Invoice> => {
    return httpClient.post<Invoice>(`/invoices/${id}/cancel`, {});
  },

  deleteInvoice: async (id: string): Promise<void> => {
    await httpClient.delete(`/invoices/${id}`);
  },

  recordPayment: async (id: string, data: RecordPaymentDTO): Promise<InvoicePayment> => {
    return httpClient.post<InvoicePayment>(`/invoices/${id}/payment`, data);
  },

  getInvoicePayments: async (id: string): Promise<InvoicePayment[]> => {
    return httpClient.get<InvoicePayment[]>(`/invoices/${id}/payments`);
  },

  downloadPDF: async (id: string, invoiceNumber: string): Promise<void> => {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${API_BASE_URL}/invoices/${id}/pdf`, {
      method: "GET",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
    if (!response.ok) {
      throw new Error("Failed to download PDF");
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${invoiceNumber}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
