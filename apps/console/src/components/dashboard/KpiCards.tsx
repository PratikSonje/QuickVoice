"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  PhoneCall,
  TrendingDown,
  TrendingUp,
  Timer,
  Voicemail,
} from "lucide-react";
import { StatCard } from "@/src/components/common/StatCard";
import type { DashboardSummary } from "@/src/lib/api/resources/dashboard";

function formatDuration(seconds: number) {
  if (!seconds) return "0s";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (!m) return `${s}s`;
  return `${m}m ${s}s`;
}

function formatDeltaValue(value?: number, suffix = "%") {
  const n = value ?? 0;
  const sign = n > 0 ? "+" : "";
  return `${sign}${n}${suffix}`;
}

function Trend({
  value,
  inverse = false,
}: {
  value?: number;
  inverse?: boolean;
}) {
  const n = value ?? 0;
  const positive = n >= 0;
  const good = inverse ? n <= 0 : n >= 0;
  const Icon = positive ? TrendingUp : TrendingDown;

  return (
    <span
      className={
        good
          ? "inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-300"
          : "inline-flex items-center gap-1 text-destructive"
      }
    >
      <Icon className="size-3" />
      {formatDeltaValue(n)} vs previous
    </span>
  );
}

export function KpiCards({
  summary,
  loading,
}: {
  summary?: DashboardSummary;
  loading?: boolean;
}) {
  const totals = summary?.totals;
  const deltas = summary?.deltas;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-12">
      <StatCard
        label="Total calls"
        value={totals?.calls.toLocaleString() ?? "0"}
        eyebrow="All inbound and outbound activity"
        helper={<Trend value={deltas?.calls} />}
        icon={PhoneCall}
        loading={loading}
        tone="info"
        className="xl:col-span-3"
      />
      <StatCard
        label="Minutes used"
        value={totals?.minutes.toLocaleString() ?? "0"}
        eyebrow="Connected conversation time"
        helper={<Trend value={deltas?.minutes} />}
        icon={Clock}
        loading={loading}
        tone="neutral"
        className="xl:col-span-2"
      />
      <StatCard
        label="Avg duration"
        value={formatDuration(totals?.avgDurationSeconds ?? 0)}
        eyebrow="Per completed interaction"
        helper={<Trend value={deltas?.avgDurationSeconds} />}
        icon={Timer}
        loading={loading}
        tone="warning"
        className="xl:col-span-2"
      />
      <StatCard
        label="Success rate"
        value={`${Math.round((totals?.successRate ?? 0) * 100)}%`}
        eyebrow="Completed calls out of total"
        helper={<Trend value={deltas?.successRate} />}
        icon={CheckCircle2}
        loading={loading}
        tone="success"
        className="xl:col-span-2"
      />
      <div className="grid grid-cols-2 gap-4 xl:col-span-3">
        <StatCard
          label="Failed"
          value={totals?.failedCalls.toLocaleString() ?? "0"}
          helper={<Trend value={deltas?.failedCalls} inverse />}
          icon={AlertTriangle}
          loading={loading}
          tone="danger"
        />
        <StatCard
          label="Missed"
          value={totals?.missedCalls.toLocaleString() ?? "0"}
          helper={<Trend value={deltas?.missedCalls} inverse />}
          icon={Voicemail}
          loading={loading}
          tone="warning"
        />
      </div>
    </div>
  );
}
