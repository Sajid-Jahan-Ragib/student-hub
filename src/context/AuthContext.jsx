import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';

export const AuthContext = createContext();

async function parseApiResponse(response) {
  const payload = await response.json().catch(() => ({}));
  return payload && typeof payload === 'object' ? payload : {};
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshAuthStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/admin/auth-status', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      const payload = await parseApiResponse(response);
      const authenticated = Boolean(payload?.authenticated);

      setIsAuthenticated(authenticated);
      setUser(authenticated ? payload?.user || null : null);
    } catch (error) {
      console.error('Failed to refresh auth status:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAuthStatus();
  }, [refreshAuthStatus]);

  const login = useCallback(async (email, password) => {
    try {
      const response = await fetch('/api/v1/admin/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const payload = await parseApiResponse(response);
      if (!response.ok || !payload?.authenticated) {
        const message = payload?.error?.message || 'Invalid email or password';
        return { success: false, error: message };
      }

      setIsAuthenticated(true);
      setUser(payload?.user || { email, loginTime: new Date().toISOString() });
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: 'Unable to login right now. Please try again.' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/v1/admin/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ isAuthenticated, user, loading, login, logout, refreshAuthStatus }),
    [isAuthenticated, user, loading, login, logout, refreshAuthStatus]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
