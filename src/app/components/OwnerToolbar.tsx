import { Link } from "react-router";
import { LayoutDashboard, LogIn, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "@/lib/auth";

export function OwnerToolbar() {
  const { isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="flex justify-end mb-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/login">
            <LogIn className="size-4" />
            Store login
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex justify-end gap-2 mb-4">
      <Button variant="outline" size="sm" asChild>
        <Link to="/dashboard">
          <LayoutDashboard className="size-4" />
          Dashboard
        </Link>
      </Button>
      <Button variant="ghost" size="sm" onClick={logout}>
        <LogOut className="size-4" />
        Log out
      </Button>
    </div>
  );
}
