import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('ssl_auth_token'));
  const [loading, setLoading] = useState(true);

  // On mount, verify token with server and load user
  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('ssl_auth_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
            'Accept': 'application/json'
          }
        });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const json = await res.json();
          setUser(json.user);
          setToken(storedToken);
          localStorage.setItem('ssl_user', JSON.stringify(json.user));
        } else {
          // Token invalid or expired — clear everything
          localStorage.removeItem('ssl_auth_token');
          localStorage.removeItem('ssl_user');
          setToken(null);
          setUser(null);
        }
      } catch (_) {
        // Network error — try to restore from cached user (read-only, no sensitive data)
        try {
          const cachedUser = JSON.parse(localStorage.getItem('ssl_user') || 'null');
          if (cachedUser) setUser(cachedUser);
        } catch (_) { }
      } finally {
        setLoading(false);
      }
    };
    verifyToken();
  }, []);

  const login = useCallback(async (arg1, arg2) => {
    let email, password;
    if (typeof arg1 === 'object' && arg1 !== null) {
      email = (arg1.email || '').trim().toLowerCase();
      password = arg1.password;
    } else {
      email = (arg1 || '').trim().toLowerCase();
      password = arg2;
    }

    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error('Server is unavailable. Please try again later.');
    }

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Invalid email or password.');
    }

    localStorage.setItem('ssl_auth_token', json.token);
    localStorage.setItem('ssl_user', JSON.stringify(json.user));
    setToken(json.token);
    setUser(json.user);
    return json.user;
  }, []);

  const register = useCallback(async ({ name, email, phone, password }, autoLogin = false) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ name, email, phone, password })
    });

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error('Server is unavailable. Please try again later.');
    }

    const json = await res.json();
    if (!res.ok) {
      const msg = json.errors
        ? (Array.isArray(json.errors) ? json.errors.join(' ') : json.errors)
        : (json.message || 'Registration failed.');
      throw new Error(msg);
    }

    if (autoLogin) {
      localStorage.setItem('ssl_auth_token', json.token);
      localStorage.setItem('ssl_user', JSON.stringify(json.user));
      setToken(json.token);
      setUser(json.user);
    }
    return json.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('ssl_auth_token');
    localStorage.removeItem('ssl_user');
    setToken(null);
    setUser(null);
  }, []);

  const getAuthHeaders = useCallback(() => {
    const t = localStorage.getItem('ssl_auth_token');
    return t ? { Authorization: `Bearer ${t}` } : {};
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, getAuthHeaders, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
