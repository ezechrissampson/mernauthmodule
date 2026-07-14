import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/authApi.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const { data } = await authApi.getMe();
      setUser(data.data.user);
      setPermissions(data.data.permissions || []);
    } catch {
      setUser(null);
      setPermissions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();

    const handleSessionExpired = () => {
      setUser(null);
      setPermissions([]);
    };
    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => window.removeEventListener('auth:session-expired', handleSessionExpired);
  }, [fetchCurrentUser]);

  const login = useCallback(
    async (identifier, password, rememberMe) => {
      const { data } = await authApi.login({ identifier, password, rememberMe });
      setUser(data.data.user);
      // The login response doesn't include permissions, so fetch them once right after —
      // keeps the login payload small and permissions always sourced from one place (getMe).
      await fetchCurrentUser();
      return data.data;
    },
    [fetchCurrentUser]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setPermissions([]);
    }
  }, []);

  // UI convenience only — every actual permission decision is re-checked server-side on
  // each request. These just drive which tabs/buttons render for a smoother experience.
  const can = useCallback((key) => permissions.includes(key), [permissions]);
  const canAny = useCallback((keys) => keys.some((k) => permissions.includes(k)), [permissions]);

  const value = useMemo(
    () => ({
      user,
      setUser,
      permissions,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
      refreshUser: fetchCurrentUser,
      can,
      canAny,
    }),
    [user, permissions, isLoading, login, logout, fetchCurrentUser, can, canAny]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
