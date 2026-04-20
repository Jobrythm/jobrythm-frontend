import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getInvoice, getInvoices, updateInvoice } from '../../../api/invoices';
import type { InvoiceFilters, InvoicePayload } from '../../../types';

export const invoicesQueryKey = ['invoices'] as const;

export const useInvoices = (filters?: InvoiceFilters) => {
  return useQuery({
    queryKey: [...invoicesQueryKey, filters],
    queryFn: () => getInvoices(filters),
  });
};

export const useInvoice = (id?: string) => {
  return useQuery({
    queryKey: [...invoicesQueryKey, id],
    queryFn: () => getInvoice(id as string),
    enabled: Boolean(id),
  });
};

export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<InvoicePayload> }) => updateInvoice(id, payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: invoicesQueryKey });
      void queryClient.invalidateQueries({ queryKey: [...invoicesQueryKey, variables.id] });
    },
  });
};

