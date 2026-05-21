"use client";

import { Bar, BarChart, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/src/components/ui/chart";
import { Skeleton } from "@/src/components/ui/skeleton";
import type { DashboardSummary } from "@/src/lib/api/resources/dashboard";

const statusConfig = {
  count: { label: "Calls", color: "var(--chart-1)" },
} satisfies ChartConfig;

const directionConfig = {
  inbound: { label: "Inbound", color: "var(--chart-2)" },
  outbound: { label: "Outbound", color: "var(--chart-4)" },
  unknown: { label: "Unknown", color: "var(--muted-foreground)" },
} satisfies ChartConfig;

const directionColors = {
  inbound: "var(--color-inbound)",
  outbound: "var(--color-outbound)",
  unknown: "var(--color-unknown)",
};

const statusColors: Record<string, string> = {
  COMPLETED: "#10b981",
  FAILED: "var(--destructive)",
  NOT_ANSWERED: "#f59e0b",
  IN_PROGRESS: "var(--chart-1)",
  SCHEDULED: "var(--chart-3)",
  PROCESSED: "var(--chart-4)",
};

function labelStatus(status: string) {
  return status.toLowerCase().replace("_", " ");
}

export function BreakdownCharts({
  summary,
  loading,
}: {
  summary?: DashboardSummary;
  loading?: boolean;
}) {
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
  const directionTotal = inbound + outbound;
  const inboundPct = directionTotal
    ? Math.round((inbound / directionTotal) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="border bg-card p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Outcomes
            </p>
            <h3 className="mt-1 text-base font-semibold text-foreground">
              Call outcomes
            </h3>
            <p className="text-xs text-muted-foreground">
              Status distribution for the selected range.
            </p>
          </div>
          <div className="border bg-background px-3 py-2 text-right">
            <p className="text-sm font-semibold text-foreground">{totalStatus}</p>
            <p className="text-xs text-muted-foreground">tracked</p>
          </div>
        </div>
        {statusData.length ? (
          <ChartContainer config={statusConfig} className="h-64 w-full">
            <BarChart
              data={statusData.map((item) => ({
                ...item,
                label: labelStatus(item.status),
              }))}
              layout="vertical"
              margin={{ top: 0, right: 16, left: 12, bottom: 0 }}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="label"
                width={104}
                tickLine={false}
                axisLine={false}
                className="text-xs text-muted-foreground"
              />
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Bar dataKey="count" barSize={18}>
                {statusData.map((item) => (
                  <Cell
                    key={item.status}
                    fill={statusColors[item.status] ?? "var(--color-count)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex h-64 items-center justify-center border border-dashed text-sm text-muted-foreground">
            No outcomes yet.
          </div>
        )}
      </div>
      <div className="border bg-card p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Routing
            </p>
            <h3 className="mt-1 text-base font-semibold text-foreground">
              Direction mix
            </h3>
            <p className="text-xs text-muted-foreground">
              Inbound and outbound call composition.
            </p>
          </div>
          <div className="border bg-background px-3 py-2 text-right">
            <p className="text-sm font-semibold text-foreground">{inboundPct}%</p>
            <p className="text-xs text-muted-foreground">inbound</p>
          </div>
        </div>
        {directionData.length ? (
          <div className="grid gap-4 md:grid-cols-[1fr_200px]">
            <ChartContainer config={directionConfig} className="h-64 w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={directionData}
                  dataKey="count"
                  nameKey="direction"
                  innerRadius={54}
                  outerRadius={92}
                  paddingAngle={2}
                >
                  {directionData.map((item) => (
                    <Cell
                      key={item.direction}
                      fill={directionColors[item.direction]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="flex flex-col justify-center gap-3">
              {directionData.map((item) => (
                <div key={item.direction} className="border px-3 py-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="capitalize text-muted-foreground">
                      {item.direction}
                    </span>
                    <span className="font-semibold text-foreground">{item.count}</span>
                  </div>
                  <div className="mt-2 h-1.5 bg-muted">
                    <div
                      className="h-full"
                      style={{
                        width: `${
                          directionTotal
                            ? Math.round((item.count / directionTotal) * 100)
                            : 0
                        }%`,
                        background:
                          directionColors[item.direction] ?? "var(--muted-foreground)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center border border-dashed text-sm text-muted-foreground">
            No direction data yet.
          </div>
        )}
      </div>
    </div>
  );
}
