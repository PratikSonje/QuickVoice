"use client";

import Link from "next/link";
import { ArrowRight, Bot } from "lucide-react";
import { Skeleton } from "@/src/components/ui/skeleton";
import { EmptyState } from "@/src/components/common/EmptyState";
import { useAgents } from "@/src/hooks/queries/agents";
import type { DashboardSummary } from "@/src/lib/api/resources/dashboard";

export function AgentActivityList({
  summary,
  loading,
}: {
  summary?: DashboardSummary;
  loading?: boolean;
}) {
  const { data: agents } = useAgents();
  const nameFor = (id: string | null) =>
    agents?.find((a) => a.agentId === id)?.name ?? "Unassigned";

  const top = summary?.topAgents ?? [];
  const max = top[0]?.count ?? 1;

  return (
    <div className="rounded-2xl border bg-card">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <h3 className="text-sm font-semibold text-foreground">Top agents</h3>
        <Link
          href="/agents"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          Manage <ArrowRight className="size-3" />
        </Link>
      </div>
      {loading ? (
        <div className="space-y-3 p-5">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : !top.length ? (
        <EmptyState
          icon={Bot}
          title="No agent activity"
          description="Create an agent and connect it to a number to see activity."
          className="border-0"
        />
      ) : (
        <div className="space-y-3 p-5">
          {top.map((a) => {
            const pct = Math.max(6, Math.round((a.count / max) * 100));
            return (
              <div key={a.agentId ?? "unknown"} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate font-medium">{nameFor(a.agentId)}</span>
                  <span className="text-xs text-muted-foreground">
                    {a.count} calls · {a.minutes}m
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
