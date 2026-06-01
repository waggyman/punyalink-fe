import { Navigate, useLocation } from "react-router";
import { useAdminAuth } from "@/lib/admin-auth";

export function AdminProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAdminAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    const next = encodeURIComponent(
      location.pathname + location.search,
    );
    return <Navigate to={`/admin/login?next=${next}`} replace />;
  }

  return <>{children}</>;
}
