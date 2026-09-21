import { apiClient } from './apiClient';

export const dashboardApi = {
  getAdminDashboard: async (): Promise<{ data: any }> => {
    return apiClient.get('/dashboard/admin');
  },

  getDashboardStats: async (): Promise<{ data: any }> => {
    return apiClient.get('/dashboard/stats');
  },

  getDashboardCharts: async (): Promise<{ data: any }> => {
    return apiClient.get('/dashboard/charts');
  },

  getMemberDashboard: async (): Promise<{ data: any }> => {
    return apiClient.get('/dashboard/member');
  },

  getTreasurerDashboard: async (): Promise<{ data: any }> => {
    return apiClient.get('/dashboard/treasurer');
  },

  getSecretaryDashboard: async (): Promise<{ data: any }> => {
    return apiClient.get('/dashboard/secretary');
  },

  getWelfareDashboard: async (): Promise<{ data: any }> => {
    return apiClient.get('/dashboard/welfare');
  },

  getMadrasaDashboard: async (): Promise<{ data: any }> => {
    return apiClient.get('/dashboard/madrasa');
  },

  getImamDashboard: async (): Promise<{ data: any }> => {
    return apiClient.get('/dashboard/imam');
  },
};
