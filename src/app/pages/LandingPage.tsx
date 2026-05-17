import { Link } from "react-router";
import { getBaseDomain } from "@/lib/tenant";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

export function LandingPage() {
  const baseDomain = getBaseDomain();
  const devTenant = import.meta.env.VITE_DEV_TENANT;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-muted/30">
      <Card className="w-full max-w-xl shadow-sm">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl tracking-tight">Punyalink</CardTitle>
          <CardDescription className="text-base">
            One short profile URL per store — share links and bundles with clear
            analytics on views and clicks.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
            <li>
              Your store lives at{" "}
              <strong className="text-foreground">yourstore.{baseDomain}</strong>
            </li>
            <li>
              Owners sign in at{" "}
              <strong className="text-foreground">
                yourstore.{baseDomain}/login
              </strong>{" "}
              and manage everything under{" "}
              <strong className="text-foreground">/dashboard</strong>
            </li>
          </ul>
          <Button className="w-full sm:w-auto" asChild size="lg">
            <Link to="/register">Create your store</Link>
          </Button>
          <p className="text-xs text-muted-foreground border-t pt-4">
            {devTenant ? (
              <>
                Dev tip: tenant{" "}
                <code className="text-foreground">{devTenant}</code> via{" "}
                <code className="text-foreground">VITE_DEV_TENANT</code>, or open{" "}
                <code className="text-foreground">{devTenant}.localhost</code>{" "}
                with the dev server port.
              </>
            ) : (
              <>
                Local dev: set{" "}
                <code className="text-foreground">VITE_DEV_TENANT=acme</code> in{" "}
                <code className="text-foreground">.env</code>, or use{" "}
                <code className="text-foreground">acme.localhost</code>.
              </>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
