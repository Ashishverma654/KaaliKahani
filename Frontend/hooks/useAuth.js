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
  const [loading, setLoading] = useState(true);
  const [isSettled, setIsSettled] = useState(false);

  const refreshUser = async () => {
    try {
      const data = await authService.getMe();
      setUser(data);
    } catch (err) {
      // 401 is normal for guest users, silenlty ignore and set user to null
      setUser(null);
    } finally {
      setLoading(false);
      setIsSettled(true);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    setUser(data.user);
    setIsSettled(true);
    return data;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setIsSettled(true);
  };

  const value = React.useMemo(() => ({
    user,
    loading,
    isSettled,
    isLoggedIn: !!user,
    isAdmin: user?.role === 'admin',
    login,
    logout,
    refreshUser
  }), [user, loading, isSettled]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
