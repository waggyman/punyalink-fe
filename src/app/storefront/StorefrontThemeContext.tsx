import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import { fetchMembershipMe } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import {
  readStoreThemeCookie,
  writeStoreThemeCookie,
} from "@/lib/store-theme-cookie";
import {
  canUseStoreTheme,
  DEFAULT_STORE_THEME_ID,
  getStoreTheme,
  STORE_THEMES,
  type StoreThemeDefinition,
  type StoreThemeId,
} from "@/lib/store-themes";

type StorefrontThemeContextValue = {
  themeId: StoreThemeId;
  theme: StoreThemeDefinition;
  isPlus: boolean;
  membershipLoading: boolean;
  setThemeId: (id: StoreThemeId) => void;
  themes: StoreThemeDefinition[];
};

const StorefrontThemeContext =
  createContext<StorefrontThemeContextValue | null>(null);

export function StorefrontThemeProvider({
  tenant,
  children,
}: {
  tenant: string;
  children: ReactNode;
}) {
  const { token } = useAuth();
  const [storedThemeId, setStoredThemeId] = useState<StoreThemeId>(() =>
    readStoreThemeCookie(tenant) ?? DEFAULT_STORE_THEME_ID,
  );
  const [isPlus, setIsPlus] = useState(false);
  const [membershipLoading, setMembershipLoading] = useState(Boolean(token));

  useEffect(() => {
    setStoredThemeId(readStoreThemeCookie(tenant) ?? DEFAULT_STORE_THEME_ID);
  }, [tenant]);

  useEffect(() => {
    if (!token) {
      setIsPlus(false);
      setMembershipLoading(false);
      return;
    }
    let cancelled = false;
    setMembershipLoading(true);
    fetchMembershipMe(tenant, token)
      .then((m) => {
        if (!cancelled) setIsPlus(m.effectiveCode === "plus");
      })
      .catch(() => {
        if (!cancelled) setIsPlus(false);
      })
      .finally(() => {
        if (!cancelled) setMembershipLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tenant, token]);

  const themeId = useMemo(() => {
    const picked = getStoreTheme(storedThemeId);
    if (canUseStoreTheme(picked, isPlus)) return picked.id;
    return DEFAULT_STORE_THEME_ID;
  }, [storedThemeId, isPlus]);

  const setThemeId = useCallback(
    (id: StoreThemeId) => {
      const next = getStoreTheme(id);
      if (!canUseStoreTheme(next, isPlus)) {
        toast.error("Plus theme", {
          description:
            "Upgrade to Plus to use premium storefront themes. Free themes are always available.",
        });
        return;
      }
      writeStoreThemeCookie(tenant, id);
      setStoredThemeId(id);
      toast.success(`Theme set to ${next.name}`, {
        description:
          "Saved in your browser for now. Visitors will see this after API sync.",
      });
    },
    [tenant, isPlus],
  );

  const value = useMemo<StorefrontThemeContextValue>(
    () => ({
      themeId,
      theme: getStoreTheme(themeId),
      isPlus,
      membershipLoading,
      setThemeId,
      themes: STORE_THEMES,
    }),
    [themeId, isPlus, membershipLoading, setThemeId],
  );

  return (
    <StorefrontThemeContext.Provider value={value}>
      <div
        data-store-theme={themeId}
        className="storefront-theme-root min-h-screen text-foreground"
      >
        {children}
      </div>
    </StorefrontThemeContext.Provider>
  );
}

export function useStorefrontTheme(): StorefrontThemeContextValue {
  const ctx = useContext(StorefrontThemeContext);
  if (!ctx) {
    throw new Error(
      "useStorefrontTheme must be used within StorefrontThemeProvider",
    );
  }
  return ctx;
}
