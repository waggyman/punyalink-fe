import {
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import {
  Copy,
  Eye,
  ExternalLink,
  Link2,
  MousePointerClick,
  TrendingUp,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

import { useDashboardI18n } from "@/app/dashboard-i18n/use-dashboard-i18n";
import type { DashboardStrings } from "@/app/dashboard-i18n/dashboard-messages";
import {
  ApiError,
  fetchDashboard,
  fetchMembershipPlans,
  resolveApiMediaUrl,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type {
  DashboardResponse,
  DashboardTopClickedLink,
  MembershipPlan,
} from "@/lib/types";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Skeleton } from "../components/ui/skeleton";
import {
  ChartContainer,
  type ChartConfig,
} from "../components/ui/chart";
import { MembershipSummaryCard } from "../components/MembershipSummaryCard";
import { ProfileCompletionBanner } from "../components/ProfileCompletionBanner";
import { cn } from "../components/ui/utils";

type DashboardPageProps = {
  tenant: string;
};

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=512&h=512&fit=crop";

function truncate(text: string, max: number) {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function ctrPercent(views: number, clicks: number) {
  if (views <= 0) return 0;
  return Math.min(100, Math.round((clicks / views) * 100));
}

function sumDailyCounts(rows: { count: number }[]) {
  return rows.reduce((sum, row) => sum + row.count, 0);
}

function useNarrowCharts(breakpointPx: number) {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpointPx}px)`);
    const apply = () => setNarrow(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [breakpointPx]);
  return narrow;
}

type EngagementDatum = {
  tickLabel: string;
  fullName: string;
  views: number;
  clicks: number;
};

type TrendDatum = {
  date: string;
  tickLabel: string;
  views: number;
  clicks: number;
};

export function DashboardPage({ tenant }: DashboardPageProps) {
  const { token } = useAuth();
  const { t } = useDashboardI18n();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardKey, setDashboardKey] = useState(0);

  const narrowCharts = useNarrowCharts(640);

  function reloadDashboard() {
    setDashboardKey((k) => k + 1);
  }

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      fetchDashboard(tenant, token),
      fetchMembershipPlans(tenant, token).catch(() => [] as MembershipPlan[]),
    ])
      .then(([dash, membershipPlans]) => {
        if (!cancelled) {
          setDashboard(dash);
          setPlans(membershipPlans);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof ApiError ? err.message : t.failedLoadDashboard,
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tenant, token, t.failedLoadDashboard, dashboardKey]);

  const stats = dashboard?.stats;

  const totals = useMemo(() => {
    if (!stats) {
      return {
        activeCount: 0,
        sumViews: 0,
        sumClicks: 0,
        ctr: 0,
        totalLinks: 0,
      };
    }
    const sumViews = sumDailyCounts(stats.viewsPerDay);
    const sumClicks = sumDailyCounts(stats.clicksPerDay);
    const ctr =
      sumViews > 0 ? Math.min(100, Math.round((sumClicks / sumViews) * 100)) : 0;
    return {
      activeCount: stats.totalActiveLinks,
      sumViews,
      sumClicks,
      ctr,
      totalLinks: stats.totalLinks,
    };
  }, [stats]);

  const dailyTrend = useMemo<TrendDatum[]>(() => {
    if (!stats) return [];
    const byDate = new Map<string, TrendDatum>();
    for (const row of stats.viewsPerDay) {
      byDate.set(row.date, {
        date: row.date,
        tickLabel: format(parseISO(row.date), "MMM d"),
        views: row.count,
        clicks: 0,
      });
    }
    for (const row of stats.clicksPerDay) {
      const existing = byDate.get(row.date);
      if (existing) {
        existing.clicks = row.count;
      } else {
        byDate.set(row.date, {
          date: row.date,
          tickLabel: format(parseISO(row.date), "MMM d"),
          views: 0,
          clicks: row.count,
        });
      }
    }
    return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
  }, [stats]);

  const barChartConfig = useMemo(
    () =>
      ({
        views: { label: t.chartViewsLabel, color: "var(--chart-1)" },
        clicks: { label: t.chartClicksLabel, color: "var(--chart-3)" },
      }) satisfies ChartConfig,
    [t.chartViewsLabel, t.chartClicksLabel],
  );

  const trendChartConfig = useMemo(
    () =>
      ({
        views: { label: t.chartViewsLabel, color: "var(--chart-1)" },
        clicks: { label: t.chartClicksLabel, color: "var(--chart-4)" },
      }) satisfies ChartConfig,
    [t.chartViewsLabel, t.chartClicksLabel],
  );

  const topEngagementRows = useMemo<EngagementDatum[]>(() => {
    if (!stats) return [];
    return stats.topClickedLinks.map((link) => {
      const slugShort = truncate(link.accessLink, narrowCharts ? 10 : 14);
      return {
        tickLabel: `/${slugShort}`,
        fullName: link.name,
        views: link.view,
        clicks: link.click,
      };
    });
  }, [stats, narrowCharts]);

  function copyShortUrl(accessLink: string) {
    const url = `${window.location.origin}/${accessLink}`;
    void navigator.clipboard.writeText(url);
    toast.success(t.toastCopiedTitle, { description: url });
  }

  const hasTrendData = dailyTrend.some((d) => d.views > 0 || d.clicks > 0);
  const hasTopLinks = (stats?.topClickedLinks.length ?? 0) > 0;
  const hasLinks = totals.totalLinks > 0;

  const trendEmptyMessage = hasLinks
    ? t.emptyChartsNoActivity
    : t.emptyChartsNoLinks;
  const topLinksEmptyMessage = hasLinks
    ? t.emptyTopLinksNoActivity
    : t.emptyTopLinksNoLinks;

  return (
    <main className="mx-auto w-full max-w-6xl min-w-0 space-y-6 overflow-x-hidden px-3 py-6 sm:space-y-8 sm:px-4 sm:py-10">
      {loading && (
        <>
          <Skeleton className="h-36 rounded-xl" />
          <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
          <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
            <Skeleton className="h-[280px] rounded-xl" />
            <Skeleton className="h-[280px] rounded-xl" />
          </div>
        </>
      )}

      {!loading && error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center gap-3 py-8 text-destructive">
            {error}
          </CardContent>
        </Card>
      )}

      {!loading && !error && dashboard && stats && (
        <>
          <ProfileCompletionBanner banner={dashboard.profileBanner} />

          <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            <StatCard
              icon={Link2}
              title={t.statLinksTitle}
              value={totals.totalLinks}
              subtitle={t.statLinksSubtitle(totals.activeCount)}
              accent="border-l-[var(--chart-1)] border-l-4"
            />
            <StatCard
              icon={Eye}
              title={t.statViewsTitle}
              value={totals.sumViews.toLocaleString()}
              subtitle={t.statViewsSubtitlePeriod}
              accent="border-l-[var(--chart-2)] border-l-4"
            />
            <StatCard
              icon={MousePointerClick}
              title={t.statClicksTitle}
              value={totals.sumClicks.toLocaleString()}
              subtitle={t.statClicksSubtitlePeriod}
              accent="border-l-[var(--chart-4)] border-l-4"
            />
            <StatCard
              icon={TrendingUp}
              title={t.statCtrTitle}
              value={totals.totalLinks === 0 ? "—" : `${totals.ctr}%`}
              subtitle={
                totals.totalLinks === 0
                  ? t.statCtrEmptySubtitle
                  : t.statCtrSubtitle
              }
              accent="border-l-[var(--chart-5)] border-l-4"
            />
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-5 lg:gap-6">
            <Card className="min-w-0 max-w-full overflow-hidden border-border/80 shadow-sm lg:col-span-3">
              <CardHeader className="space-y-1 p-4 pb-2 sm:p-6 sm:pb-2">
                <CardTitle className="text-base sm:text-lg">
                  {t.trendsTitle}
                </CardTitle>
                <CardDescription className="text-pretty text-xs sm:text-sm">
                  {t.trendsDescription}
                </CardDescription>
              </CardHeader>
              <CardContent className="min-w-0 overflow-x-hidden p-2 pt-0 sm:p-6 sm:pt-0">
                {!hasTrendData ? (
                  <EmptyChartHint message={trendEmptyMessage} />
                ) : (
                  <ChartContainer
                    config={trendChartConfig}
                    className="!aspect-auto flex h-[min(18rem,calc(100vw-2.5rem))] w-full min-w-0 max-w-full justify-center text-[10px] sm:h-[15.5rem] sm:text-xs"
                  >
                    <LineChart
                      data={dailyTrend}
                      margin={
                        narrowCharts
                          ? { left: 0, right: 4, top: 4, bottom: 0 }
                          : { left: 4, right: 8, top: 8, bottom: 0 }
                      }
                    >
                      <CartesianGrid strokeDasharray="4 8" />
                      <XAxis
                        dataKey="tickLabel"
                        tick={{ fontSize: narrowCharts ? 9 : 11 }}
                        interval={narrowCharts ? "preserveStartEnd" : 4}
                      />
                      <YAxis tick={{ fontSize: narrowCharts ? 9 : 11 }} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 12,
                          fontSize: 12,
                        }}
                      />
                      {!narrowCharts && (
                        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                      )}
                      <Line
                        type="monotone"
                        dataKey="views"
                        stroke="var(--color-views)"
                        strokeWidth={2}
                        dot={false}
                        name={String(trendChartConfig.views.label)}
                      />
                      <Line
                        type="monotone"
                        dataKey="clicks"
                        stroke="var(--color-clicks)"
                        strokeWidth={2}
                        dot={false}
                        name={String(trendChartConfig.clicks.label)}
                      />
                    </LineChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            <div className="lg:col-span-2">
              <MembershipSummaryCard
                tenant={tenant}
                token={token}
                membership={dashboard.membership}
                collectionsUsed={stats.collections.total}
                collectionsAllowed={stats.collections.allowed}
                plans={plans}
                onMembershipUpdated={reloadDashboard}
              />
            </div>
          </div>

          <Card className="min-w-0 max-w-full overflow-hidden border-border/80 shadow-sm">
            <CardHeader className="space-y-1 border-b p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">
                {t.topLinksTitle}
              </CardTitle>
              <CardDescription className="text-pretty text-xs sm:text-sm">
                {t.topLinksDescription}
              </CardDescription>
            </CardHeader>
            <CardContent className="min-w-0 p-0">
              {!hasTopLinks ? (
                <EmptyChartHint compact message={topLinksEmptyMessage} />
              ) : (
                <>
                  <div className="hidden border-b p-4 sm:block sm:p-6 sm:pt-4">
                    <ChartContainer
                      config={barChartConfig}
                      className="!aspect-auto flex h-[min(16rem,calc(100vw-2.5rem))] w-full min-w-0 max-w-full justify-center text-[10px] sm:h-[14rem] sm:text-xs"
                    >
                      <BarChart
                        data={topEngagementRows}
                        layout="vertical"
                        margin={{ left: 4, right: 8, top: 8, bottom: 8 }}
                      >
                        <CartesianGrid strokeDasharray="4 8" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 11 }} />
                        <YAxis
                          type="category"
                          dataKey="tickLabel"
                          width={108}
                          tick={{ fontSize: 11 }}
                          interval={0}
                        />
                        <Tooltip content={<EngagementBarTooltip labels={t} />} />
                        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                        <Bar
                          dataKey="views"
                          fill="var(--color-views)"
                          radius={[0, 4, 4, 0]}
                          maxBarSize={16}
                          name={String(barChartConfig.views.label)}
                        />
                        <Bar
                          dataKey="clicks"
                          fill="var(--color-clicks)"
                          radius={[0, 4, 4, 0]}
                          maxBarSize={16}
                          name={String(barChartConfig.clicks.label)}
                        />
                      </BarChart>
                    </ChartContainer>
                  </div>
                  <div className="divide-y divide-border/80">
                    {stats.topClickedLinks.map((link, index) => (
                      <TopLinkRow
                        key={link.id}
                        link={link}
                        rank={index + 1}
                        labels={t}
                        onCopy={() => copyShortUrl(link.accessLink)}
                      />
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </main>
  );
}

function TopLinkRow({
  link,
  rank,
  labels,
  onCopy,
}: {
  link: DashboardTopClickedLink;
  rank: number;
  labels: DashboardStrings;
  onCopy: () => void;
}) {
  const pct = ctrPercent(link.view, link.click);
  const imageSrc = resolveApiMediaUrl(link.imageUrl) ?? PLACEHOLDER_IMAGE;

  return (
    <div className="flex min-w-0 flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
      <div className="flex min-w-0 flex-1 gap-3 sm:gap-4">
        <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-muted shadow-sm ring-1 ring-border/50 sm:size-[4.75rem]">
          <img
            src={imageSrc}
            alt=""
            className="size-full object-cover"
            loading="lazy"
          />
          <span className="absolute bottom-0.5 left-0.5 rounded-md bg-black/70 px-1 py-px text-[9px] font-bold text-white tabular-nums sm:text-[10px]">
            #{rank}
          </span>
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <p className="font-semibold leading-tight break-words">
            {truncate(link.name, 48)}
          </p>
          <p className="font-mono text-xs text-muted-foreground break-all">
            /{link.accessLink}
          </p>
          <div className="min-w-0 max-w-full space-y-1.5">
            <div className="flex flex-wrap justify-between gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
              <span>{labels.clickThroughLine(pct)}</span>
              <span className="tabular-nums">
                {labels.clicksViewsLine(link.click, link.view)}
              </span>
            </div>
            <Progress value={pct} className="h-1.5 bg-muted" />
          </div>
        </div>
      </div>
      <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row">
        <Button
          variant="secondary"
          size="sm"
          className="h-10 w-full gap-1.5 sm:h-9 sm:w-auto"
          type="button"
          onClick={onCopy}
        >
          <Copy className="size-3.5" />
          {labels.copyUrl}
        </Button>
        <Button
          variant="outline"
          size="sm"
          asChild
          className="h-10 w-full gap-1.5 sm:h-9 sm:w-auto"
        >
          <a
            href={`/${link.accessLink}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="size-3.5" />
            {labels.openButton}
          </a>
        </Button>
      </div>
    </div>
  );
}

