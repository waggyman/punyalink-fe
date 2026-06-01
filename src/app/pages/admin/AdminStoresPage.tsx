import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ChevronRight } from "lucide-react";

import { Pagination } from "@/app/components/Pagination";
import { useAdminAuth } from "@/lib/admin-auth";
import { ApiError, fetchAdminStores } from "@/lib/api";
import { formatIdr } from "@/lib/membership";
import type { AdminStoreListItem } from "@/lib/types";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent } from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

const PAGE_SIZE = 25;

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString();
}

function PlanBadge({ code }: { code: string }) {
  const variant = code === "plus" ? "default" : "secondary";
  return (
    <Badge variant={variant} className="font-normal capitalize">
      {code}
    </Badge>
  );
}

export function AdminStoresPage() {
  const { token } = useAdminAuth();
  const [items, setItems] = useState<AdminStoreListItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchAdminStores(token, { page, limit: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return;
        setItems(res.items);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : "Failed to load stores");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token, page]);

  return (
    <main className="mx-auto w-full max-w-6xl min-w-0 px-3 py-6 sm:px-4 sm:py-10">
      <div className="mb-6 space-y-1">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Stores
        </h2>
        <p className="text-sm text-muted-foreground">
          {loading ? "Loading…" : `${total} store${total === 1 ? "" : "s"} total`}
        </p>
      </div>

      {error && (
        <Card className="mb-6 border-destructive/40 bg-destructive/5">
          <CardContent className="py-6 text-sm text-destructive">
            {error}
          </CardContent>
        </Card>
      )}

      {!error && (
        <Card className="overflow-hidden border-border/80">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Store</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Pending purchase</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && items.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-14 text-center text-muted-foreground"
                    >
                      …
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-14 text-center text-muted-foreground"
                    >
                      No stores found.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((row) => {
                    const owner = row.users[0];
                    const pending = row.membership.pendingPurchase;
                    return (
                      <TableRow key={row.store.id}>
                        <TableCell>
                          <div className="space-y-0.5">
                            <p className="font-medium">{row.store.title}</p>
                            <p className="font-mono text-xs text-muted-foreground">
                              {row.store.subdomain}
                            </p>
                            {!row.store.isVerified && (
                              <Badge variant="outline" className="text-[10px]">
                                Unverified
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {owner ? (
                            <div className="space-y-0.5">
                              <p className="text-sm">{owner.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {owner.email}
                              </p>
                            </div>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>
                          <PlanBadge code={row.membership.effectiveCode} />
                        </TableCell>
                        <TableCell>
                          {pending ? (
                            <span className="text-sm">
                              {formatIdr(pending.invoiceAmount) ?? pending.invoiceAmount}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatWhen(row.store.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Link
                            to={`/admin/stores/${row.store.id}`}
                            className="inline-flex text-primary hover:underline"
                            aria-label={`View ${row.store.title}`}
                          >
                            <ChevronRight className="size-4" />
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        className="mt-4"
      />
    </main>
  );
}
