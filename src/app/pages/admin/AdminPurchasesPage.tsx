import { useEffect, useState } from "react";
import { Link } from "react-router";

import { Pagination } from "@/app/components/Pagination";
import { SearchInput } from "@/app/components/SearchInput";
import { useAdminAuth } from "@/lib/admin-auth";
import { ApiError, fetchAdminPurchases } from "@/lib/api";
import { formatIdr } from "@/lib/membership";
import type { AdminPurchaseStatus, AdminPurchaseSummary } from "@/lib/types";
import { PurchaseStatusBadge } from "./PurchaseStatusBadge";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent } from "../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

const PAGE_SIZE = 25;

const STATUS_OPTIONS: { value: AdminPurchaseStatus | "all"; label: string }[] =
  [
    { value: "all", label: "All statuses" },
    { value: "pending", label: "Pending" },
    { value: "receipt_submitted", label: "Receipt submitted" },
    { value: "approved", label: "Approved" },
  ];

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString();
}

export function AdminPurchasesPage() {
  const { token } = useAdminAuth();
  const [items, setItems] = useState<AdminPurchaseSummary[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AdminPurchaseStatus | "all">(
    "all",
  );

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setSearch(searchInput.trim());
    }, 300);
    return () => window.clearTimeout(handle);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchAdminPurchases(token, {
      page,
      limit: PAGE_SIZE,
      search: search || undefined,
      status: statusFilter === "all" ? "" : statusFilter,
    })
      .then((res) => {
        if (cancelled) return;
        setItems(res.items);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof ApiError ? err.message : "Failed to load purchases",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token, page, search, statusFilter]);

  return (
    <main className="mx-auto w-full max-w-6xl min-w-0 px-3 py-6 sm:px-4 sm:py-10">
      <div className="mb-6 space-y-1">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Plus purchases
        </h2>
        <p className="text-sm text-muted-foreground">
          {loading ? "Loading…" : `${total} purchase${total === 1 ? "" : "s"} total`}
        </p>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          placeholder="Search by store, user, or email…"
        />
        <Select
          value={statusFilter}
          onValueChange={(v) =>
            setStatusFilter(v as AdminPurchaseStatus | "all")
          }
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Receipt</TableHead>
                  <TableHead>Created</TableHead>
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
                      No purchases match your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <Link
                          to={`/admin/purchases/${row.id}`}
                          className="block space-y-0.5 hover:underline"
                        >
                          <p className="font-medium">{row.store.title}</p>
                          <p className="font-mono text-xs text-muted-foreground">
                            {row.store.subdomain}
                          </p>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{row.user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {row.user.email}
                        </p>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatIdr(row.invoiceAmount) ?? row.invoiceAmount}
                      </TableCell>
                      <TableCell>
                        <PurchaseStatusBadge status={row.status} />
                      </TableCell>
                      <TableCell>
                        {row.hasReceipt ? (
                          <Badge variant="secondary">Yes</Badge>
                        ) : (
                          <span className="text-muted-foreground">No</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatWhen(row.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))
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
