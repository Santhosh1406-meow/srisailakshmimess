import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

// Always use the Render backend directly for auth to avoid Netlify SPA HTML intercept
const RENDER_API = 'https://srisailakshmimess.onrender.com/api';
const LOCAL_API = import.meta.env.VITE_API_URL || '/api';

function getAuthApiBase() {
  // On Netlify, Netlify's redirect rules may serve HTML for /api/* paths
  // so we always point auth directly at the Render backend
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('netlify.app')) {
    return RENDER_API;
  }
  return LOCAL_API;
}

async function authFetch(path, options = {}) {
  const base = getAuthApiBase();
  const url = `${base}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers || {})
  };

  const res = await fetch(url, { ...options, headers });
  const contentType = res.headers.get('content-type') || '';

  // If we get HTML back (e.g. Netlify SPA fallback), retry directly on Render
  if (!contentType.includes('application/json')) {
    if (base !== RENDER_API) {
      const retryRes = await fetch(`${RENDER_API}${path}`, { ...options, headers });
      const retryType = retryRes.headers.get('content-type') || '';
      if (!retryType.includes('application/json')) {
        throw new Error('Server is unavailable. Please try again later.');
      }
      const retryJson = await retryRes.json();
      if (!retryRes.ok) throw new Error(retryJson.message || `Request failed (${retryRes.status})`);
      return retryJson;
    }
    throw new Error('Server is unavailable. Please try again later.');
  }

  const json = await res.json();
  if (!res.ok) {
    const msg = json.errors
      ? (Array.isArray(json.errors) ? json.errors.join(' ') : json.errors)
      : (json.message || `Request failed (${res.status})`);
    throw new Error(msg);
  }
  return json;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('ssl_auth_token'));
  const [loading, setLoading] = useState(true);

  // On mount, verify token with server and restore user
  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('ssl_auth_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const json = await authFetch('/auth/me', {
          headers: { Authorization: `Bearer ${storedToken}` }
        });
        setUser(json.user);
        setToken(storedToken);
        localStorage.setItem('ssl_user', JSON.stringify(json.user));
      } catch (_) {
        // Token invalid/expired OR network error — try cached user (read-only, no password)
        try {
          const cachedUser = JSON.parse(localStorage.getItem('ssl_user') || 'null');
          if (cachedUser) setUser(cachedUser);
        } catch (_) {}
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

    const json = await authFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    localStorage.setItem('ssl_auth_token', json.token);
    localStorage.setItem('ssl_user', JSON.stringify(json.user));
    setToken(json.token);
    setUser(json.user);
    return json.user;
  }, []);

  const register = useCallback(async ({ name, email, phone, password }, autoLogin = false) => {
    const json = await authFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, phone, password })
    });

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
