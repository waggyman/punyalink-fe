import { FormEvent, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router";
import { ApiError, login as loginApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { getBaseDomain } from "@/lib/tenant";
import { BrandedAuthShell } from "../components/BrandedAuthShell";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

export function LoginPage() {
  const { tenant, isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const baseDomain = getBaseDomain();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const nextPath = searchParams.get("next");
  const safeNext =
    nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")
      ? nextPath
      : "/";

  if (isAuthenticated) {
    return <Navigate to={safeNext} replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const session = await loginApi(tenant, email.trim(), password);
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
          Back to public storefront
        </Link>
      }
    >
      <Card className="w-full max-w-md border border-violet-200/40 bg-card/95 shadow-xl shadow-violet-950/10 backdrop-blur-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl sm:text-2xl">Sign in</CardTitle>
          <CardDescription className="text-pretty leading-relaxed">
            Manage links and storefront settings for{" "}
            <span className="font-medium text-foreground">
              {tenant}.{baseDomain}
            </span>
            .
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
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
