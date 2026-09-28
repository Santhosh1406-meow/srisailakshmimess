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
  const primaryBase = getAuthApiBase();
  // Candidate bases: direct Render URL and relative /api proxy
  const candidateBases = primaryBase === RENDER_API
    ? [RENDER_API, '/api']
    : [primaryBase, RENDER_API];

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers || {})
  };

  let lastError = null;

  for (const base of candidateBases) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const url = `${base}${path}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);

        const res = await fetch(url, { ...options, headers, signal: controller.signal });
        clearTimeout(timeoutId);

        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const json = await res.json();
          if (!res.ok) {
            const msg = json.errors
              ? (Array.isArray(json.errors) ? json.errors.join(' ') : json.errors)
              : (json.message || `Request failed (${res.status})`);
            const err = new Error(msg);
            err.status = res.status;
            throw err;
          }
          return json;
        }
      } catch (err) {
        lastError = err;
        // If HTTP 400/401/403/422 status (e.g. invalid credentials, user not found), don't retry - throw immediately
        if (err.status && err.status >= 400 && err.status < 500) {
          throw err;
        }
        if (attempt < 2) {
          await new Promise((r) => setTimeout(r, 1200));
        }
      }
    }
  }

  if (lastError) {
    if (lastError.message?.includes('Failed to fetch') || lastError.name === 'AbortError' || lastError.name === 'TypeError') {
      throw new Error('Backend server is waking up or temporarily unreachable. Please wait 15 seconds and try again.');
    }
    throw lastError;
  }
  throw new Error('Server connection error. Please try again.');
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('ssl_auth_token'));
  const [loading, setLoading] = useState(true);

  // Warm up Render backend as soon as app loads
  useEffect(() => {
    fetch('https://srisailakshmimess.onrender.com/api/health', { method: 'GET' }).catch(() => {});
  }, []);

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

  const loginWithGoogle = useCallback(async (credential) => {
    const json = await authFetch('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential })
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
    <AuthContext.Provider value={{ user, token, loading, login, loginWithGoogle, register, logout, getAuthHeaders, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
