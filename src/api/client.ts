import axios, { AxiosError } from 'axios';
import { useAuthStore } from '../store/authStore';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      window.location.href = '/login';
    }

    if (!error.response) {
      return Promise.reject(new Error('Network issue. Please check your connection and try again.'));
    }

    const message = error.response.data?.message ?? 'Something went wrong. Please try again.';
    return Promise.reject(new Error(message));
  },
);

