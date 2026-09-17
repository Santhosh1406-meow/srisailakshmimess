import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Seeded demo accounts for instant access even during Render cold start or offline deployment
const DEMO_USERS = [
  {
    email: 'admin@srisailakshmimess.com',
    password: 'admin123',
    user: {
      id: 'USR-ADMIN-001',
      name: 'Mess Manager (Admin)',
      email: 'admin@srisailakshmimess.com',
      phone: '9876543210',
      role: 'admin'
    }
  },
  {
    email: 'delivery@srisailakshmimess.com',
    password: 'delivery123',
    user: {
      id: 'USR-DEL-001',
      name: 'Murugan (Delivery Partner)',
      email: 'delivery@srisailakshmimess.com',
      phone: '9444012345',
      role: 'delivery',
      vehicleNumber: 'TN59 AB 1234',
      isAvailable: true,
      totalDeliveries: 42
    }
  },
  {
    email: 'selvam@srisailakshmimess.com',
    password: 'delivery123',
    user: {
      id: 'USR-DEL-002',
      name: 'Selvam (Delivery Partner)',
      email: 'selvam@srisailakshmimess.com',
      phone: '9600098765',
      role: 'delivery',
      vehicleNumber: 'TN59 CD 5678',
      isAvailable: false,
      totalDeliveries: 18
    }
  },
  {
    email: 'customer@srisailakshmimess.com',
    password: 'customer123',
    user: {
      id: 'USR-CUST-001',
      name: 'Karthik Raja',
      email: 'customer@srisailakshmimess.com',
      phone: '9840123456',
      role: 'customer'
    }
  }
];

function getLocalUsers() {
  try {
    return JSON.parse(localStorage.getItem('ssl_local_users') || '[]');
  } catch (_) {
    return [];
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('ssl_auth_token'));
  const [loading, setLoading] = useState(true);

  // On mount, verify token and load user
  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('ssl_auth_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      // If stored token is a local demo token
      if (storedToken.startsWith('ssl_demo_token_')) {
        try {
          const cachedUser = JSON.parse(localStorage.getItem('ssl_demo_user') || 'null');
          if (cachedUser) {
            setUser(cachedUser);
            setToken(storedToken);
            setLoading(false);
            return;
          }
        } catch (_) {}
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
        } else {
          // If server returned HTML or unauthorized, fallback to cached user if available
          const cachedUser = JSON.parse(localStorage.getItem('ssl_demo_user') || 'null');
          if (cachedUser) {
            setUser(cachedUser);
          } else {
            localStorage.removeItem('ssl_auth_token');
            setToken(null);
            setUser(null);
          }
        }
      } catch (_) {
        // Network error — keep token & cached user
        try {
          const cachedUser = JSON.parse(localStorage.getItem('ssl_demo_user') || 'null');
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

    // Attempt live server authentication first
    let liveSuccess = false;
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.message || 'Invalid email or password.');
        }
        localStorage.setItem('ssl_auth_token', json.token);
        localStorage.setItem('ssl_demo_user', JSON.stringify(json.user));
        setToken(json.token);
        setUser(json.user);
        liveSuccess = true;
        return json.user;
      }
    } catch (err) {
      // If it's a 401/400 validation error with JSON from server, propagate it
      if (err.message && !err.message.includes('<!DOCTYPE') && !err.message.includes('fetch') && !err.message.includes('JSON')) {
        throw err;
      }
      console.info('[Auth] Live server unavailable or captured by Netlify SPA redirect. Checking demo & local credentials...');
    }

    if (liveSuccess) return;

    // Fallback: Check Demo Credentials
    const demo = DEMO_USERS.find((d) => d.email.toLowerCase() === email && d.password === password);
    if (demo) {
      const mockToken = `ssl_demo_token_${demo.user.role}_${Date.now()}`;
      localStorage.setItem('ssl_auth_token', mockToken);
      localStorage.setItem('ssl_demo_user', JSON.stringify(demo.user));
      setToken(mockToken);
      setUser(demo.user);
      return demo.user;
    }

    // Check Local Registered Users
    const localUsers = getLocalUsers();
    const matchedLocal = localUsers.find((u) => u.email.toLowerCase() === email && u.password === password);
    if (matchedLocal) {
      const mockToken = `ssl_demo_token_local_${Date.now()}`;
      const safeUser = { id: matchedLocal.id, name: matchedLocal.name, email: matchedLocal.email, phone: matchedLocal.phone, role: matchedLocal.role || 'customer' };
      localStorage.setItem('ssl_auth_token', mockToken);
      localStorage.setItem('ssl_demo_user', JSON.stringify(safeUser));
      setToken(mockToken);
      setUser(safeUser);
      return safeUser;
    }

    throw new Error('Invalid email or password. You can also use demo credentials: customer@srisailakshmimess.com / customer123 or admin@srisailakshmimess.com / admin123');
  }, []);

  const register = useCallback(async ({ name, email, phone, password }) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ name, email, phone, password })
      });

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const json = await res.json();
        if (!res.ok) {
          const msg = json.errors ? (Array.isArray(json.errors) ? json.errors.join(' ') : json.errors) : (json.message || 'Registration failed.');
          throw new Error(msg);
        }
        localStorage.setItem('ssl_auth_token', json.token);
        localStorage.setItem('ssl_demo_user', JSON.stringify(json.user));
        setToken(json.token);
        setUser(json.user);
        return json.user;
      }
    } catch (err) {
      if (err.message && !err.message.includes('<!DOCTYPE') && !err.message.includes('fetch') && !err.message.includes('JSON')) {
        throw err;
      }
      console.info('[Auth] Live server offline, saving new user locally.');
    }

    // Local Registration Fallback
    const localUsers = getLocalUsers();
    const cleanEmail = (email || '').trim().toLowerCase();
    if (localUsers.some((u) => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('An account with this email already exists.');
    }

    const newUser = {
      id: 'USR-LOCAL-' + Date.now(),
      name: name.trim(),
      email: cleanEmail,
      phone: (phone || '').trim(),
      role: 'customer'
    };

    localUsers.push({ ...newUser, password });
    try {
      localStorage.setItem('ssl_local_users', JSON.stringify(localUsers));
    } catch (_) {}

    const mockToken = `ssl_demo_token_local_${Date.now()}`;
    localStorage.setItem('ssl_auth_token', mockToken);
    localStorage.setItem('ssl_demo_user', JSON.stringify(newUser));
    setToken(mockToken);
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('ssl_auth_token');
    localStorage.removeItem('ssl_demo_user');
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