function EngagementBarTooltip({
  active,
  payload,
  labels,
}: {
  active?: boolean;
  payload?: Array<{ payload: EngagementDatum }>;
  labels: DashboardStrings;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="max-w-[min(calc(100vw-2rem),16rem)] rounded-lg border border-border/80 bg-background px-3 py-2 text-xs shadow-lg">
      <p className="font-medium leading-snug break-words">{row.fullName}</p>
      <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
        {row.tickLabel}
      </p>
      <div className="mt-2 flex gap-4 tabular-nums text-muted-foreground">
        <span>
          <span className="font-medium text-foreground">{row.views}</span>{" "}
          {labels.tooltipViewsWord}
        </span>
        <span>
          <span className="font-medium text-foreground">{row.clicks}</span>{" "}
          {labels.tooltipClicksWord}
        </span>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  title,
  value,
  subtitle,
  accent,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  value: ReactNode;
  subtitle: string;
  accent: string;
}) {
  return (
    <Card
      className={cn(
        "min-w-0 max-w-full overflow-hidden border-border/70 pl-px shadow-sm",
        accent,
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between p-4 pb-2 sm:p-6">
        <div className="min-w-0 space-y-2 sm:space-y-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
            <Icon className="size-4 text-foreground/80" />
          </div>
          <CardDescription className="text-[10px] font-medium uppercase tracking-wide sm:text-xs">
            {title}
          </CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums sm:text-3xl">
            {value}
          </CardTitle>
          <p className="text-[11px] leading-snug text-muted-foreground sm:text-xs">
            {subtitle}
          </p>
        </div>
      </CardHeader>
    </Card>
  );
}

function EmptyChartHint({
  compact,
  message,
}: {
  compact?: boolean;
  message: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 text-muted-foreground",
        compact ? "py-10" : "py-14",
      )}
    >
      <TrendingUp className="mb-3 size-8 opacity-40" />
      <p className="text-center text-sm">{message}</p>
    </div>
  );
}
