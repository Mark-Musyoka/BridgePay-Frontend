'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Account, LoginRequest, RegisterRequest, User } from '@/types';
import { api, ApiError } from '@/lib/api';
import {
  getClientToken,
  getStoredUser,
  removeClientToken,
  removeStoredUser,
  setClientToken,
  setStoredUser,
} from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  account: Account | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest | { email: string; password: string }) => Promise<void>;
  registerUser: (data: RegisterRequest) => Promise<void>;
  demoLogin: (role?: 'user' | 'admin') => Promise<void>;
  logout: () => void;
  refreshAccount: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  const refreshAccount = useCallback(async () => {
    const currentToken = token || getClientToken();
    if (!currentToken) return;

    try {
      const acc = await api.getAccount(currentToken);
      setAccount(acc);
    } catch (err) {
      console.warn('Could not refresh account:', err);
    }
  }, [token]);

  const refreshUser = useCallback(async () => {
    const currentToken = token || getClientToken();
    if (!currentToken) return;

    try {
      const u = await api.getMe(currentToken);
      setUser(u);
      setStoredUser(u);
    } catch (err) {
      console.warn('Could not refresh user:', err);
    }
  }, [token]);

  // Initial session hydration
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      const savedToken = getClientToken();
      const savedUser = getStoredUser();

      if (savedToken) {
        setToken(savedToken);
        if (savedUser) {
          setUser(savedUser);
        }
        try {
          const [u, acc] = await Promise.allSettled([
            api.getMe(savedToken),
            api.getAccount(savedToken),
          ]);
          if (u.status === 'fulfilled') {
            setUser(u.value);
            setStoredUser(u.value);
          }
          if (acc.status === 'fulfilled') {
            setAccount(acc.value);
          }
        } catch {
          // Token might be expired or mock
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginRequest | { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const res = await api.login(credentials);
      setToken(res.access_token);
      setClientToken(res.access_token);

      // Try setting cookie via route handler as well
      fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: res.access_token }),
      }).catch(() => {});

      let fetchedUser: User;
      if (res.user) {
        fetchedUser = res.user;
      } else {
        fetchedUser = await api.getMe(res.access_token);
      }

      setUser(fetchedUser);
      setStoredUser(fetchedUser);

      // Fetch user account
      try {
        const acc = await api.getAccount(res.access_token);
        setAccount(acc);
      } catch {
        setAccount({
          id: 'acc_demo_882',
          balance: '4250.00',
          currency: 'USD',
          created_at: new Date().toISOString(),
        });
      }

      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (role: 'user' | 'admin' = 'user') => {
    setIsLoading(true);
    try {
      const demoEmail = role === 'admin' ? 'mark@bridgepay.dev' : 'sarah.doe@example.com';
      await login({ email: demoEmail, password: 'Password123!' });
    } finally {
      setIsLoading(false);
    }
  };

  const registerUser = async (data: RegisterRequest) => {
    setIsLoading(true);
    try {
      await api.register(data);
      // Auto-login after registration
      await login({ email: data.email, password: data.password });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setAccount(null);
    removeClientToken();
    removeStoredUser();

    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        account,
        token,
        isLoading,
        isAuthenticated: !!token,
        login,
        registerUser,
        demoLogin,
        logout,
        refreshAccount,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
