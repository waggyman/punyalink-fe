import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router";
import { ApiError, visitLink } from "@/lib/api";
import { isReservedSlug } from "@/lib/constants";
import { useAuth } from "@/lib/auth";

type LinkRedirectPageProps = {
  tenant: string;
};

export function LinkRedirectPage({ tenant }: LinkRedirectPageProps) {
  const { accessLink = "" } = useParams();
  const { token } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const reserved = !accessLink || isReservedSlug(accessLink);

  useEffect(() => {
    if (reserved) return;
    let cancelled = false;
    visitLink(tenant, accessLink, token ?? undefined)
      .then(({ externalLink }) => {
        if (!cancelled) {
          window.location.replace(externalLink);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof ApiError ? err.message : "Link not found",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [tenant, accessLink, token, reserved]);

  if (reserved) {
    return <Navigate to="/" replace />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-destructive text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <p className="text-muted-foreground">Redirecting…</p>
    </div>
  );
}
