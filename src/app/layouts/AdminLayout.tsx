import { Link, NavLink, Outlet } from "react-router";
import { LogOut, Shield, Store, Wallet } from "lucide-react";

import { useAdminAuth } from "@/lib/admin-auth";
import { Button } from "../components/ui/button";
import { cn } from "../components/ui/utils";

export function AdminLayout() {
  const { logout } = useAdminAuth();

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-50/90 via-background to-violet-50/40">
      <header className="border-b border-border/70 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex min-w-0 max-w-6xl flex-col gap-5 px-3 py-6 sm:px-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200/50 bg-violet-50/80 px-3 py-1 text-xs font-medium text-muted-foreground">
              <Shield className="size-3 text-violet-600" />
              Superadmin
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Punyalink Admin
            </h1>
            <nav
              aria-label="Admin navigation"
              className="flex flex-wrap gap-2 pt-1"
            >
              <NavLink
                to="/admin/stores"
                className={({ isActive }) =>
                  cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm transition-colors",
                    isActive
                      ? "border-primary/30 bg-primary text-primary-foreground"
                      : "border-border/70 bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
                  )
                }
              >
                <Store className="size-3.5" aria-hidden />
                Stores
              </NavLink>
              <NavLink
                to="/admin/purchases"
                className={({ isActive }) =>
                  cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm transition-colors",
                    isActive
                      ? "border-primary/30 bg-primary text-primary-foreground"
                      : "border-border/70 bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
                  )
                }
              >
                <Wallet className="size-3.5" aria-hidden />
                Purchases
              </NavLink>
            </nav>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/">Back to site</Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="gap-1.5"
            >
              <LogOut className="size-4" />
              Log out
            </Button>
          </div>
        </div>
      </header>

      <Outlet />
    </div>
  );
}
