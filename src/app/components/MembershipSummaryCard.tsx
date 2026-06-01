import type { ComponentType } from "react";
import { useState } from "react";
import { Check, CircleHelp, Crown, Layers, Link2, Sparkles, X } from "lucide-react";

import { useDashboardI18n } from "@/app/dashboard-i18n/use-dashboard-i18n";
import {
  formatIdr,
  formatMembershipLimitLabel,
} from "@/lib/membership";
import type { MembershipMe, MembershipPlan } from "@/lib/types";
import { PlusUpgradeDialog } from "./PlusUpgradeDialog";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { cn } from "./ui/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./ui/tooltip";

type MembershipSummaryCardProps = {
  tenant: string;
  token: string | null;
  membership: MembershipMe;
  collectionsUsed: number;
  collectionsAllowed: number | "unlimited";
  plans?: MembershipPlan[];
  onMembershipUpdated?: () => void;
};

export function MembershipSummaryCard({
  tenant,
  token,
  membership,
  collectionsUsed,
  collectionsAllowed,
  plans = [],
  onMembershipUpdated,
}: MembershipSummaryCardProps) {
  const { t } = useDashboardI18n();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const { plan } = membership;
  const limits = plan.limits;
  const hasPendingPurchase = membership.pendingPurchase != null;

  const upgradePlan = plans.find(
    (p) => p.code !== membership.effectiveCode && p.priceIdr != null,
  );

  return (
    <Card className="min-w-0 overflow-hidden border-border/80 shadow-sm">
      <CardHeader className="space-y-1 p-4 pb-2 sm:p-6 sm:pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Crown className="size-5 text-violet-600" aria-hidden />
            {t.membershipTitle}
          </CardTitle>
          <Badge variant="secondary" className="font-normal">
            {plan.name}
          </Badge>
        </div>
        <CardDescription className="text-pretty text-xs sm:text-sm">
          {t.membershipDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
        {hasPendingPurchase && (
          <div
            role="status"
            className="rounded-lg border border-violet-300/80 bg-violet-50 px-3 py-2 text-sm text-violet-950 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-100"
          >
            {t.membershipPendingPurchase}
          </div>
        )}

        {membership.showRenewalWarning && (
          <div
            role="status"
            className="rounded-lg border border-amber-300/80 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100"
          >
            {t.membershipRenewalWarning}
            {membership.plusExpiredAt && (
              <span className="mt-1 block text-xs opacity-80">
                {t.membershipExpiresOn(
                  new Date(membership.plusExpiredAt).toLocaleDateString(),
                )}
              </span>
            )}
          </div>
        )}

        <ul className="grid gap-3 sm:grid-cols-2">
          <LimitRow
            icon={Layers}
            label={t.membershipLimitCollections}
            value={`${collectionsUsed} / ${formatMembershipLimitLabel(
              limits.limitCollection,
              t.membershipUnlimited,
            )}`}
            hint={
              typeof collectionsAllowed === "number" &&
              collectionsAllowed !== limits.limitCollection &&
              typeof limits.limitCollection === "number"
                ? t.membershipCollectionsQuota(
                    collectionsUsed,
                    collectionsAllowed,
                  )
                : undefined
            }
          />
          <LimitRow
            icon={Link2}
            label={t.membershipLimitLinksPerCollection}
            value={formatMembershipLimitLabel(
              limits.limitCollectionLink,
              t.membershipUnlimited,
            )}
          />
        </ul>

        <ul className="space-y-2">
          <FeatureRow
            enabled={limits.canCustomLink}
            label={t.membershipFeatureCustomLink}
            tooltip={t.membershipFeatureCustomLinkHint}
            includedLabel={t.membershipFeatureIncluded}
            disabledLabel={t.membershipFeatureDisabled}
          />
          <FeatureRow
            enabled={limits.canCustomLinkCollection}
            label={t.membershipFeatureCustomCollection}
            tooltip={t.membershipFeatureCustomCollectionHint}
            includedLabel={t.membershipFeatureIncluded}
            disabledLabel={t.membershipFeatureDisabled}
          />
        </ul>

        {upgradePlan && !hasPendingPurchase && (
          <div className="rounded-lg border border-dashed border-violet-300/70 bg-violet-50/50 px-3 py-3 dark:border-violet-800 dark:bg-violet-950/20">
            <p className="flex items-center gap-1.5 text-sm font-medium text-violet-950 dark:text-violet-100">
              <Sparkles className="size-4 text-violet-600" aria-hidden />
              {t.membershipUpgradeTeaser(upgradePlan.name)}
            </p>
            {upgradePlan.priceIdr != null && (
              <p className="mt-1 text-xs text-muted-foreground">
                {t.membershipUpgradePrice(
                  formatIdr(upgradePlan.priceIdr) ?? "",
                  upgradePlan.durationDays ?? 30,
                )}
              </p>
            )}
            <Button
              type="button"
              size="sm"
              className="mt-3 bg-violet-600 hover:bg-violet-700"
              disabled={!token}
              onClick={() => setUpgradeOpen(true)}
            >
              {t.membershipUpgradeButton}
            </Button>
          </div>
        )}

        {hasPendingPurchase && token && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => setUpgradeOpen(true)}
          >
            {t.plusUpgradeSubmitReceipt}
          </Button>
        )}
      </CardContent>

      {token && (upgradePlan != null || hasPendingPurchase) && (
        <PlusUpgradeDialog
          open={upgradeOpen}
          onOpenChange={(o) => {
            setUpgradeOpen(o);
            if (!o) onMembershipUpdated?.();
          }}
          tenant={tenant}
          token={token}
          planName={upgradePlan?.name ?? plan.name}
          pendingPurchase={membership.pendingPurchase}
          onComplete={() => onMembershipUpdated?.()}
        />
      )}
    </Card>
  );
}

