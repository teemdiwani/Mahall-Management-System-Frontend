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

  getMemberDashboard: async (number?: string): Promise<{ data: any }> => {
    return apiClient.get('/dashboard/member', { params: number ? { number } : undefined });
  },

  linkFamilyByPhone: async (phone: string): Promise<{ data: any }> => {
    return apiClient.post('/dashboard/member/link-family', { phone });
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
