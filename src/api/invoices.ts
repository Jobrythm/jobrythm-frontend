import { apiClient } from './client';
import type { Invoice, InvoiceFilters, InvoicePayload } from '../types';

export const getInvoices = async (filters?: InvoiceFilters): Promise<Invoice[]> => {
  const { data } = await apiClient.get<Invoice[]>('/invoices', { params: filters });
  return data;
};

export const getInvoice = async (id: string): Promise<Invoice> => {
  const { data } = await apiClient.get<Invoice>(`/invoices/${id}`);
  return data;
};

export const createInvoice = async (jobId: string, payload: InvoicePayload): Promise<Invoice> => {
  const { data } = await apiClient.post<Invoice>(`/jobs/${jobId}/invoices`, payload);
  return data;
};

export const updateInvoice = async (id: string, payload: Partial<InvoicePayload>): Promise<Invoice> => {
  const { data } = await apiClient.put<Invoice>(`/invoices/${id}`, payload);
  return data;
};

