import { apiClient } from './client';
import type { Job, JobFilters, JobPayload } from '../types';

export const getJobs = async (filters?: JobFilters): Promise<Job[]> => {
  const { data } = await apiClient.get<Job[]>('/jobs', { params: filters });
  return data;
};

export const getJob = async (id: string): Promise<Job> => {
  const { data } = await apiClient.get<Job>(`/jobs/${id}`);
  return data;
};

export const createJob = async (payload: JobPayload): Promise<Job> => {
  const { data } = await apiClient.post<Job>('/jobs', payload);
  return data;
};

export const updateJob = async (id: string, payload: Partial<JobPayload>): Promise<Job> => {
  const { data } = await apiClient.put<Job>(`/jobs/${id}`, payload);
  return data;
};

export const deleteJob = async (id: string): Promise<void> => {
  await apiClient.delete(`/jobs/${id}`);
};

