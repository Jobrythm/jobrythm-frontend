import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createJob, deleteJob, getJob, getJobs, updateJob } from '../../../api/jobs';
import { createLineItem, deleteLineItem, updateLineItem } from '../../../api/lineItems';
import { createQuote } from '../../../api/quotes';
import { createInvoice } from '../../../api/invoices';
import type { InvoicePayload, JobFilters, JobPayload, LineItemPayload, QuotePayload } from '../../../types';

export const jobsQueryKey = ['jobs'] as const;

export const useJobs = (filters?: JobFilters) => {
  return useQuery({
    queryKey: [...jobsQueryKey, filters],
    queryFn: () => getJobs(filters),
  });
};

export const useJob = (id?: string) => {
  return useQuery({
    queryKey: [...jobsQueryKey, id],
    queryFn: () => getJob(id as string),
    enabled: Boolean(id),
  });
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: JobPayload) => createJob(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: jobsQueryKey });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useUpdateJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<JobPayload> }) => updateJob(id, payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: jobsQueryKey });
      void queryClient.invalidateQueries({ queryKey: [...jobsQueryKey, variables.id] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteJob(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: jobsQueryKey });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useCreateLineItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, payload }: { jobId: string; payload: LineItemPayload }) => createLineItem(jobId, payload),
    onSuccess: (item) => {
      void queryClient.invalidateQueries({ queryKey: jobsQueryKey });
      void queryClient.invalidateQueries({ queryKey: [...jobsQueryKey, item.jobId] });
    },
  });
};

export const useUpdateLineItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<LineItemPayload> }) => updateLineItem(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: jobsQueryKey });
    },
  });
};

export const useDeleteLineItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteLineItem(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: jobsQueryKey });
    },
  });
};

export const useGenerateQuote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, payload }: { jobId: string; payload: QuotePayload }) => createQuote(jobId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['quotes'] });
      void queryClient.invalidateQueries({ queryKey: jobsQueryKey });
    },
  });
};

export const useGenerateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, payload }: { jobId: string; payload: InvoicePayload }) => createInvoice(jobId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['invoices'] });
      void queryClient.invalidateQueries({ queryKey: jobsQueryKey });
    },
  });
};

