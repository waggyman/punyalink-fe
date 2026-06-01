import { Badge } from "../../components/ui/badge";

export function PurchaseStatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  let variant: "default" | "secondary" | "outline" = "secondary";
  if (normalized === "approved") variant = "default";
  else if (normalized === "pending") variant = "outline";

  return (
    <Badge variant={variant} className="font-normal capitalize">
      {status.replace(/_/g, " ")}
    </Badge>
  );
}
