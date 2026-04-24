// hooks/useAuth.js
"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext({
  user: null,
  loading: true,
  isSettled: false,
  isLoggedIn: false,
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
        if (typeof window !== 'undefined') {
          localStorage.setItem('userCache', JSON.stringify(data));
        }
      } else {
        setUser(null);
        setStatus('UNAUTHENTICATED');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('userCache');
        }
      }
    } catch (err) {
      setUser(null);
      setStatus('UNAUTHENTICATED');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userCache');
      }
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      const cached = localStorage.getItem('userCache');
      if (token && cached) {
        try {
          const parsed = JSON.parse(cached);
          setUser(parsed);
          setStatus('AUTHENTICATED');
        } catch {
          localStorage.removeItem('userCache');
        }
      }
    }
    refreshUser();
  }, []);

  const login = async (credentials) => {
    const { endpoint, ...rest } = credentials;
    // Fetch user profile data map map map
    const data = await authService.login(rest, endpoint);
    if (typeof window !== 'undefined') {
      if (data?.accessToken) localStorage.setItem('accessToken', data.accessToken);
      if (data?.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
      if (data?.user) localStorage.setItem('userCache', JSON.stringify(data.user));
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
      localStorage.removeItem('userCache');
    }
    setUser(null);
    setStatus('UNAUTHENTICATED');
  };

  const value = React.useMemo(() => {
    const normalizeRole = (role) => {
      if (!role) return '';
      return String(role).toLowerCase().replace(/[^a-z]/g, '');
    };
    const role = normalizeRole(user?.role);

    return {
      user,
      status,
      loading: status === 'LOADING',
      isSettled: status !== 'LOADING',
      isLoggedIn: status === 'AUTHENTICATED',
      login,
      logout,
      refreshUser
    };
  }, [user, status]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
