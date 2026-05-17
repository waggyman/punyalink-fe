import { Link, NavLink, Outlet } from "react-router";
import {
  ArrowUpRight,
  Globe,
  LayoutGrid,
  Layers2,
  Link2,
  LogOut,
  Palette,
  Sparkles,
} from "lucide-react";

import { useDashboardI18n } from "@/app/dashboard-i18n/use-dashboard-i18n";
import { useAuth } from "@/lib/auth";
import { getBaseDomain } from "@/lib/tenant";
import { Button } from "../components/ui/button";
import { cn } from "../components/ui/utils";

type DashboardLayoutProps = {
  tenant: string;
};

export function DashboardLayout({ tenant }: DashboardLayoutProps) {
  const { logout } = useAuth();
  const { locale, setLocale, t } = useDashboardI18n();
  const baseDomain = getBaseDomain();

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-purple-50/90 via-background to-sky-50/45">
      <header className="relative overflow-hidden border-b border-violet-200/25 bg-background/85 backdrop-blur-md">
        <div
          className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full opacity-55 blur-3xl"
          style={{
            background:
              "radial-gradient(circle at center, oklch(0.78 0.14 294), transparent 68%)",
          }}
        />
        <div className="relative mx-auto flex min-w-0 max-w-6xl flex-col gap-6 px-3 py-8 sm:px-4 sm:py-10 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0 space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200/40 bg-violet-50/70 px-3 py-1 text-xs font-medium text-muted-foreground dark:border-violet-500/20 dark:bg-violet-950/40">
              <Sparkles className="size-3 text-violet-600 dark:text-violet-400" />
              {t.storeOverview}
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              {t.dashboardTitle}
            </h1>
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
              <Globe className="size-3.5 shrink-0" />
              <span className="break-all font-mono text-xs sm:text-sm">
                {tenant}.{baseDomain}
              </span>
              <span className="hidden sm:inline">·</span>
              <span className="hidden text-balance sm:inline">
                {t.taglineDesktop}
              </span>
            </p>
            <nav
              aria-label={t.dashboardNavAria}
              className="flex flex-wrap gap-2 pt-1"
            >
              <NavLink
                to="/dashboard"
                end
                className={({ isActive }) =>
                  cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm transition-colors",
                    isActive
                      ? "border-primary/30 bg-primary text-primary-foreground"
                      : "border-border/70 bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
                  )
                }
              >
                <LayoutGrid className="size-3.5" aria-hidden />
                {t.navOverview}
              </NavLink>
              <NavLink
                to="/dashboard/profile"
                className={({ isActive }) =>
                  cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm transition-colors",
                    isActive
                      ? "border-primary/30 bg-primary text-primary-foreground"
                      : "border-border/70 bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
                  )
                }
              >
                <Palette className="size-3.5" aria-hidden />
                {t.navProfile}
              </NavLink>
              <NavLink
                to="/dashboard/links"
                className={({ isActive }) =>
                  cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm transition-colors",
                    isActive
                      ? "border-primary/30 bg-primary text-primary-foreground"
                      : "border-border/70 bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
                  )
                }
              >
                <Link2 className="size-3.5" aria-hidden />
                {t.navLinks}
              </NavLink>
              <NavLink
                to="/dashboard/collections"
                className={({ isActive }) =>
                  cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm transition-colors",
                    isActive
                      ? "border-primary/30 bg-primary text-primary-foreground"
                      : "border-border/70 bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
                  )
                }
              >
                <Layers2 className="size-3.5" aria-hidden />
                {t.navCollections}
              </NavLink>
            </nav>
          </div>
          <div className="flex min-w-0 shrink-0 flex-wrap items-center gap-2">
            <div
              role="group"
              aria-label={t.langSwitchAria}
              className="flex shrink-0 rounded-lg border bg-muted/40 p-0.5"
            >
              <Button
                type="button"
                variant={locale === "en" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 px-2.5 text-xs font-semibold"
                onClick={() => setLocale("en")}
              >
                {t.langEn}
              </Button>
              <Button
                type="button"
                variant={locale === "id" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 px-2.5 text-xs font-semibold"
                onClick={() => setLocale("id")}
              >
                {t.langId}
              </Button>
            </div>
            <Button variant="outline" size="sm" asChild className="gap-1.5">
              <Link to="/">
                {t.publicPage}
                <ArrowUpRight className="size-3.5" />
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={logout} className="gap-1.5">
              <LogOut className="size-4" />
              {t.logOut}
            </Button>
          </div>
        </div>
      </header>

      <Outlet />
    </div>
  );
}
