import axios, { type AxiosError } from 'axios';

export const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError<{ success?: boolean; error?: { message?: string; code?: string } }>) => {
    const customMessage =
      error.response?.data?.error?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(customMessage));
  }
);

export default apiClient;

