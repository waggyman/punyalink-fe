import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, Crown } from "lucide-react";
import { toast } from "sonner";

import { useAdminAuth } from "@/lib/admin-auth";
import {
  addAdminMembership,
  ApiError,
  fetchAdminStoreById,
} from "@/lib/api";
import { formatIdr, formatMembershipLimit } from "@/lib/membership";
import type { AdminStoreDetail } from "@/lib/types";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

function formatWhen(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

export function AdminStoreDetailPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const { token } = useAdminAuth();
  const [detail, setDetail] = useState<AdminStoreDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [granting, setGranting] = useState(false);

  function reload() {
    if (!token || !storeId) return;
    setLoading(true);
    setError(null);
    fetchAdminStoreById(token, storeId)
      .then(setDetail)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load store"),
      )
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when id/token changes
  }, [token, storeId]);

  async function handleGrantPlus(userId: string) {
    if (!token || !detail) return;
    setGranting(true);
    try {
      const membership = await addAdminMembership(token, {
        userId,
        storeId: detail.store.id,
      });
      setDetail((prev) => (prev ? { ...prev, membership } : prev));
      toast.success("Plus membership granted");
    } catch (err) {
      toast.error("Failed to grant membership", {
        description: err instanceof ApiError ? err.message : String(err),
      });
    } finally {
      setGranting(false);
    }
  }

  if (!storeId) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 text-destructive">
        Missing store id.
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl min-w-0 px-3 py-6 sm:px-4 sm:py-10">
      <Button variant="ghost" size="sm" className="mb-4 gap-1.5" asChild>
        <Link to="/admin/stores">
          <ArrowLeft className="size-4" />
          All stores
        </Link>
      </Button>

      {loading && !detail && (
        <p className="py-14 text-center text-muted-foreground">…</p>
      )}

      {error && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="py-6 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      {detail && (
        <div className="grid gap-6">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold sm:text-2xl">
                {detail.store.title}
              </h2>
              <Badge variant="secondary" className="font-mono font-normal">
                {detail.store.subdomain}
              </Badge>
              {detail.store.isVerified ? (
                <Badge variant="outline">Verified</Badge>
              ) : (
                <Badge variant="outline">Unverified</Badge>
              )}
            </div>
            {detail.store.description && (
              <p className="text-sm text-muted-foreground">
                {detail.store.description}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Links
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{detail.stats.linkCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Collections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">
                  {detail.stats.collectionCount}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <p className="text-2xl font-semibold capitalize">
                  {detail.membership.plan.name}
                </p>
                {detail.membership.plusExpiredAt && (
                  <p className="text-xs text-muted-foreground">
                    Expires {formatWhen(detail.membership.plusExpiredAt)}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Membership limits</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
              <p>
                Collections:{" "}
                <span className="font-medium">
                  {formatMembershipLimit(
                    detail.membership.plan.limits.limitCollection,
                  )}
                </span>
              </p>
              <p>
                Links per collection:{" "}
                <span className="font-medium">
                  {formatMembershipLimit(
                    detail.membership.plan.limits.limitCollectionLink,
                  )}
                </span>
              </p>
              <p>
                Custom link slugs:{" "}
                {detail.membership.plan.limits.canCustomLink ? "Yes" : "No"}
              </p>
              <p>
                Custom collection slugs:{" "}
                {detail.membership.plan.limits.canCustomLinkCollection
                  ? "Yes"
                  : "No"}
              </p>
            </CardContent>
          </Card>

          {detail.membership.pendingPurchase && (
            <Card className="border-amber-200/60 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/20">
              <CardHeader>
                <CardTitle className="text-base">Pending Plus purchase</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p>
                  Invoice:{" "}
                  <span className="font-medium">
                    {formatIdr(detail.membership.pendingPurchase.invoiceAmount)}
                  </span>
                </p>
                <p>
                  Bank: {detail.membership.pendingPurchase.bankAccountName}{" "}
                  · {detail.membership.pendingPurchase.bankAccountNumber}
                </p>
                <p className="text-muted-foreground">
                  Status: {detail.membership.pendingPurchase.status} ·{" "}
                  {formatWhen(detail.membership.pendingPurchase.createdAt)}
                </p>
                <Button variant="link" className="h-auto px-0" asChild>
                  <Link
                    to={`/admin/purchases/${detail.membership.pendingPurchase.id}`}
                  >
                    View purchase
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Users</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {detail.users.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col gap-3 border-b border-border/60 pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  {detail.membership.effectiveCode !== "plus" && (
                    <Button
                      type="button"
                      size="sm"
                      className="gap-1.5 shrink-0"
                      disabled={granting}
                      onClick={() => handleGrantPlus(user.id)}
                    >
                      <Crown className="size-3.5" />
                      Grant Plus
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}
