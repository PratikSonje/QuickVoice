"use client";

import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/src/components/common/PageHeader";
import { RangeSwitcher } from "@/src/components/dashboard/RangeSwitcher";
import { KpiCards } from "@/src/components/dashboard/KpiCards";
import { VolumeChart } from "@/src/components/dashboard/VolumeChart";
import { RecentCallsTable } from "@/src/components/dashboard/RecentCallsTable";
import { AgentActivityList } from "@/src/components/dashboard/AgentActivityList";
import { useDashboardSummary } from "@/src/hooks/queries/dashboard";
import type { DashboardRange } from "@/src/lib/api/resources/dashboard";

function resolveRange(param: string | null): DashboardRange {
  if (param === "24h" || param === "7d" || param === "30d") return param;
  return "7d";
}

export default function DashboardPage() {
  const params = useSearchParams();
  const range = resolveRange(params.get("range"));
  const { data, isLoading } = useDashboardSummary(range);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description="At-a-glance performance across your voice agents."
        actions={<RangeSwitcher current={range} />}
      />
      <KpiCards summary={data} loading={isLoading} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <VolumeChart summary={data} range={range} loading={isLoading} />
        </div>
        <AgentActivityList summary={data} loading={isLoading} />
      </div>
      <RecentCallsTable summary={data} loading={isLoading} />
    </div>
  );
}
