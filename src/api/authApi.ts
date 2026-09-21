import { apiClient } from './apiClient';
import type { UserRole } from '../types';

export interface AuthMeResponse {
  user: {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
    isActive: boolean;
  };
  member?: {
    _id: string;
    name: string;
    dateOfBirth: string;
    gender: string;
    phone?: string;
    email?: string;
    familyId?: string;
    relationship: string;
  };
  family?: {
    _id: string;
    familyCode: string;
    name: string;
    address: string;
    area: string;
    phone: string;
  };
  role: UserRole;
  permissions: string[];
}

export const authApi = {
  login: async (email: string, password: string): Promise<{ data: { user: any; token: string } }> => {
    return apiClient.post('/auth/login', { email, password });
  },

  register: async (data: { name: string; email: string; password: string; phone?: string }): Promise<{ data: { user: any; token: string } }> => {
    return apiClient.post('/auth/register', data);
  },

  googleAuth: async (credential: string): Promise<{ data: { user: any; token: string } }> => {
    return apiClient.post('/auth/google', { credential });
  },

  getMe: async (): Promise<{ data: AuthMeResponse }> => {
    return apiClient.get('/auth/me');
  },

  logout: async (): Promise<{ data: { loggedOut: boolean } }> => {
    return apiClient.post('/auth/logout');
  },
};
