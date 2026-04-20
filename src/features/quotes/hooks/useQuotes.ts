import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getQuote, getQuotes, updateQuote } from '../../../api/quotes';
import type { QuoteFilters, QuotePayload } from '../../../types';

export const quotesQueryKey = ['quotes'] as const;

export const useQuotes = (filters?: QuoteFilters) => {
  return useQuery({
    queryKey: [...quotesQueryKey, filters],
    queryFn: () => getQuotes(filters),
  });
};

export const useQuote = (id?: string) => {
  return useQuery({
    queryKey: [...quotesQueryKey, id],
    queryFn: () => getQuote(id as string),
    enabled: Boolean(id),
  });
};

export const useUpdateQuote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<QuotePayload> }) => updateQuote(id, payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: quotesQueryKey });
      void queryClient.invalidateQueries({ queryKey: [...quotesQueryKey, variables.id] });
    },
  });
};

