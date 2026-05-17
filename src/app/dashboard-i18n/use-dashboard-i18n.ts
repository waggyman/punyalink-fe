import { useCallback, useEffect, useState } from "react";
import type { DashboardLocale } from "./dashboard-messages";
import {
  dashboardLocales,
  readDashboardLocale,
  writeDashboardLocale,
} from "./dashboard-messages";

export function useDashboardI18n() {
  const [locale, setLocaleState] = useState<DashboardLocale>(() =>
    typeof window !== "undefined" ? readDashboardLocale() : "en",
  );

  useEffect(() => {
    writeDashboardLocale(locale);
  }, [locale]);

  const setLocale = useCallback((next: DashboardLocale) => {
    setLocaleState(next);
  }, []);

  const t = dashboardLocales[locale];

  return { locale, setLocale, t };
}
