import { Link } from "react-router";
import { CheckCircle2, Circle } from "lucide-react";

import { useDashboardI18n } from "@/app/dashboard-i18n/use-dashboard-i18n";
import type { ProfileBanner, ProfileBannerItems } from "@/lib/types";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";

type ProfileCompletionBannerProps = {
  banner: ProfileBanner;
};

const ITEM_KEYS: (keyof ProfileBannerItems)[] = [
  "profileImage",
  "storeTitle",
  "storeDescription",
  "storeBackground",
];

export function ProfileCompletionBanner({
  banner,
}: ProfileCompletionBannerProps) {
  const { t } = useDashboardI18n();

  if (banner.isComplete) return null;

  const incomplete = ITEM_KEYS.filter((key) => !banner.items[key]);

  return (
    <section className="overflow-hidden rounded-xl border border-violet-200/80 bg-gradient-to-r from-violet-50 to-purple-50 shadow-sm dark:border-violet-900/40 dark:from-violet-950/40 dark:to-purple-950/30">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-violet-950 dark:text-violet-100">
              {t.profileBannerTitle}
            </h2>
            <p className="mt-1 text-sm text-violet-900/80 dark:text-violet-200/80">
              {t.profileBannerDescription(banner.completed, banner.total)}
            </p>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-violet-900/70 dark:text-violet-200/70">
              <span>{t.profileBannerProgress}</span>
              <span className="font-medium tabular-nums">{banner.percent}%</span>
            </div>
            <Progress value={banner.percent} className="h-2 bg-violet-100" />
          </div>
          <ul className="grid gap-1.5 sm:grid-cols-2">
            {incomplete.map((key) => (
              <li
                key={key}
                className="flex items-center gap-2 text-sm text-violet-950/90 dark:text-violet-100/90"
              >
                <Circle className="size-4 shrink-0 text-violet-400" aria-hidden />
                {t.profileBannerItem(key)}
              </li>
            ))}
            {ITEM_KEYS.filter((key) => banner.items[key]).map((key) => (
              <li
                key={key}
                className="flex items-center gap-2 text-sm text-violet-800/60 dark:text-violet-200/60"
              >
                <CheckCircle2
                  className="size-4 shrink-0 text-emerald-600"
                  aria-hidden
                />
                <span className="line-through">{t.profileBannerItem(key)}</span>
              </li>
            ))}
          </ul>
        </div>
        <Button asChild className="shrink-0 bg-violet-600 hover:bg-violet-700">
          <Link to="/dashboard/profile">{t.profileBannerCta}</Link>
        </Button>
      </div>
    </section>
  );
}
