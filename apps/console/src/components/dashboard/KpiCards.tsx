"use client";

import {
  CheckCircle2,
  Clock,
  PhoneCall,
  Timer,
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

export function KpiCards({
  summary,
  loading,
}: {
  summary?: DashboardSummary;
  loading?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total calls"
        value={summary?.totalCalls.toLocaleString() ?? "0"}
        icon={PhoneCall}
        loading={loading}
      />
      <StatCard
        label="Minutes used"
        value={summary?.totalMinutes.toLocaleString() ?? "0"}
        icon={Clock}
        loading={loading}
      />
      <StatCard
        label="Avg duration"
        value={formatDuration(summary?.avgDurationSeconds ?? 0)}
        icon={Timer}
        loading={loading}
      />
      <StatCard
        label="Success rate"
        value={`${Math.round((summary?.successRate ?? 0) * 100)}%`}
        icon={CheckCircle2}
        loading={loading}
      />
    </div>
  );
}
