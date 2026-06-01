import { useEffect, useId, useRef, useState } from "react";
import { Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useDashboardI18n } from "@/app/dashboard-i18n/use-dashboard-i18n";
import {
  ApiError,
  confirmPlusPurchase,
  fetchMembershipMe,
  purchasePlusMembership,
} from "@/lib/api";
import { formatIdr } from "@/lib/membership";
import type {
  PendingPlusPurchase,
  PlusPurchaseResponse,
} from "@/lib/types";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";

type PlusInvoiceDetails = {
  purchaseId: string;
  invoiceAmount: number;
  bankAccountNumber: string;
  bankAccountName: string;
  instructions: string;
};

type PlusUpgradeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant: string;
  token: string;
  planName: string;
  pendingPurchase?: PendingPlusPurchase | null;
  onComplete: () => void;
};

function invoiceFromPurchase(data: PlusPurchaseResponse): PlusInvoiceDetails {
  return {
    purchaseId: data.purchaseId,
    invoiceAmount: data.invoiceAmount,
    bankAccountNumber: data.bankAccountNumber,
    bankAccountName: data.bankAccountName,
    instructions: data.message,
  };
}

function invoiceFromPending(
  data: PendingPlusPurchase,
  fallbackInstructions: string,
): PlusInvoiceDetails {
  return {
    purchaseId: data.id,
    invoiceAmount: data.invoiceAmount,
    bankAccountNumber: data.bankAccountNumber,
    bankAccountName: data.bankAccountName,
    instructions: fallbackInstructions,
  };
}

export function PlusUpgradeDialog({
  open,
  onOpenChange,
  tenant,
  token,
  planName,
  pendingPurchase = null,
  onComplete,
}: PlusUpgradeDialogProps) {
  const { t } = useDashboardI18n();
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [invoice, setInvoice] = useState<PlusInvoiceDetails | null>(null);
  const [loadingPurchase, setLoadingPurchase] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  const isResumingPending = pendingPurchase != null;

  useEffect(() => {
    if (!open) {
      setInvoice(null);
      setReceiptFile(null);
      setSubmittedMessage(null);
      setLoadingPurchase(false);
      setSubmitting(false);
      return;
    }

    let cancelled = false;
    setLoadingPurchase(true);
    setInvoice(null);
    setSubmittedMessage(null);
    setReceiptFile(null);

    if (isResumingPending) {
      fetchMembershipMe(tenant, token)
        .then((me) => {
          if (cancelled) return;
          const pending = me.pendingPurchase ?? pendingPurchase;
          if (!pending) {
            toast.error(t.plusUpgradeFailed, {
              description: t.plusUpgradeNoPendingPurchase,
            });
            onOpenChange(false);
            return;
          }
          setInvoice(
            invoiceFromPending(pending, t.plusUpgradeReceiptPendingHint),
          );
        })
        .catch((err) => {
          if (!cancelled) {
            toast.error(t.plusUpgradeFailed, {
              description:
                err instanceof ApiError ? err.message : String(err),
            });
            onOpenChange(false);
          }
        })
        .finally(() => {
          if (!cancelled) setLoadingPurchase(false);
        });
      return () => {
        cancelled = true;
      };
    }

    purchasePlusMembership(tenant, token)
      .then((data) => {
        if (!cancelled) setInvoice(invoiceFromPurchase(data));
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error(t.plusUpgradeFailed, {
            description:
              err instanceof ApiError ? err.message : String(err),
          });
          onOpenChange(false);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingPurchase(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    open,
    tenant,
    token,
    isResumingPending,
    pendingPurchase,
    onOpenChange,
    t.plusUpgradeFailed,
    t.plusUpgradeNoPendingPurchase,
    t.plusUpgradeReceiptPendingHint,
  ]);

  async function handleSubmitReceipt() {
    if (!receiptFile) return;
    setSubmitting(true);
    try {
      const result = await confirmPlusPurchase(tenant, token, receiptFile);
      setSubmittedMessage(result.message);
      toast.success(t.plusUpgradeSuccessTitle, {
        description: result.message,
      });
      onComplete();
    } catch (err) {
      toast.error(t.plusUpgradeFailed, {
        description: err instanceof ApiError ? err.message : String(err),
      });
    } finally {
      setSubmitting(false);
    }
  }

  function copyAccountNumber() {
    if (!invoice?.bankAccountNumber) return;
    void navigator.clipboard.writeText(invoice.bankAccountNumber);
    toast.success(t.plusUpgradeCopied);
  }

  const invoiceFormatted = invoice
    ? formatIdr(invoice.invoiceAmount) ?? String(invoice.invoiceAmount)
    : "";

  const dialogTitle = isResumingPending
    ? t.plusUpgradeDialogTitleReceipt
    : t.plusUpgradeDialogTitle(planName);

  return (
    <Dialog open={open} onOpenChange={(o) => !submitting && onOpenChange(o)}>
      <DialogContent className="max-w-md gap-0 overflow-hidden p-0">
        <DialogHeader className="space-y-1.5 px-6 pt-6 pb-2 pr-12">
          <DialogTitle>{dialogTitle}</DialogTitle>
          {submittedMessage && (
            <DialogDescription className="text-pretty">
              {t.plusUpgradeSuccessBody}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="px-6 py-4">
          {loadingPurchase && (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              {t.plusUpgradeLoading}
            </div>
          )}

          {!loadingPurchase && submittedMessage && (
            <p className="rounded-lg border border-emerald-200/80 bg-emerald-50/60 px-3 py-3 text-sm text-emerald-950 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-100">
              {submittedMessage}
            </p>
          )}

          {!loadingPurchase && !submittedMessage && invoice && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {invoice.instructions}
              </p>

              <div className="space-y-3 rounded-lg border bg-muted/25 p-3">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t.plusUpgradeInvoiceAmount}
                  </p>
                  <p className="text-lg font-semibold tabular-nums">
                    {invoiceFormatted}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t.plusUpgradeBank}
                  </p>
                  <p className="font-medium">{invoice.bankAccountName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t.plusUpgradeAccountNumber}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <p className="font-mono text-sm font-semibold tabular-nums">
                      {invoice.bankAccountNumber}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0"
                      onClick={copyAccountNumber}
                      aria-label={t.plusUpgradeCopyAccount}
                    >
                      <Copy className="size-4" aria-hidden />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={fileInputId}>{t.plusUpgradeReceiptLabel}</Label>
                <p className="text-xs text-muted-foreground">
                  {t.plusUpgradeReceiptHint}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {receiptFile ? receiptFile.name : t.plusUpgradePickReceipt}
                  </Button>
                  <input
                    ref={fileInputRef}
                    id={fileInputId}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    className="sr-only"
                    tabIndex={-1}
                    aria-hidden
                    onChange={(e) =>
                      setReceiptFile(e.target.files?.[0] ?? null)
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-3 border-t px-6 pt-4 pb-6">
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={() => onOpenChange(false)}
          >
            {submittedMessage ? t.plusUpgradeClose : t.dialogCancel}
          </Button>
          {!submittedMessage && (
            <Button
              type="button"
              disabled={!invoice || !receiptFile || submitting || loadingPurchase}
              onClick={handleSubmitReceipt}
            >
              {submitting ? t.plusUpgradeSubmitting : t.plusUpgradeSubmitReceipt}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
