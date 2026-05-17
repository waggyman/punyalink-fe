import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuthSession } from "./types";

function storageKey(tenant: string) {
  return `punyalink_auth_${tenant}`;
}

function readSession(tenant: string): AuthSession | null {
  try {
    const raw = localStorage.getItem(storageKey(tenant));
    if (!raw) return null;
    const session = JSON.parse(raw) as AuthSession;
    if (!session.accessToken || session.store?.subdomain !== tenant) {
      return null;
    }
    if (session.expired_at && new Date(session.expired_at) <= new Date()) {
      localStorage.removeItem(storageKey(tenant));
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

type AuthContextValue = {
  tenant: string;
  session: AuthSession | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (session: AuthSession) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  tenant,
  children,
}: {
  tenant: string;
  children: ReactNode;
}) {
  const [session, setSession] = useState<AuthSession | null>(() =>
    readSession(tenant),
  );

  useEffect(() => {
    setSession(readSession(tenant));
  }, [tenant]);

  const login = useCallback(
    (next: AuthSession) => {
      localStorage.setItem(storageKey(tenant), JSON.stringify(next));
      setSession(next);
    },
    [tenant],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(storageKey(tenant));
    setSession(null);
  }, [tenant]);

  const value = useMemo<AuthContextValue>(
    () => ({
      tenant,
      session,
      token: session?.accessToken ?? null,
      isAuthenticated: Boolean(session?.accessToken),
      login,
      logout,
    }),
    [tenant, session, login, logout],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
