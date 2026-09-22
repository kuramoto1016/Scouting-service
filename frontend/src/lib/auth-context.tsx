"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { AccountType, Intern, Company, fetchMe } from "./api";

interface AuthState {
  token: string | null;
  accountType: AccountType | null;
  account: Intern | Company | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  signIn: (token: string, accountType: AccountType, account: Intern | Company) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "scouting_auth_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: null,
    accountType: null,
    account: null,
    loading: true,
  });

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEY);
    if (!token) {
      queueMicrotask(() => setState((s) => ({ ...s, loading: false })));
      return;
    }

    fetchMe(token)
      .then((res) => {
        setState({ token, accountType: res.account_type, account: res.account, loading: false });
      })
      .catch(() => {
        localStorage.removeItem(STORAGE_KEY);
        setState({ token: null, accountType: null, account: null, loading: false });
      });
  }, []);

  const signIn = useCallback(
    (token: string, accountType: AccountType, account: Intern | Company) => {
      localStorage.setItem(STORAGE_KEY, token);
      setState({ token, accountType, account, loading: false });
    },
    []
  );

  const signOut = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({ token: null, accountType: null, account: null, loading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, signIn, signOut }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
