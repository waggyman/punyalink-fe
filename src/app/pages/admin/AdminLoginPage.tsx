import { FormEvent, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router";
import { adminLogin, ApiError } from "@/lib/api";
import { useAdminAuth } from "@/lib/admin-auth";
import { BrandedAuthShell } from "../../components/BrandedAuthShell";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

export function AdminLoginPage() {
  const { isAuthenticated, login } = useAdminAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const nextPath = searchParams.get("next");
  const safeNext =
    nextPath &&
    nextPath.startsWith("/admin") &&
    !nextPath.startsWith("//")
      ? nextPath
      : "/admin/stores";

  if (isAuthenticated) {
    return <Navigate to={safeNext} replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const session = await adminLogin(email.trim(), password);
      login(session);
      navigate(safeNext, { replace: true });
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Login failed. Try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <BrandedAuthShell
      footerLink={
        <Link
          to="/"
          className="text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Back to homepage
        </Link>
      }
    >
      <Card className="w-full max-w-md border border-violet-200/40 bg-card/95 shadow-xl shadow-violet-950/10 backdrop-blur-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl sm:text-2xl">Admin sign in</CardTitle>
          <CardDescription className="text-pretty leading-relaxed">
            Platform superadmin access for stores and Plus purchases.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full shadow-md" disabled={submitting}>
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </BrandedAuthShell>
  );
}
