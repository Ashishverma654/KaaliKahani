// hooks/useAuth.js
"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext({
  user: null,
  loading: true,
  isSettled: false,
  isLoggedIn: false,
  isAdmin: false,
  login: async () => {},
  logout: async () => {},
  refreshUser: async () => {}
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('LOADING'); // 'LOADING' | 'AUTHENTICATED' | 'UNAUTHENTICATED'

  const refreshUser = async () => {
    try {
      const data = await Promise.race([
        authService.getMe(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Auth timeout')), 8000))
      ]);
      if (data) {
        setUser(data);
        setStatus('AUTHENTICATED');
      } else {
        setUser(null);
        setStatus('UNAUTHENTICATED');
      }
    } catch (err) {
      setUser(null);
      setStatus('UNAUTHENTICATED');
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    if (typeof window !== 'undefined') {
      if (data?.accessToken) localStorage.setItem('accessToken', data.accessToken);
      if (data?.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
    }
    setUser(data.user);
    setStatus('AUTHENTICATED');
    return data;
  };

  const logout = async () => {
    await authService.logout();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
    setUser(null);
    setStatus('UNAUTHENTICATED');
  };

  const value = React.useMemo(() => ({
    user,
    status,
    loading: status === 'LOADING',
    isSettled: status !== 'LOADING',
    isLoggedIn: status === 'AUTHENTICATED',
    isAdmin: status === 'AUTHENTICATED' && (user?.role === 'admin' || user?.role === 'superadmin'),
    login,
    logout,
    refreshUser
  }), [user, status]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
