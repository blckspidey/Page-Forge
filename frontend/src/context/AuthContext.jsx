import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // true while we check session on mount

  // ─── Fetch current user on mount ──────────────────────────────────────────
  const fetchMe = useCallback(async () => {
    try {
      const res = await api.get('/api/auth/me');
      setUser(res.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  // ─── Register ────────────────────────────────────────────────────────────
  const register = async ({ name, email, password }) => {
    const res = await api.post('/api/auth/register', { name, email, password });
    setUser(res.data.user);
    return res.data;
  };

  // ─── Login ───────────────────────────────────────────────────────────────
  const login = async ({ email, password }) => {
    const res = await api.post('/api/auth/login', { email, password });
    setUser(res.data.user);
    return res.data;
  };

  // ─── Logout ──────────────────────────────────────────────────────────────
  const logout = async () => {
    await api.post('/api/auth/logout');
    setUser(null);
  };

  // ─── Google OAuth ────────────────────────────────────────────────────────
  const loginWithGoogle = () => {
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    window.location.href = `${API_BASE}/api/auth/google`;
  };

  // Called from /auth/callback page after Google redirect
  const handleOAuthCallback = async () => {
    await fetchMe();
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, loginWithGoogle, handleOAuthCallback }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
