import { Navigate, Route, Routes } from "react-router";
import { AuthProvider } from "@/lib/auth";
import { AdminAuthProvider } from "@/lib/admin-auth";
import { getTenantFromHost } from "@/lib/tenant";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminProtectedRoute } from "./components/AdminProtectedRoute";
import { PublicStorePage } from "./pages/PublicStorePage";
import { LoginPage } from "./pages/LoginPage";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { AdminLayout } from "./layouts/AdminLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { StoreProfilePage } from "./pages/StoreProfilePage";
import { ManageCollectionsPage } from "./pages/ManageCollectionsPage";
import { ManageLinksPage } from "./pages/ManageLinksPage";
import { LinkRedirectPage } from "./pages/LinkRedirectPage";
import { CollectionPage } from "./pages/CollectionPage";
import { LandingPage } from "./pages/LandingPage";
import { RegisterPage } from "./pages/RegisterPage";
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { AdminStoresPage } from "./pages/admin/AdminStoresPage";
import { AdminStoreDetailPage } from "./pages/admin/AdminStoreDetailPage";
import { AdminPurchasesPage } from "./pages/admin/AdminPurchasesPage";
import { AdminPurchaseDetailPage } from "./pages/admin/AdminPurchaseDetailPage";

function TenantRoutes({ tenant }: { tenant: string }) {
  return (
    <Routes>
      <Route path="/" element={<PublicStorePage tenant={tenant} />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout tenant={tenant} />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage tenant={tenant} />} />
        <Route
          path="profile"
          element={<StoreProfilePage tenant={tenant} />}
        />
        <Route
          path="links"
          element={<ManageLinksPage tenant={tenant} />}
        />
        <Route
          path="collections"
          element={<ManageCollectionsPage tenant={tenant} />}
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
      <Route
        path="/collection/:accessLink"
        element={<CollectionPage tenant={tenant} />}
      />
      <Route
        path="/:accessLink"
        element={<LinkRedirectPage tenant={tenant} />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function ApexRoutes() {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/stores" replace />} />
          <Route path="stores" element={<AdminStoresPage />} />
          <Route path="stores/:storeId" element={<AdminStoreDetailPage />} />
          <Route path="purchases" element={<AdminPurchasesPage />} />
          <Route
            path="purchases/:purchaseId"
            element={<AdminPurchaseDetailPage />}
          />
          <Route path="*" element={<Navigate to="/admin/stores" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AdminAuthProvider>
  );
}

export function AppRouter() {
  const tenant = getTenantFromHost();

  if (!tenant) {
    return <ApexRoutes />;
  }

  return (
    <AuthProvider tenant={tenant}>
      <TenantRoutes tenant={tenant} />
    </AuthProvider>
  );
}