function LimitRow({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <li className="flex gap-3 rounded-lg border border-border/60 bg-muted/20 p-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-background">
        <Icon className="size-4 text-foreground/70" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-semibold tabular-nums">{value}</p>
        {hint && (
          <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>
        )}
      </div>
    </li>
  );
}

function FeatureRow({
  enabled,
  label,
  tooltip,
  includedLabel,
  disabledLabel,
}: {
  enabled: boolean;
  label: string;
  tooltip: string;
  includedLabel: string;
  disabledLabel: string;
}) {
  return (
    <li
      className={cn(
        "flex items-center gap-2.5 rounded-lg border px-2.5 py-2 sm:gap-3 sm:px-3 sm:py-2.5",
        enabled
          ? "border-emerald-200/80 bg-emerald-50/40 dark:border-emerald-900/50 dark:bg-emerald-950/20"
          : "border-border/60 bg-muted/15",
      )}
    >
      <div
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full sm:size-8",
          enabled
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
            : "bg-muted text-muted-foreground",
        )}
        aria-hidden
      >
        {enabled ? (
          <Check className="size-3.5 sm:size-4" strokeWidth={2.5} />
        ) : (
          <X className="size-3.5 sm:size-4" strokeWidth={2.5} />
        )}
      </div>
      <div className="flex min-w-0 flex-1 items-center gap-1">
        <p className="truncate text-sm font-medium">{label}</p>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="shrink-0 rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={tooltip}
            >
              <CircleHelp className="size-3.5" aria-hidden />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[240px] text-pretty">
            {tooltip}
          </TooltipContent>
        </Tooltip>
      </div>
      <Badge
        variant={enabled ? "secondary" : "outline"}
        className={cn(
          "shrink-0 font-normal",
          enabled
            ? "border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
            : "text-muted-foreground",
        )}
      >
        {enabled ? includedLabel : disabledLabel}
      </Badge>
    </li>
  );
}
