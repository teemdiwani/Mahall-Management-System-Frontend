import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserRole } from '../types';
import { authApi, type AuthMeResponse } from '../api/authApi';

interface AuthContextType {
  user: any | null;
  member: any | null;
  family: any | null;
  role: UserRole | null;
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  googleLogin: (credential: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authData, setAuthData] = useState<AuthMeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const res = await authApi.getMe();
      if (res && res.data) {
        setAuthData(res.data);
      } else {
        setAuthData(null);
      }
    } catch {
      setAuthData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const res = await authApi.login(email, password);
      if (res.data?.token) {
        localStorage.setItem('auth_token', res.data.token);
      }
      await fetchCurrentUser();
      return true;
    } catch {
      setIsLoading(false);
      return false;
    }
  };

  const googleLogin = async (credential: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const res = await authApi.googleAuth(credential);
      if (res.data?.token) {
        localStorage.setItem('auth_token', res.data.token);
      }
      await fetchCurrentUser();
      return true;
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      localStorage.removeItem('auth_token');
      setAuthData(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: authData?.user || null,
        member: authData?.member || null,
        family: authData?.family || null,
        role: authData?.role || null,
        permissions: authData?.permissions || [],
        isAuthenticated: !!authData?.user,
        isLoading,
        login,
        googleLogin,
        logout,
        refreshMe: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
