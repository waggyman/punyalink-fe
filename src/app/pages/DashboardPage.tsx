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
  Globe,
  Link2,
  MousePointerClick,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

import { useDashboardI18n } from "@/app/dashboard-i18n/use-dashboard-i18n";
import type { DashboardStrings } from "@/app/dashboard-i18n/dashboard-messages";
import { ApiError, fetchLinks } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Link as StoreLink } from "@/lib/types";
import { getBaseDomain } from "@/lib/tenant";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
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
import { cn } from "../components/ui/utils";

type DashboardPageProps = {
  tenant: string;
};

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=512&h=512&fit=crop";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function truncate(text: string, max: number) {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function ctrPercent(views: number, clicks: number) {
  if (views <= 0) return 0;
  return Math.min(100, Math.round((clicks / views) * 100));
}

/** After mount — avoids chart layout overflow on narrow viewports */
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

export function DashboardPage({ tenant }: DashboardPageProps) {
  const { token } = useAuth();
  const { t } = useDashboardI18n();
  const baseDomain = getBaseDomain();
  const [links, setLinks] = useState<StoreLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const narrowCharts = useNarrowCharts(640);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    fetchLinks(tenant, token)
      .then((data) => {
        if (!cancelled) setLinks(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof ApiError ? err.message : t.failedLoadLinks,
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tenant, token]);

  const totals = useMemo(() => {
    const activeCount = links.filter((l) => l.isActive).length;
    const publicVisible = links.filter((l) => l.isPublic && l.isActive).length;
    const sumViews = links.reduce((a, l) => a + l.view, 0);
    const sumClicks = links.reduce((a, l) => a + l.click, 0);
    const ctr =
      sumViews > 0 ? Math.min(100, Math.round((sumClicks / sumViews) * 100)) : 0;
    return {
      activeCount,
      publicVisible,
      sumViews,
      sumClicks,
      ctr,
    };
  }, [links]);

  const barChartConfig = useMemo(
    () =>
      ({
        views: { label: t.chartViewsLabel, color: "var(--chart-1)" },
        clicks: { label: t.chartClicksLabel, color: "var(--chart-3)" },
      }) satisfies ChartConfig,
    [t.chartViewsLabel, t.chartClicksLabel],
  );

  const topEngagementRows = useMemo<EngagementDatum[]>(() => {
    return [...links]
      .sort((a, b) => b.view + b.click - (a.view + a.click))
      .slice(0, 8)
      .map((l) => {
        const slugShort = truncate(l.accessLink, narrowCharts ? 10 : 14);
        return {
          tickLabel: `/${slugShort}`,
          fullName: l.name,
          views: l.view,
          clicks: l.click,
        };
      });
  }, [links, narrowCharts]);

  const visibilitySegments = useMemo(() => {
    let pubActive = 0;
    let privActive = 0;
    let inactive = 0;
    for (const l of links) {
      if (!l.isActive) inactive += 1;
      else if (l.isPublic) pubActive += 1;
      else privActive += 1;
    }
    type SegKey = "pub" | "priv" | "off" | "empty";
    const slices: Array<{ key: SegKey; value: number }> = [];
    if (pubActive > 0) slices.push({ key: "pub", value: pubActive });
    if (privActive > 0) slices.push({ key: "priv", value: privActive });
    if (inactive > 0) slices.push({ key: "off", value: inactive });
    return slices.length ? slices : [{ key: "empty" as const, value: 1 }];
  }, [links]);

  const visibilityPieData = visibilitySegments.map((s) => ({
    ...s,
    name:
      s.key === "pub"
        ? t.visibilityPubLive
        : s.key === "priv"
          ? t.visibilityPrivLive
          : s.key === "off"
            ? t.visibilityInactive
            : t.visibilityEmpty,
  }));

  const sortedLinks = useMemo(
    () =>
      [...links].sort(
        (a, b) => b.view + b.click - (a.view + a.click),
      ),
    [links],
  );

  function copyShortUrl(accessLink: string) {
    const url = `${window.location.origin}/${accessLink}`;
    void navigator.clipboard.writeText(url);
    toast.success(t.toastCopiedTitle, { description: url });
  }

  function hostnameFromExternal(href: string) {
    try {
      return new URL(href).hostname;
    } catch {
      return truncate(href, 28);
    }
  }

  const pieInner = narrowCharts ? 44 : 56;
  const pieOuter = narrowCharts ? 68 : 84;

  return (
      <main className="mx-auto w-full max-w-6xl min-w-0 space-y-6 overflow-x-hidden px-3 py-6 sm:space-y-8 sm:px-4 sm:py-10">
        {loading && (
          <>
            <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
            <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
              <Skeleton className="h-[280px] rounded-xl" />
              <Skeleton className="h-[280px] rounded-xl" />
            </div>
            <Skeleton className="h-64 rounded-xl" />
          </>
        )}

        {!loading && error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="flex items-center gap-3 py-8 text-destructive">
              {error}
            </CardContent>
          </Card>
        )}

        {!loading && !error && (
          <>
            <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
              <StatCard
                icon={Link2}
                title={t.statLinksTitle}
                value={links.length}
                subtitle={t.statLinksSubtitle(totals.activeCount)}
                accent="border-l-[var(--chart-1)] border-l-4"
              />
              <StatCard
                icon={Eye}
                title={t.statViewsTitle}
                value={totals.sumViews.toLocaleString()}
                subtitle={t.statViewsSubtitle}
                accent="border-l-[var(--chart-2)] border-l-4"
              />
              <StatCard
                icon={MousePointerClick}
                title={t.statClicksTitle}
                value={totals.sumClicks.toLocaleString()}
                subtitle={t.statClicksSubtitle}
                accent="border-l-[var(--chart-4)] border-l-4"
              />
              <StatCard
                icon={TrendingUp}
                title={t.statCtrTitle}
                value={links.length === 0 ? "—" : `${totals.ctr}%`}
                subtitle={
                  links.length === 0
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
                    {t.engagementTitle}
                  </CardTitle>
                  <CardDescription className="text-pretty text-xs sm:text-sm">
                    {t.engagementDescription}
                  </CardDescription>
                </CardHeader>
                <CardContent className="min-w-0 overflow-x-hidden p-2 pt-0 sm:p-6 sm:pt-0">
                  {links.length === 0 ? (
                    <EmptyChartHint message={t.emptyChartsHint} />
                  ) : (
                    <ChartContainer
                      config={barChartConfig}
                      className="!aspect-auto flex h-[min(18rem,calc(100vw-2.5rem))] w-full min-w-0 max-w-full justify-center text-[10px] sm:h-[15.5rem] sm:text-xs"
                    >
                      <BarChart
                        data={topEngagementRows}
                        layout="vertical"
                        margin={
                          narrowCharts
                            ? { left: 0, right: 4, top: 4, bottom: 4 }
                            : { left: 4, right: 8, top: 8, bottom: 8 }
                        }
                      >
                        <CartesianGrid
                          strokeDasharray="4 8"
                          horizontal={false}
                        />
                        <XAxis
                          type="number"
                          tick={{ fontSize: narrowCharts ? 9 : 11 }}
                        />
                        <YAxis
                          type="category"
                          dataKey="tickLabel"
                          width={narrowCharts ? 72 : 108}
                          tick={{ fontSize: narrowCharts ? 9 : 11 }}
                          interval={0}
                        />
                        <Tooltip
                          cursor={{
                            fill: "oklch(0.95 0.01 264 / 0.35)",
                          }}
                          content={<EngagementBarTooltip labels={t} />}
                        />
                        {!narrowCharts && (
                          <Legend
                            wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                          />
                        )}
                        <Bar
                          dataKey="views"
                          fill="var(--color-views)"
                          radius={[0, 4, 4, 0]}
                          maxBarSize={narrowCharts ? 12 : 16}
                          name={String(barChartConfig.views.label)}
                        />
                        <Bar
                          dataKey="clicks"
                          fill="var(--color-clicks)"
                          radius={[0, 4, 4, 0]}
                          maxBarSize={narrowCharts ? 12 : 16}
                          name={String(barChartConfig.clicks.label)}
                        />
                      </BarChart>
                    </ChartContainer>
                  )}
                  {narrowCharts && links.length > 0 && (
                    <p className="mt-2 flex flex-wrap items-center justify-center gap-3 text-[10px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="size-2 rounded-sm"
                          style={{
                            background: "var(--chart-1)",
                          }}
                        />
                        {t.chartViewsLabel}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="size-2 rounded-sm"
                          style={{
                            background: "var(--chart-3)",
                          }}
                        />
                        {t.chartClicksLabel}
                      </span>
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="min-w-0 max-w-full overflow-hidden border-border/80 shadow-sm lg:col-span-2">
                <CardHeader className="space-y-1 p-4 pb-2 sm:p-6 sm:pb-2">
                  <CardTitle className="text-base sm:text-lg">
                    {t.visibilityTitle}
                  </CardTitle>
                  <CardDescription className="text-pretty text-xs sm:text-sm">
                    {t.visibilityDescription}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex min-w-0 flex-col gap-4 p-4 pt-0 sm:gap-6 sm:p-6 sm:pt-0">
                  {links.length === 0 ? (
                    <EmptyChartHint compact message={t.emptyChartsHint} />
                  ) : (
                    <>
                      <div className="mx-auto h-[min(12.5rem,calc(100vw-3rem))] w-full max-w-[17.5rem] min-w-0 shrink-0 sm:h-[13.75rem]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Tooltip
                              formatter={(v: number) => [v, t.pieTooltipSuffix]}
                              contentStyle={{
                                borderRadius: 12,
                                fontSize: 12,
                                maxWidth: "min(100vw - 2rem, 240px)",
                              }}
                            />
                            <Pie
                              data={visibilityPieData}
                              dataKey="value"
                              nameKey="name"
                              innerRadius={pieInner}
                              outerRadius={pieOuter}
                              paddingAngle={2}
                            >
                              {visibilityPieData.map((entry, i) => (
                                <Cell
                                  key={entry.key}
                                  fill={
                                    entry.key === "empty"
                                      ? "var(--muted)"
                                      : CHART_COLORS[i % CHART_COLORS.length]
                                  }
                                  stroke="transparent"
                                />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <ul className="space-y-2.5 text-sm sm:space-y-3">
                        <SummaryRow
                          label={t.summaryStorefront}
                          value={totals.publicVisible.toString()}
                          accent="bg-[var(--chart-1)]"
                        />
                        <SummaryRow
                          label={t.summaryActiveAny}
                          value={totals.activeCount.toString()}
                          accent="bg-[var(--chart-2)]"
                        />
                        <SummaryRow
                          label={t.summaryHiddenOnly}
                          value={(
                            links.length - totals.publicVisible
                          ).toString()}
                          accent="bg-[var(--chart-3)]"
                        />
                      </ul>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="min-w-0 max-w-full overflow-hidden border-border/80 shadow-sm">
              <CardHeader className="border-b bg-card p-4 sm:p-6">
                <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div className="min-w-0">
                    <CardTitle className="text-lg sm:text-xl">
                      {t.yourLinksTitle}
                    </CardTitle>
                    <CardDescription className="mt-1 text-pretty">
                      {t.yourLinksDescription}
                    </CardDescription>
                  </div>
                  <Badge
                    variant="secondary"
                    className="w-fit max-w-full shrink-0 break-all text-xs font-normal"
                  >
                    <Globe className="mr-1 size-3.5 shrink-0" />
                    {`${tenant}.${baseDomain}/{slug}`}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="min-w-0 p-0">
                {sortedLinks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center text-muted-foreground">
                    <div className="rounded-full bg-muted p-5">
                      <Link2 className="size-8 opacity-70" />
                    </div>
                    <p className="max-w-sm text-sm">{t.emptyLinksBody}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="mt-2"
                    >
                      <Link to="/">{t.previewStorefront}</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-border/80">
                    {sortedLinks.map((link, index) => {
                      const pct = ctrPercent(link.view, link.click);
                      return (
                        <div
                          key={link.id}
                          className={cn(
                            "group flex min-w-0 flex-col gap-4 p-4 transition-colors sm:flex-row sm:items-center sm:gap-4 sm:p-5",
                            "hover:bg-muted/40",
                          )}
                        >
                          <div className="flex min-w-0 flex-1 gap-3 sm:gap-4">
                            <LinkRowThumb
                              src={link.image}
                              alt=""
                              rank={index + 1}
                            />
                            <div className="min-w-0 flex-1 space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-semibold leading-tight break-words">
                                  {truncate(link.name, 48)}
                                </span>
                                {!link.isPublic && (
                                  <Badge variant="secondary">{t.badgePrivate}</Badge>
                                )}
                                {!link.isActive && (
                                  <Badge variant="outline">{t.badgeInactive}</Badge>
                                )}
                              </div>
                              <div className="flex flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3">
                                <span className="font-mono text-foreground/90 break-all">
                                  /{link.accessLink}
                                </span>
                                <span className="hidden sm:inline">→</span>
                                <span
                                  className="truncate"
                                  title={link.externalLink}
                                >
                                  {hostnameFromExternal(link.externalLink)}
                                </span>
                              </div>
                              <div className="min-w-0 max-w-full space-y-1.5 pt-1">
                                <div className="flex flex-wrap justify-between gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                                  <span>{t.clickThroughLine(pct)}</span>
                                  <span className="tabular-nums">
                                    {t.clicksViewsLine(link.click, link.view)}
                                  </span>
                                </div>
                                <Progress
                                  value={pct}
                                  className="h-1.5 bg-muted"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:justify-end">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="h-10 w-full gap-1.5 sm:h-9 sm:w-auto"
                              type="button"
                              onClick={() => copyShortUrl(link.accessLink)}
                            >
                              <Copy className="size-3.5" />
                              {t.copyUrl}
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
                                {t.openButton}
                              </a>
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
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
          <span className="text-foreground font-medium">{row.views}</span>{" "}
          {labels.tooltipViewsWord}
        </span>
        <span>
          <span className="text-foreground font-medium">{row.clicks}</span>{" "}
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

function SummaryRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <li className="flex min-w-0 items-center justify-between gap-3">
      <span className="flex min-w-0 items-center gap-2">
        <span className={cn("size-2 shrink-0 rounded-full", accent)} />
        <span className="text-balance">{label}</span>
      </span>
      <span className="shrink-0 font-mono font-medium tabular-nums">
        {value}
      </span>
    </li>
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

function LinkRowThumb({
  src,
  alt,
  rank,
}: {
  src: string | null;
  alt: string;
  rank: number;
}) {
  const [broken, setBroken] = useState(false);
  const resolved =
    broken || src == null || src.trim() === "" ? PLACEHOLDER_IMAGE : src;

  return (
    <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-muted shadow-sm ring-1 ring-border/50 sm:size-[4.75rem]">
      <img
        src={resolved}
        alt={alt}
        className="size-full object-cover"
        loading="lazy"
        onError={() => setBroken(true)}
      />
      <span className="absolute bottom-0.5 left-0.5 rounded-md bg-black/70 px-1 py-px text-[9px] font-bold text-white shadow-sm tabular-nums sm:text-[10px]">
        #{rank}
      </span>
    </div>
  );
}
