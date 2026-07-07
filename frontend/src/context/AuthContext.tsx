import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { loginRequest, logoutRequest, registerRequest } from '../api/auth.api';
import { SESSION_EXPIRED_EVENT } from '../api/client';
import { tokenStore } from '../api/token-store.api'
import { User } from '../types';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const USER_STORAGE_KEY = 'pantry.user';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Rehydrate the session on first load: if we have a stored user + access
  // token, trust it until a request actually proves the token is invalid
  // (the apiClient interceptor handles refresh/expiry transparently).
  useEffect(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    const hasToken = Boolean(tokenStore.getAccessToken());
    if (storedUser && hasToken) {
      setUser(JSON.parse(storedUser));
    }
    setIsInitializing(false);
  }, []);

  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null);
      localStorage.removeItem(USER_STORAGE_KEY);
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
  }, []);

  const persistSession = (nextUser: User, accessToken: string, refreshToken: string) => {
    tokenStore.setTokens(accessToken, refreshToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginRequest({ email, password });
    persistSession(result.user, result.accessToken, result.refreshToken);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const result = await registerRequest({ name, email, password });
    persistSession(result.user, result.accessToken, result.refreshToken);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      tokenStore.clear();
      localStorage.removeItem(USER_STORAGE_KEY);
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isInitializing,
      login,
      register,
      logout,
    }),
    [user, isInitializing, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
