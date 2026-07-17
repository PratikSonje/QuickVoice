"use client";

import { useId } from "react";
import Link from "next/link";
import { Bar, BarChart, Cell, XAxis, YAxis } from "recharts";
import { ArrowRight, PhoneCall } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/src/components/ui/chart";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";
import { EmptyState } from "@/src/components/common/EmptyState";
import { dashboardCallsHref } from "@/src/components/dashboard/call-filter-links";
import type {
  DashboardRange,
  DashboardSummary,
} from "@/src/lib/api/resources/dashboard";

const statusConfig = {
  count: { label: "Calls", color: "var(--chart-1)" },
} satisfies ChartConfig;

const directionStyles = {
  inbound: {
    label: "Inbound",
    color: "#0284C7",
    accentClass: "bg-sky-500",
    textClass: "text-sky-600 dark:text-sky-300",
    surfaceClass: "border-sky-500/25 bg-sky-500/10",
  },
  outbound: {
    label: "Outbound",
    color: "#F59E0B",
    accentClass: "bg-amber-500",
    textClass: "text-amber-600 dark:text-amber-300",
    surfaceClass: "border-amber-500/25 bg-amber-500/10",
  },
  unknown: {
    label: "Unknown",
    color: "#64748B",
    accentClass: "bg-slate-500",
    textClass: "text-slate-600 dark:text-slate-300",
    surfaceClass: "border-slate-500/25 bg-slate-500/10",
  },
};

const statusColors: Record<string, string> = {
  COMPLETED: "#10b981",
  FAILED: "var(--destructive)",
  NOT_ANSWERED: "#f59e0b",
  IN_PROGRESS: "var(--chart-1)",
  SCHEDULED: "var(--chart-3)",
  PROCESSED: "var(--chart-4)",
};

const statusPattern: Record<string, string> = {
  COMPLETED: "solid bar",
  FAILED: "dashed bar",
  NOT_ANSWERED: "dotted bar",
  IN_PROGRESS: "striped bar",
  SCHEDULED: "outlined bar",
  PROCESSED: "double-line bar",
};

const directionPattern = {
  inbound: "filled segment",
  outbound: "outlined segment",
  unknown: "dashed segment",
};

function labelStatus(status: string) {
  return status.toLowerCase().replace("_", " ");
}

function percent(count: number, total: number) {
  return total ? Math.round((count / total) * 100) : 0;
}

