import { apiClient } from './client';
import type { Quote, QuoteFilters, QuotePayload } from '../types';

export const getQuotes = async (filters?: QuoteFilters): Promise<Quote[]> => {
  const { data } = await apiClient.get<Quote[]>('/quotes', { params: filters });
  return data;
};

export const getQuote = async (id: string): Promise<Quote> => {
  const { data } = await apiClient.get<Quote>(`/quotes/${id}`);
  return data;
};

export const createQuote = async (jobId: string, payload: QuotePayload): Promise<Quote> => {
  const { data } = await apiClient.post<Quote>(`/jobs/${jobId}/quotes`, payload);
  return data;
};

export const updateQuote = async (id: string, payload: Partial<QuotePayload>): Promise<Quote> => {
  const { data } = await apiClient.put<Quote>(`/quotes/${id}`, payload);
  return data;
};

