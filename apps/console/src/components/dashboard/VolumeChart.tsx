"use client";

import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  Legend,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/src/components/ui/chart";
import { Skeleton } from "@/src/components/ui/skeleton";
import type {
  DashboardRange,
  DashboardSeriesPoint,
  DashboardSummary,
} from "@/src/lib/api/resources/dashboard";

const config = {
  calls: { label: "Calls", color: "var(--chart-1)" },
  minutes: { label: "Minutes", color: "#10b981" },
  failed: { label: "Failed", color: "var(--destructive)" },
} satisfies ChartConfig;

function formatTick(iso: string, range: DashboardRange) {
  const d = new Date(iso);
  if (range === "24h") {
    return d.toLocaleTimeString([], { hour: "numeric" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function totalFor(data: DashboardSeriesPoint[], key: keyof DashboardSeriesPoint) {
  return data.reduce((sum, point) => {
    const value = point[key];
    return typeof value === "number" ? sum + value : sum;
  }, 0);
}

export function VolumeChart({
  summary,
  range,
  loading,
}: {
  summary?: DashboardSummary;
  range: DashboardRange;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="border bg-card p-5">
        <div className="mb-5 flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  const data = summary?.series ?? [];
  const peak = data.reduce((max, point) => Math.max(max, point.calls), 0);
  const calls = totalFor(data, "calls");
  const minutes = totalFor(data, "minutes");

  return (
    <div className="border bg-card">
      <div className="flex flex-col gap-4 border-b p-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Traffic timeline
          </p>
          <h3 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
            Calls, minutes, and outcome pressure
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Bucketed by {range === "24h" ? "hour" : "day"} with failures overlaid.
          </p>
        </div>
        <div className="grid grid-cols-3 border bg-background text-center text-xs sm:min-w-96">
          <div className="border-r px-3 py-2">
            <p className="font-semibold text-foreground">{calls}</p>
            <p className="text-muted-foreground">calls</p>
          </div>
          <div className="border-r px-3 py-2">
            <p className="font-semibold text-foreground">{minutes}</p>
            <p className="text-muted-foreground">minutes</p>
          </div>
          <div className="px-3 py-2">
            <p className="font-semibold text-foreground">{peak}</p>
            <p className="text-muted-foreground">peak</p>
          </div>
        </div>
      </div>
      {data.length === 0 ? (
        <div className="m-5 flex h-80 items-center justify-center border border-dashed text-sm text-muted-foreground">
          No calls yet in this range.
        </div>
      ) : (
        <ChartContainer config={config} className="h-[22rem] w-full p-5">
          <ComposedChart
            data={data}
            margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient
                id="dashboard-minutes-fill"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="var(--color-minutes)"
                  stopOpacity={0.34}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-minutes)"
                  stopOpacity={0.02}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-border"
              vertical={false}
            />
            <XAxis
              dataKey="t"
              tickFormatter={(v) => formatTick(v, range)}
              stroke="currentColor"
              className="text-xs text-muted-foreground"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="left"
              stroke="currentColor"
              className="text-xs text-muted-foreground"
              tickLine={false}
              axisLine={false}
              width={32}
            />
            <YAxis yAxisId="right" orientation="right" hide />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(v) => formatTick(String(v), range)}
                />
              }
            />
            <Legend
              verticalAlign="top"
              height={32}
              iconType="square"
              wrapperStyle={{ color: "var(--muted-foreground)", fontSize: 12 }}
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="minutes"
              stroke="var(--color-minutes)"
              strokeWidth={2}
              fill="url(#dashboard-minutes-fill)"
            />
            <Bar
              yAxisId="left"
              dataKey="calls"
              fill="var(--color-calls)"
              barSize={16}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="failed"
              stroke="var(--color-failed)"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ChartContainer>
      )}
    </div>
  );
}