export function BreakdownCharts({
  summary,
  range,
  loading,
  customFrom,
  customTo,
}: {
  summary?: DashboardSummary;
  range: DashboardRange;
  loading?: boolean;
  customFrom?: string;
  customTo?: string;
}) {
  const statusTitleId = useId();
  const statusSummaryId = useId();
  const directionTitleId = useId();
  const directionSummaryId = useId();

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  const statusData = summary?.statusBreakdown.filter((item) => item.count > 0) ?? [];
  const directionData =
    summary?.directionBreakdown.filter((item) => item.count > 0) ?? [];
  const totalStatus = statusData.reduce((sum, item) => sum + item.count, 0);
  const inbound =
    directionData.find((item) => item.direction === "inbound")?.count ?? 0;
  const outbound =
    directionData.find((item) => item.direction === "outbound")?.count ?? 0;
  const directionTotal = directionData.reduce((sum, item) => sum + item.count, 0);
  const inboundPct = directionTotal
    ? Math.round((inbound / directionTotal) * 100)
    : 0;
  const outboundPct = directionTotal
    ? Math.round((outbound / directionTotal) * 100)
    : 0;
  const statusChartData = statusData.map((item) => ({
    ...item,
    label: labelStatus(item.status),
    pattern: statusPattern[item.status] ?? "solid bar",
    percentage: percent(item.count, totalStatus),
  }));
  const directionChartData = directionData.map((item) => ({
    ...item,
    label: directionStyles[item.direction].label,
    pattern: directionPattern[item.direction],
    percentage: percent(item.count, directionTotal),
    style: directionStyles[item.direction],
  }));

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="rounded-lg border bg-card p-5 shadow-sm" aria-labelledby={statusTitleId}>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase text-muted-foreground">
              Outcomes
            </p>
            <h3
              id={statusTitleId}
              className="mt-1 text-base font-semibold text-foreground"
            >
              Call outcomes
            </h3>
            <p id={statusSummaryId} className="text-xs text-muted-foreground">
              Status distribution for the selected range. X-axis shows calls;
              Y-axis shows call status.
            </p>
          </div>
          <div className="rounded-lg border bg-background px-3 py-2 text-right shadow-xs">
            <p className="text-sm font-semibold text-foreground">{totalStatus}</p>
            <p className="text-xs text-muted-foreground">tracked</p>
          </div>
        </div>
        {statusData.length ? (
          <>
            <ChartContainer
              config={statusConfig}
              className="h-64 w-full"
              role="group"
              aria-label="Call outcome status breakdown chart"
            >
              <BarChart
                accessibilityLayer
                data={statusChartData}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 18, bottom: 24 }}
                aria-label="Call outcome status breakdown chart"
                aria-describedby={statusSummaryId}
              >
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  className="text-xs text-muted-foreground"
                  label={{
                    value: "Calls",
                    position: "insideBottom",
                    offset: -12,
                  }}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={112}
                  tickLine={false}
                  axisLine={false}
                  className="text-xs text-muted-foreground"
                  label={{
                    value: "Status",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="count" name="Calls" barSize={18}>
                  {statusData.map((item) => (
                    <Cell
                      key={item.status}
                      fill={statusColors[item.status] ?? "var(--color-count)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {statusData.map((item) => (
                <Link
                  key={item.status}
                  href={dashboardCallsHref({ range, status: item.status, from: customFrom, to: customTo })}
                  className="group flex items-center justify-between gap-3 rounded-lg border bg-background px-3 py-2 text-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:bg-muted/30 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  aria-label={`Review ${labelStatus(item.status)} calls in the selected dashboard range`}
                >
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span
                        aria-hidden
                        className="size-2 shrink-0"
                        style={{
                          background:
                            statusColors[item.status] ?? "var(--color-count)",
                        }}
                      />
                      <span className="truncate capitalize text-foreground">
                        {labelStatus(item.status)}
                      </span>
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {item.count} calls,{" "}
                      {statusPattern[item.status] ?? "solid bar"}
                    </span>
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary">
                    Review
                    <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>
            <div className="sr-only">
              <table aria-describedby={statusSummaryId}>
                <caption>Call outcome status breakdown data table</caption>
                <thead>
                  <tr>
                    <th scope="col">Status</th>
                    <th scope="col">Calls</th>
                    <th scope="col">Percentage of calls</th>
                    <th scope="col">Legend pattern</th>
                  </tr>
                </thead>
                <tbody>
                  {statusChartData.map((item) => (
                    <tr key={item.status}>
                      <th scope="row">{item.label}</th>
                      <td>{item.count}</td>
                      <td>{item.percentage}%</td>
                      <td>{item.pattern}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <EmptyState
            icon={PhoneCall}
            title="No outcomes yet"
            description="Place a test call to confirm completion, failed, and missed call states are flowing into reporting."
            className="h-64 bg-background/40"
            action={
              <Button asChild size="sm">
                <Link href="/outbound">Place a test call</Link>
              </Button>
            }
          />
        )}
      </div>
      <div
        className="min-w-0 overflow-hidden rounded-xl border bg-card shadow-sm ring-1 ring-border/50"
        aria-labelledby={directionTitleId}
      >
        <div className="flex min-w-0 flex-col gap-4 border-b bg-[linear-gradient(135deg,hsl(var(--primary)/0.08),hsl(var(--background)),hsl(var(--muted)/0.55))] p-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase text-muted-foreground">
              Routing
            </p>
            <h3
              id={directionTitleId}
              className="mt-1 text-base font-semibold text-foreground"
            >
              Direction mix
            </h3>
            <p id={directionSummaryId} className="text-xs text-muted-foreground">
              Inbound and outbound call composition by count and share of
              routed calls.
            </p>
          </div>
          <div className="grid grid-cols-2 overflow-hidden rounded-xl border bg-background/80 text-center text-xs shadow-sm backdrop-blur sm:min-w-56">
            <div className="border-r border-border/70 px-3 py-2.5">
              <p className="font-semibold tabular-nums text-sky-600 dark:text-sky-300">
                {inboundPct}%
              </p>
              <p className="text-muted-foreground">inbound</p>
            </div>
            <div className="px-3 py-2.5">
              <p className="font-semibold tabular-nums text-amber-600 dark:text-amber-300">
                {outboundPct}%
              </p>
              <p className="text-muted-foreground">outbound</p>
            </div>
          </div>
        </div>
        {directionData.length ? (
          <div
            className="space-y-5 p-5"
            role="group"
            aria-label="Inbound and outbound direction mix chart"
            aria-describedby={directionSummaryId}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-sky-500/25 bg-sky-500/10 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Inbound calls
                    </p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight text-sky-600 tabular-nums dark:text-sky-300">
                      {inbound}
                    </p>
                  </div>
                  <span className="rounded-full bg-background/70 px-2.5 py-1 text-xs font-semibold text-sky-600 shadow-xs dark:text-sky-300">
                    {inboundPct}%
                  </span>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-background/70">
                  <div
                    className="h-full rounded-full bg-sky-500"
                    style={{ width: `${inboundPct}%` }}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Outbound calls
                    </p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight text-amber-600 tabular-nums dark:text-amber-300">
                      {outbound}
                    </p>
                  </div>
                  <span className="rounded-full bg-background/70 px-2.5 py-1 text-xs font-semibold text-amber-600 shadow-xs dark:text-amber-300">
                    {outboundPct}%
                  </span>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-background/70">
                  <div
                    className="h-full rounded-full bg-amber-500"
                    style={{ width: `${outboundPct}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-background/60 p-4">
              <div className="mb-3 flex items-center justify-between gap-3 text-xs">
                <span className="font-medium text-muted-foreground">
                  Routed call share
                </span>
                <span className="font-semibold text-foreground tabular-nums">
                  {directionTotal} total
                </span>
              </div>
              <div className="flex h-4 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                {directionChartData.map((item) => (
                  <div
                    key={item.direction}
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${item.percentage}%`,
                      background: item.style.color,
                    }}
                    title={`${item.label}: ${item.percentage}%`}
                  />
                ))}
              </div>
              <div className="mt-4 grid gap-2">
                {directionChartData.map((item) => (
                  <div
                    key={item.direction}
                    className={`rounded-lg border p-3 ${item.style.surfaceClass}`}
                  >
                    <div className="flex min-w-0 items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          aria-hidden
                          className={`size-2.5 shrink-0 rounded-full ${item.style.accentClass}`}
                        />
                        <span className="truncate text-sm font-medium text-foreground">
                          {item.label}
                        </span>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold text-foreground tabular-nums">
                          {item.count}
                        </p>
                        <p className={`text-xs font-medium ${item.style.textClass}`}>
                          {item.percentage}%
                        </p>
                      </div>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      Percentage of routed calls, {item.pattern}.
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="sr-only">
              <table aria-describedby={directionSummaryId}>
                <caption>Inbound and outbound direction mix data table</caption>
                <thead>
                  <tr>
                    <th scope="col">Direction</th>
                    <th scope="col">Calls</th>
                    <th scope="col">Percentage of routed calls</th>
                    <th scope="col">Legend pattern</th>
                  </tr>
                </thead>
                <tbody>
                  {directionChartData.map((item) => (
                    <tr key={item.direction}>
                      <th scope="row">{item.label}</th>
                      <td>{item.count}</td>
                      <td>{item.percentage}%</td>
                      <td>{item.pattern}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={ArrowRight}
            title="No routing data yet"
            description="Connect a number or place a test call to see inbound and outbound routing mix."
            className="m-5 h-64 bg-background/40"
            action={
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button asChild size="sm">
                  <Link href="/numbers">Connect a number</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href="/outbound">Place a test call</Link>
                </Button>
              </div>
            }
          />
        )}
      </div>
    </div>
  );
}
