import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { useAdminAuth } from "@/lib/admin-auth";
import { ApiError, fetchAdminPurchaseById, resolveApiMediaUrl } from "@/lib/api";
import { formatIdr } from "@/lib/membership";
import type { AdminPurchaseDetail } from "@/lib/types";
import { PurchaseStatusBadge } from "./PurchaseStatusBadge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString();
}

export function AdminPurchaseDetailPage() {
  const { purchaseId } = useParams<{ purchaseId: string }>();
  const { token } = useAdminAuth();
  const [detail, setDetail] = useState<AdminPurchaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !purchaseId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchAdminPurchaseById(token, purchaseId)
      .then((res) => {
        if (!cancelled) setDetail(res);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof ApiError ? err.message : "Failed to load purchase",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token, purchaseId]);

  if (!purchaseId) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 text-destructive">
        Missing purchase id.
      </main>
    );
  }

  const receiptImageUrl = detail?.receiptImageUrl?.trim() || null;
  const hasReceipt = Boolean(detail?.hasReceipt || receiptImageUrl);
  const receiptSrc = receiptImageUrl
    ? resolveApiMediaUrl(receiptImageUrl)
    : null;

  return (
    <main className="mx-auto w-full max-w-6xl min-w-0 px-3 py-6 sm:px-4 sm:py-10">
      <Button variant="ghost" size="sm" className="mb-4 gap-1.5" asChild>
        <Link to="/admin/purchases">
          <ArrowLeft className="size-4" />
          All purchases
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
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold sm:text-2xl">Purchase detail</h2>
            <PurchaseStatusBadge status={detail.status} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Invoice amount
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">
                  {formatIdr(detail.invoiceAmount) ?? detail.invoiceAmount}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Receipt uploaded
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{hasReceipt ? "Yes" : "No"}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Store & user</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground">Store</p>
                <p className="font-medium">{detail.store.title}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  {detail.store.subdomain}
                </p>
                <Button variant="link" className="h-auto px-0 mt-1" asChild>
                  <Link to={`/admin/stores/${detail.store.id}`}>
                    View store
                  </Link>
                </Button>
              </div>
              <div>
                <p className="text-muted-foreground">User</p>
                <p className="font-medium">{detail.user.name}</p>
                <p className="text-xs text-muted-foreground">{detail.user.email}</p>
              </div>
            </CardContent>
          </Card>

          {(detail.bankAccountName || detail.bankAccountNumber) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Bank transfer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                {detail.bankAccountName && (
                  <p>
                    Bank: <span className="font-medium">{detail.bankAccountName}</span>
                  </p>
                )}
                {detail.bankAccountNumber && (
                  <p>
                    Account:{" "}
                    <span className="font-mono font-medium">
                      {detail.bankAccountNumber}
                    </span>
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p>
                Created:{" "}
                <time dateTime={detail.createdAt}>{formatWhen(detail.createdAt)}</time>
              </p>
              <p>
                Updated:{" "}
                <time dateTime={detail.updatedAt}>{formatWhen(detail.updatedAt)}</time>
              </p>
              <p className="font-mono text-xs text-muted-foreground pt-2">
                ID: {detail.id}
              </p>
            </CardContent>
          </Card>

          {receiptSrc && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Receipt</CardTitle>
                <Button variant="outline" size="sm" className="gap-1.5" asChild>
                  <a href={receiptSrc} target="_blank" rel="noopener noreferrer">
                    Open
                    <ExternalLink className="size-3.5" />
                  </a>
                </Button>
              </CardHeader>
              <CardContent>
                <img
                  src={receiptSrc}
                  alt="Transfer receipt"
                  className="max-h-96 w-full rounded-lg border object-contain bg-muted/30"
                />
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </main>
  );
}
