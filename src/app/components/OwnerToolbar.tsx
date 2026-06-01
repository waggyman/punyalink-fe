import { useState } from "react";
import { Link } from "react-router";
import { LayoutDashboard, LogIn, LogOut, Palette } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { StoreThemePicker } from "./StoreThemePicker";
import { useAuth } from "@/lib/auth";

type OwnerToolbarProps = {
  tenant: string;
};

export function OwnerToolbar({ tenant }: OwnerToolbarProps) {
  const { isAuthenticated, logout } = useAuth();
  const [themeOpen, setThemeOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="mb-4 flex justify-end">
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
    <div className="mb-4 flex justify-end gap-2">
      <Dialog open={themeOpen} onOpenChange={setThemeOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Palette className="size-4" />
            Theme
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Storefront theme</DialogTitle>
            <DialogDescription>
              Preview themes on your public page. Saved in a cookie on this
              browser until store settings sync to the API.
            </DialogDescription>
          </DialogHeader>
          <StoreThemePicker compact />
        </DialogContent>
      </Dialog>
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
