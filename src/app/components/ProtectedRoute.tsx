import { Navigate, useLocation } from "react-router";
import { useAuth } from "@/lib/auth";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    const next = encodeURIComponent(
      location.pathname + location.search,
    );
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  return <>{children}</>;
}
