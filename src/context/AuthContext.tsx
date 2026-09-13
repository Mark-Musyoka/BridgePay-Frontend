"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Account, User } from "@/types";
import { register as apiRegister, ApiRequestError } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  account: Account | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  demoLogin: (role: "user" | "admin") => Promise<void>;
  registerUser: (data: { email: string; password: string; full_name: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccount: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Demo-mode credentials for the "1-click demo" login button. These are
// NOT a fake auth bypass — demoLogin calls the real login() below with
// these fixed credentials, going through the actual backend and getting
// a real JWT. For the button to work, these accounts must genuinely
// exist (registered + email-verified) in whatever database the app is
// pointed at; the admin one additionally needs
// `UPDATE users SET is_admin = true WHERE email = '...'` run directly,
// since there's no self-service way to become an admin (see
// BridgePay-Backend's README, Phase 6). If they don't exist, this
// correctly shows the same "Incorrect email or password" error a real
// failed login would.
const DEMO_CREDENTIALS = {
  user: { email: "demo-user@bridgepay.dev", password: "DemoPass123!" },
  admin: { email: "demo-admin@bridgepay.dev", password: "DemoPass123!" },
} as const;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * IMPORTANT: this context never holds the access/refresh token in client
 * state — they live in httpOnly cookies, set and read server-side only
 * (see lib/auth.ts, app/api/auth/login, app/api/auth/logout). All
 * authenticated data fetching here goes through this app's own API
 * routes (/api/me, /api/account), which read the cookie server-side and
 * proxy to the real backend. This is deliberate: it's what keeps the
 * tokens inaccessible to any client-side JS (including a successful XSS),
 * per PLAN.md's security notes.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/me");
      if (res.ok) {
        setUser(await res.json());
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  const refreshAccount = useCallback(async () => {
    try {
      const res = await fetch("/api/account");
      if (res.ok) {
        setAccount(await res.json());
      } else {
        setAccount(null);
      }
    } catch {
      setAccount(null);
    }
  }, []);

  // Initial session hydration — if the httpOnly cookie is valid, these
  // succeed; if not (no cookie, or expired), both quietly resolve to
  // "not authenticated" rather than throwing.
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      await Promise.allSettled([refreshUser(), refreshAccount()]);
      setIsLoading(false);
    };
    initAuth();
  }, [refreshUser, refreshAccount]);

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Login failed");
      }

      await Promise.allSettled([refreshUser(), refreshAccount()]);
      router.push("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (role: "user" | "admin") => {
    await login(DEMO_CREDENTIALS[role]);
  };

  const registerUser = async (data: { email: string; password: string; full_name: string }) => {
    setIsLoading(true);
    try {
      await apiRegister(data);
      // Auto-login after registration
      await login({ email: data.email, password: data.password });
    } catch (error) {
      if (error instanceof ApiRequestError) {
        throw new Error(error.message);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null);
    setAccount(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        account,
        isLoading,
        isAuthenticated: !!user,
        login,
        demoLogin,
        registerUser,
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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
